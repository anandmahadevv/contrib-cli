import React from "react"
import { AbsoluteFill, Sequence } from "remotion"
import { ProblemScene } from "./scenes/ProblemScene"
import { SolutionScene } from "./scenes/SolutionScene"
import { BriefingScene } from "./scenes/BriefingScene"
import { CtaScene } from "./scenes/CtaScene"

export const BoothVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#09090b" }}>
      {/* Scene 1: Problem (Frames 0-120) */}
      <Sequence from={0} durationInFrames={120}>
        <ProblemScene />
      </Sequence>

      {/* Scene 2: Solution (Frames 120-270) */}
      <Sequence from={120} durationInFrames={150}>
        <SolutionScene />
      </Sequence>

      {/* Scene 3: AI Briefing Engine (Frames 270-450) */}
      <Sequence from={270} durationInFrames={180}>
        <BriefingScene />
      </Sequence>

      {/* Scene 4: CTA & Loop (Frames 450-600) */}
      <Sequence from={450} durationInFrames={150}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  )
}
