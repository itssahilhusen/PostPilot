import React from "react";
import { Composition, registerRoot } from "remotion";
import { LimeScene, LimeSceneProps } from "./LimeScene";
import { SceneRenderer } from "./SceneRenderer";

const defaults: LimeSceneProps = {
  sceneType: "HALO_SPEAKER",
  speakerMode: "halo",
  headline: "MAKE BETTER CONTENT",
  badge: "",
  illustration: "phone",
  illustrationProps: {},
  emphasisWords: [],
  stepNumber: undefined,
  durationInFrames: 30,
};

const LimeSceneComposition: React.FC<LimeSceneProps> = (props) => props.sceneSpec
  ? <SceneRenderer {...props} sceneSpec={props.sceneSpec} />
  : <LimeScene {...props} />;

const Root: React.FC = () => <Composition
  id="LimeScene"
  component={LimeSceneComposition as React.FC<any>}
  width={1080}
  height={1920}
  fps={30}
  durationInFrames={30}
  calculateMetadata={({ props }) => ({ durationInFrames: (props as unknown as LimeSceneProps).durationInFrames })}
  defaultProps={defaults}
/>;

registerRoot(Root);
