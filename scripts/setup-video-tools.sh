#!/usr/bin/env bash
# Installs and configures the video toolchain used by video/hyperframes and video/remotion:
#   - FFmpeg / FFprobe (system) and Node.js >= 22
#   - HyperFrames and Remotion dependencies (from lockfiles) plus their headless Chrome builds
#   - A Python venv with Kokoro TTS for local voiceover (Whisper installs itself on first `transcribe`)
#   - HyperFrames agent skills (global: ~/.claude/skills and ~/.agents/skills)
# Safe to re-run. Check the result with: npm run video:verify
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VIDEO="$ROOT/video"

say() { printf '\n==> %s\n' "$*"; }

say "Checking system requirements"
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) process.exit(1)' \
  || { echo "Node.js 22+ is required (found $(node -v))" >&2; exit 1; }

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  command -v apt-get >/dev/null 2>&1 \
    || { echo "FFmpeg not found and apt-get is unavailable; install ffmpeg manually." >&2; exit 1; }
  say "Installing FFmpeg"
  SUDO=""
  [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq ffmpeg
fi
ffmpeg -version | head -1

say "Installing HyperFrames"
(
  cd "$VIDEO/hyperframes"
  npm ci
  npx hyperframes browser ensure
  # Anonymous usage telemetry is off by default here; re-enable with `npx hyperframes telemetry enable`.
  npx hyperframes telemetry disable
)

say "Installing Remotion"
(
  cd "$VIDEO/remotion"
  npm ci
  npx remotion browser ensure
)

say "Setting up local voiceover (Kokoro TTS)"
if [ ! -x "$VIDEO/.venv/bin/python" ]; then
  if command -v uv >/dev/null 2>&1; then
    uv venv "$VIDEO/.venv"
  else
    python3 -m venv "$VIDEO/.venv"
  fi
fi
if command -v uv >/dev/null 2>&1; then
  uv pip install --python "$VIDEO/.venv/bin/python" kokoro-onnx soundfile
else
  "$VIDEO/.venv/bin/python" -m pip install kokoro-onnx soundfile
fi

say "Installing HyperFrames agent skills"
(cd "$VIDEO/hyperframes" && npx hyperframes skills update)

say "Done. Run 'npm run video:verify' to render both smoke tests."
