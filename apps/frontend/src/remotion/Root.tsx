import React from "react";
import { Composition } from "remotion";
import { PaperStudio } from "./compositions/PaperStudio";
import type { ReelProps } from "./types";

const defaultProps: ReelProps = {
  videoSrc: "/uploads/videos/upl_bxkc7p7_document_6287295426525669257.mp4",
  durationInSeconds: 30,
  styleId: "paper",
  headline: "THE NEW WAY TO",
  subAccent: "SCALE VIDEOS",
  metricLabel: "views this week",
  metricCount: 84200,
  steps: ["Cut", "Layer", "Animate"],
  captionWords: [
    { word: "THE", start: 0.1, end: 0.4 },
    { word: "NEW", start: 0.4, end: 0.7 },
    { word: "WAY", start: 0.7, end: 1.0 },
    { word: "TO", start: 1.0, end: 1.2 },
    { word: "BUILD", start: 1.2, end: 1.6 },
    { word: "REELS", start: 1.6, end: 2.1 },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PaperStudio"
        component={PaperStudio as any}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
    </>
  );
};
