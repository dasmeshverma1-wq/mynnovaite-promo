import "./index.css";
import { Composition } from "remotion";
import { z } from "zod";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { MyComposition } from "./Composition";
import { TeamBuild } from "./TeamBuild";

// Controls shown in the Studio's right-hand "Props" panel.
//  • motionBlur   — master on/off checkbox
//  • shutterAngle — blur amount (0 = none, 180 = filmic, 360 = max smear)
//  • samples      — sub-frame samples / quality (higher = smoother but slower)
export const myCompSchema = z.object({
  motionBlur: z.boolean(),
  shutterAngle: z.number().min(0).max(360),
  samples: z.number().int().min(2).max(32),
});

// Whole-video motion blur — samples sub-frames so every movement blurs naturally.
// When `motionBlur` is off, the composition renders straight through (faster, crisp).
const MyCompWithOptions: React.FC<z.infer<typeof myCompSchema>> = ({ motionBlur, shutterAngle, samples }) => {
  if (!motionBlur) {
    return <MyComposition />;
  }
  return (
    <CameraMotionBlur shutterAngle={shutterAngle} samples={samples}>
      <MyComposition />
    </CameraMotionBlur>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyCompWithOptions}
        schema={myCompSchema}
        defaultProps={{ motionBlur: true, shutterAngle: 360, samples: 2 }}
        durationInFrames={760}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="TeamBuild"
        component={TeamBuild}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
