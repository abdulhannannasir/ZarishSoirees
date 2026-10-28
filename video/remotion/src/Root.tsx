import { Composition } from "remotion";
import { SmokeTest, SMOKE_TEST } from "./SmokeTest";

export const RemotionRoot = () => {
  return (
    <Composition
      id="SmokeTest"
      component={SmokeTest}
      durationInFrames={SMOKE_TEST.durationInFrames}
      fps={SMOKE_TEST.fps}
      width={1920}
      height={1080}
    />
  );
};
