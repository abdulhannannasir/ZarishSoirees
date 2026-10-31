# Video toolchain

Two independent ways to make video from code, plus FFmpeg for everything in between.
Both projects are self-contained and excluded from the Next.js app's `lint`, `typecheck` and Docker build
(otherwise root `tsc` also walks the ~700 files inside `video/*/node_modules`).

| Project | What it is | Authoring | Output |
| --- | --- | --- | --- |
| [`hyperframes/`](./hyperframes) | [HyperFrames](https://hyperframes.heygen.com) — HTML + GSAP timelines rendered by headless Chrome | HTML / CSS / GSAP | MP4, WebM, MOV (alpha), GIF, HLS, PNG sequence |
| [`remotion/`](./remotion) | [Remotion](https://www.remotion.dev) — React components rendered frame by frame | React / TypeScript | MP4, WebM, ProRes, GIF, stills, audio |

## Setup and verification

```bash
npm run video:setup            # install everything (idempotent)
npm run video:verify           # render both smoke tests and check the output
npm run video:verify -- --voice  # also run the TTS -> Whisper round trip (~1 min)
```

`video:verify` renders a 6 s composition with each tool and asserts: H.264 1920x1080 video, AAC audio,
duration, audible audio, and that frames actually change over time. It exits non-zero on any failure.

## What is installed

| Piece | Version | Notes |
| --- | --- | --- |
| Node.js | >= 22 | Required by HyperFrames. (The Next.js app itself asks for 24.) |
| FFmpeg / FFprobe | system (6.1.1 here) | Needs `libx264`, `aac`, `libvpx-vp9`, `prores_ks`. Used by HyperFrames. |
| HyperFrames CLI | 0.8.212 (pinned) | Local devDependency (lockfile) at the same version its `npm run` scripts pin. |
| Remotion | 4.0.539 (pinned) | All `@remotion/*` packages must be the *same exact version*. Ships its own `ffmpeg`/`ffprobe`, so it does not need the system one. |
| Headless Chrome | managed by each tool | HyperFrames: `~/.cache/hyperframes/chrome` (152). Remotion: `video/remotion/node_modules/.remotion`. Both download on first use; `video:setup` prefetches them. |
| Kokoro TTS | `kokoro-onnx` in `video/.venv` | Local voiceover. HyperFrames finds it via `HYPERFRAMES_PYTHON` (set by `npm run tts`). |
| Whisper | installed by HyperFrames on first `transcribe` | Local captions / word-level timestamps. |
| HyperFrames agent skills | `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use` | Installed **globally** to `~/.claude/skills` and `~/.agents/skills`, so a fresh container needs `video:setup` again. Restart the agent after installing. |

Remotion extras installed: `bundler`, `renderer`, `media`, `transitions`, `shapes`, `paths`, `motion-blur`,
`media-utils`, `captions`, `google-fonts`, `layout-utils`, `noise`.

## Everyday commands

HyperFrames (`cd video/hyperframes`):

```bash
npm run dev                                 # Studio preview in the browser (foreground)
npm run check                               # lint + runtime + layout + motion + contrast
npx hyperframes snapshot --at 1,3,5         # PNG frames to look at before rendering
npm run render                              # render index.html to renders/*.mp4
npx hyperframes render -c compositions/smoke-test.html -o renders/smoke.mp4
npm run tts -- "Your script" -o assets/voice.wav
npm run transcribe -- assets/voice.wav      # writes transcript.json
```

Remotion (`cd video/remotion`):

```bash
npm run studio                              # Studio on http://localhost:3100 (3000 is the Next.js app)
npm run render                              # SmokeTest -> out/smoke-test.mp4
npm run still                               # one frame -> out/smoke-test.png
npm run compositions                        # list compositions
npx remotion render src/index.ts <CompositionId> out/<name>.mp4 --codec=h264
```

## Things worth knowing

- **Remotion license.** Remotion is source-available, not MIT: free for individuals and small teams, but larger
  companies need a paid license. Check <https://www.remotion.dev/license> against your use. HyperFrames is Apache-2.0.
- **`npm audit` reports 10 high-severity findings in `video/remotion`.** They are all one issue, in `zod` (memory
  exhaustion when validating oversized collections), pulled in through Remotion Studio's own dependencies.
  Remotion pins `zod` to exactly 4.5.4 and warns about any other version ("Version mismatch ... failed renders and
  unclear errors"), so this repo stays on the supported pin (an `overrides` entry to a patched zod was tried and
  reverted for that reason). It is not reachable here: nothing feeds untrusted input
  to a zod schema. Re-check after upgrading Remotion; do not run `npm audit fix --force` (it proposes a downgrade to 4.0.277).
- **`zod@4.5.4` is a direct dependency of `video/remotion` on purpose; do not remove it.** Remotion checks the
  version of whichever `zod` Node resolves from the project root. Without a copy of its own, resolution walks up into
  the Next.js app's `node_modules` (which has 4.3.6, via `shadcn` and `eslint-plugin-react-hooks`) and Remotion prints
  the version-mismatch warning on every command once someone runs `npm install` at the repo root.
- **HyperFrames telemetry** is switched off by `video:setup`. Turn it back on with `npx hyperframes telemetry enable`.
- **Not installed** (optional): MusicGen background-music fallback (needs a multi-GB PyTorch stack), Parakeet ASR
  (`npx hyperframes models install parakeet`; Whisper already covers transcription), and Docker-based deterministic
  renders (`render --docker`).
- **Network at render time.** HyperFrames compositions load GSAP from jsDelivr (this worked through the sandbox
  proxy). `@remotion/google-fonts` is installed but was not exercised: it fetches fonts from Google Fonts. The smoke
  tests use the locally installed Inter font, so they need no font download.
- **Port map.** Next.js `3000`, Remotion Studio `3100` (fixed in `npm run studio`), HyperFrames Studio picks a free
  port itself (it chose `3002` when tested).
- **Rendering needs headroom.** Each HyperFrames worker is a separate Chrome (~256 MB RAM); Remotion renders with half
  the CPU cores by default.
