#!/usr/bin/env bash
# Renders a short smoke-test video with each tool and checks the output with ffprobe/ffmpeg.
#
# Usage: scripts/verify-video-tools.sh [--voice]
#   --voice  also run a local text-to-speech -> transcription round trip (slower, ~1 min)
#
# Exits non-zero if any check fails.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VIDEO="$ROOT/video"
LOG="$(mktemp)"
TMP="$(mktemp -d)"
trap 'rm -rf "$LOG" "$TMP"' EXIT

WITH_VOICE=0
[ "${1:-}" = "--voice" ] && WITH_VOICE=1

FAILED=0
ok() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
bad() { printf '  \033[31m✗\033[0m %s\n' "$*"; FAILED=$((FAILED + 1)); }
section() { printf '\n%s\n' "$*"; }

# step "label" cmd... — runs quietly, shows the log tail only on failure.
step() {
  local label="$1"
  shift
  if "$@" >"$LOG" 2>&1; then
    ok "$label"
  else
    bad "$label"
    tail -n 15 "$LOG" | sed 's/^/      /'
  fi
}

# assert_video file — H.264 1920x1080 + AAC, ~6 s, audible, and not a frozen frame.
assert_video() {
  local f="$1" label="$2" v a dur vol m1 m2
  [ -s "$f" ] || { bad "$label: output missing or empty ($f)"; return; }

  v="$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height -of csv=p=0 "$f")"
  [ "$v" = "h264,1920,1080" ] && ok "$label: video is $v" || bad "$label: expected h264,1920,1080 but got '$v'"

  a="$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$f")"
  [ "$a" = "aac" ] && ok "$label: audio is $a" || bad "$label: expected aac audio but got '${a:-none}'"

  dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"
  awk -v d="$dur" 'BEGIN { exit !(d >= 5.9 && d <= 6.2) }' \
    && ok "$label: duration ${dur}s" || bad "$label: duration ${dur}s is outside 5.9-6.2s"

  vol="$(ffmpeg -hide_banner -i "$f" -af volumedetect -vn -f null - 2>&1 | sed -n 's/.*max_volume: \(-\?[0-9.]*\) dB.*/\1/p')"
  awk -v v="${vol:-}" 'BEGIN { exit !(v != "" && v > -60) }' \
    && ok "$label: audio is audible (peak ${vol} dB)" || bad "$label: audio is silent or unreadable (peak '${vol:-?}' dB)"

  m1="$(ffmpeg -v error -ss 0.1 -i "$f" -frames:v 1 -f md5 - 2>/dev/null)"
  m2="$(ffmpeg -v error -ss 4 -i "$f" -frames:v 1 -f md5 - 2>/dev/null)"
  { [ -n "$m1" ] && [ "$m1" != "$m2" ]; } \
    && ok "$label: frames change over time (animation is advancing)" || bad "$label: frame at 0.1s equals frame at 4s"
}

section "System"
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) process.exit(1)' \
  && ok "Node.js $(node -v) (>= 22)" || bad "Node.js 22+ required (found $(node -v))"
if command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then
  ok "$(ffmpeg -version | head -1 | cut -d' ' -f1-3)"
  # Capture first: `grep -q` closing the pipe early would SIGPIPE ffmpeg and fail under pipefail.
  ENCODERS="$(ffmpeg -hide_banner -encoders 2>/dev/null)"
  for enc in libx264 aac libvpx-vp9 prores_ks; do
    grep -q " $enc " <<<"$ENCODERS" \
      && ok "FFmpeg encoder: $enc" || bad "FFmpeg encoder missing: $enc"
  done
else
  bad "ffmpeg / ffprobe not found (run: npm run video:setup)"
fi

section "HyperFrames"
cd "$VIDEO/hyperframes" || exit 1
rm -f renders/verify-smoke.mp4 # a stale file from an earlier run must not mask a failed render
step "lint smoke-test composition" npx hyperframes lint compositions/smoke-test.html
step "render smoke-test composition" npx hyperframes render -c compositions/smoke-test.html -o renders/verify-smoke.mp4 --quiet
assert_video "$VIDEO/hyperframes/renders/verify-smoke.mp4" "hyperframes"

section "Remotion"
cd "$VIDEO/remotion" || exit 1
rm -f out/verify-smoke.mp4
step "typecheck" npx tsc --noEmit
step "render SmokeTest composition" npx remotion render src/index.ts SmokeTest out/verify-smoke.mp4
assert_video "$VIDEO/remotion/out/verify-smoke.mp4" "remotion"

if [ "$WITH_VOICE" = "1" ]; then
  section "Voiceover + captions (local models)"
  cd "$VIDEO/hyperframes" || exit 1
  step "text-to-speech (Kokoro)" env HYPERFRAMES_PYTHON="$VIDEO/.venv/bin/python" \
    npx hyperframes tts "Hello from Hyper Frames. This is a local voice over test." -o "$TMP/speech.wav"
  step "transcribe (Whisper)" npx hyperframes transcribe "$TMP/speech.wav" --dir "$TMP"
  grep -qi "hello" "$TMP/transcript.json" 2>/dev/null \
    && ok "transcript contains the spoken text" || bad "transcript does not contain the spoken text"
fi

section "Result"
if [ "$FAILED" -eq 0 ]; then
  printf '  \033[32mAll checks passed.\033[0m\n'
else
  printf '  \033[31m%d check(s) failed.\033[0m\n' "$FAILED"
  exit 1
fi
