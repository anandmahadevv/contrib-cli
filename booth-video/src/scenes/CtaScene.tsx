import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Opacity fade in
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" })

  // Scale spring
  const scale = spring({
    frame,
    fps,
    config: { stiffness: 110, damping: 12 },
  })

  // Pulsing glow
  const glow = interpolate(frame % 30, [0, 15, 30], [0.4, 0.9, 0.4])

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
      <div
        style={{
          transform: `scale(${scale})`,
          width: "100%",
          maxWidth: "1150px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "36px",
        }}
      >
        {/* Version Badge */}
        <div
          style={{
            border: "2px solid #ea580c",
            backgroundColor: "#ea580c",
            color: "#ffffff",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: "bold",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            boxShadow: `0 0 20px rgba(234, 88, 12, ${glow})`,
          }}
        >
          🚀 gsoc-contrib v0.5.3 LIVE ON NPM & PYPI
        </div>

        {/* Big Call To Action Headline */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "900",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          TRY IT INSTANTLY <br />
          <span style={{ color: "#ea580c" }}>IN YOUR TERMINAL</span>
        </h1>

        {/* Primary Command Snippet Box */}
        <div
          style={{
            border: "3px solid #ffffff",
            backgroundColor: "#18181b",
            padding: "28px 48px",
            fontSize: "32px",
            fontWeight: "bold",
            color: "#ffffff",
            boxShadow: "10px 10px 0px 0px #ea580c",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ color: "#ea580c" }}>$</span>
          <span>npx gsoc-contrib start &lt;issue-url&gt; --agy</span>
        </div>

        {/* Live Repo Benchmark Highlight */}
        <div
          style={{
            border: "1px solid #3f3f46",
            backgroundColor: "rgba(24, 24, 27, 0.8)",
            padding: "16px 32px",
            fontSize: "16px",
            color: "#a1a1aa",
            display: "flex",
            gap: "24px",
            alignItems: "center",
            marginTop: "12px",
          }}
        >
          <span style={{ color: "#10b981", fontWeight: "bold" }}>✓ VERIFIED BENCHMARK:</span>
          <span>JustVugg/colibri → <strong>8.86 MB</strong> vs 17.67 MB (.git 50% smaller)</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
