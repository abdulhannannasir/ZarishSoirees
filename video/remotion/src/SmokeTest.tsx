import { Audio } from "@remotion/media";
import { Star } from "@remotion/shapes";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const SCENE_A_FRAMES = 90;
const SCENE_B_FRAMES = 120;
const TRANSITION_FRAMES = 30;
const FPS = 30;

export const SMOKE_TEST = {
  fps: FPS,
  // Scenes overlap by the transition length.
  durationInFrames: SCENE_A_FRAMES + SCENE_B_FRAMES - TRANSITION_FRAMES,
} as const;

const stage: React.CSSProperties = {
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Inter, sans-serif",
  color: "#ffffff",
};

const SceneA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 6, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        ...stage,
        background: "linear-gradient(135deg, #0b1020 0%, #1b2a5c 100%)",
      }}
    >
      <h1
        style={{
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          margin: 0,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
        }}
      >
        Remotion render OK
      </h1>
      <p style={{ fontSize: 44, color: "#9fb4ff", margin: 0, opacity: enter }}>
        Remotion &middot; React &middot; FFmpeg
      </p>
    </AbsoluteFill>
  );
};

const SceneB = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, SCENE_B_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        ...stage,
        background: "linear-gradient(135deg, #1b2a5c 0%, #0b1020 100%)",
      }}
    >
      <div style={{ transform: `rotate(${frame * 4}deg)` }}>
        <Star points={5} innerRadius={70} outerRadius={150} fill="#5b8cff" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 360,
          top: 900,
          width: 1200,
          height: 12,
          borderRadius: 6,
          background: "rgba(255, 255, 255, 0.15)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: 12,
            borderRadius: 6,
            background: "#5b8cff",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const SmokeTest = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_A_FRAMES}>
          <SceneA />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE_B_FRAMES}>
          <SceneB />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio src={staticFile("smoke-tone.mp3")} volume={0.3} />
    </AbsoluteFill>
  );
};
