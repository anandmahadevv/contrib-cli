import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Opacity fade
  const opacity = interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0], { extrapolateRight: "clamp" })

  // Scale bounce
  const scale = spring({
    frame,
    fps,
    config: { stiffness: 120, damping: 14 },
  })

  // Flash highlight
  const flash = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: "clamp" })

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
      {/* Screen flash on scene entry */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#ea580c",
          opacity: flash * 0.3,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          transform: `scale(${scale})`,
          width: "100%",
          maxWidth: "1150px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textCenter: "center",
          gap: "36px",
        }}
      >
        {/* Solution Badge */}
        <div
          style={{
            border: "2px solid #10b981",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: "bold",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          ⚡ THE ZERO-CLONE WORKSPACE ENGINE
        </div>

        {/* Big Pixel Text Headline */}
        <h1
          style={{
            fontSize: "76px",
            fontWeight: "900",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            margin: 0,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          SPARSE. BLOBLESS. <br />
          <span style={{ color: "#ea580c" }}>CONTRIBUTE.</span>
        </h1>

        <p style={{ fontSize: "24px", color: "#a1a1aa", margin: 0, textAlign: "center", maxWidth: "850px" }}>
          contrib-cli creates instant, lightweight workspaces in sub-3.4 seconds without downloading gigabytes of repo history.
        </p>

        {/* Metrics Box Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "24px",
            width: "100%",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              border: "2px solid #ea580c",
              backgroundColor: "#18181b",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "6px 6px 0px 0px #ea580c",
            }}
          >
            <span style={{ fontSize: "14px", color: "#a1a1aa", textTransform: "uppercase" }}>Avg Setup Speed</span>
            <span style={{ fontSize: "44px", fontWeight: "bold", color: "#10b981" }}>3.4s⚡</span>
          </div>

          <div
            style={{
              border: "2px solid #ea580c",
              backgroundColor: "#18181b",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "6px 6px 0px 0px #ea580c",
            }}
          >
            <span style={{ fontSize: "14px", color: "#a1a1aa", textTransform: "uppercase" }}>Bandwidth Saved</span>
            <span style={{ fontSize: "44px", fontWeight: "bold", color: "#ea580c" }}>95.4%</span>
          </div>

          <div
            style={{
              border: "2px solid #ea580c",
              backgroundColor: "#18181b",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "6px 6px 0px 0px #ea580c",
            }}
          >
            <span style={{ fontSize: "14px", color: "#a1a1aa", textTransform: "uppercase" }}>Disk Space Saved</span>
            <span style={{ fontSize: "44px", fontWeight: "bold", color: "#ffffff" }}>91.2%</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
