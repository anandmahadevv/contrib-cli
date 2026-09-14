import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Progress bar animation from 0% to 85% over 100 frames
  const progress = interpolate(frame, [0, 100], [5, 88], { extrapolateRight: "clamp" })

  // Opacity fade in and fade out
  const opacity = interpolate(frame, [0, 15, 105, 120], [0, 1, 1, 0], { extrapolateRight: "clamp" })

  // Scale zoom
  const scale = spring({
    frame,
    fps,
    config: { damping: 15 },
  })

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: "#09090b",
        fontFamily: "'Courier New', Courier, monospace",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
      }}
    >
      {/* Background Dot Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(#27272a 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          opacity: 0.4,
        }}
      />

      <div
        style={{
          transform: `scale(${scale})`,
          width: "100%",
          maxWidth: "1100px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* Warning Badge */}
        <div
          style={{
            alignSelf: "flex-start",
            border: "2px solid #ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            padding: "8px 20px",
            fontSize: "18px",
            fontWeight: "bold",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          ⚠️ THE TRADITIONAL OPEN-SOURCE BOTTLENECK
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "900",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          STOP WASTING TIME ON <br />
          <span style={{ color: "#ef4444" }}>HEAVY MONOLITHIC CLONES</span>
        </h1>

        {/* Simulated Slow Git Clone Terminal Window */}
        <div
          style={{
            border: "2px solid #3f3f46",
            backgroundColor: "#18181b",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxShadow: "10px 10px 0px 0px #ef4444",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", color: "#a1a1aa" }}>
            <span>$ git clone https://github.com/large-org/monorepo.git</span>
            <span style={{ color: "#ef4444", fontWeight: "bold" }}>WAITING... (68.4s)</span>
          </div>

          {/* Progress Bar Container */}
          <div
            style={{
              width: "100%",
              height: "28px",
              border: "2px solid #ef4444",
              backgroundColor: "#09090b",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#ef4444",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", color: "#ef4444" }}>
            <span>Downloading blobs: 450 MB / 1.2 GB</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
