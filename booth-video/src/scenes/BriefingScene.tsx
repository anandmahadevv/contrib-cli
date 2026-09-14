import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

export const BriefingScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Opacity fade
  const opacity = interpolate(frame, [0, 15, 165, 180], [0, 1, 1, 0], { extrapolateRight: "clamp" })

  // Scale spring
  const scale = spring({
    frame,
    fps,
    config: { stiffness: 100, damping: 15 },
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
      <div
        style={{
          transform: `scale(${scale})`,
          width: "100%",
          maxWidth: "1200px",
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "40px",
        }}
      >
        {/* Left: 3 Briefing Artifacts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              border: "2px solid #ea580c",
              backgroundColor: "rgba(234, 88, 12, 0.15)",
              color: "#ea580c",
              padding: "6px 16px",
              fontSize: "14px",
              fontWeight: "bold",
              letterSpacing: "0.15em",
              alignSelf: "flex-start",
            }}
          >
            🤖 AI BRIEFING ENGINE (.contrib/)
          </div>

          <h2 style={{ fontSize: "40px", fontWeight: "900", margin: 0, textTransform: "uppercase", lineHeight: 1.1 }}>
            AUTOMATED <br />
            <span style={{ color: "#ea580c" }}>AI CONTEXT FUSION</span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ border: "1px solid #3f3f46", backgroundColor: "#18181b", padding: "16px" }}>
              <div style={{ color: "#ea580c", fontWeight: "bold", fontSize: "16px" }}>📄 context.json</div>
              <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>Machine-readable stack, build commands & test tooling</div>
            </div>

            <div style={{ border: "1px solid #3f3f46", backgroundColor: "#18181b", padding: "16px" }}>
              <div style={{ color: "#ea580c", fontWeight: "bold", fontSize: "16px" }}>📌 ISSUE.md</div>
              <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>Raw issue details, reproduction steps & discussions</div>
            </div>

            <div style={{ border: "1px solid #ea580c", backgroundColor: "#18181b", padding: "16px" }}>
              <div style={{ color: "#10b981", fontWeight: "bold", fontSize: "16px" }}>⚡ AI_PROMPT.md</div>
              <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>Focus area target paths + CONTRIBUTING.md synthesis</div>
            </div>
          </div>
        </div>

        {/* Right: Antigravity IDE Testimonial Box */}
        <div
          style={{
            border: "2px solid #ffffff",
            backgroundColor: "#ffffff",
            color: "#09090b",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "10px 10px 0px 0px #ea580c",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#ea580c", letterSpacing: "0.15em" }}>
              // ANTIGRAVITY IDE ANALYSIS:
            </div>

            <blockquote style={{ fontSize: "20px", fontWeight: "700", lineHeight: 1.4, margin: 0, fontStyle: "italic" }}>
              &ldquo;The <span style={{ color: "#ea580c" }}>focus_areas</span> extraction pulls specific code references out of the issue body... <span style={{ backgroundColor: "#ea580c", color: "#ffffff", padding: "2px 6px" }}>That&apos;s what let me skip 80% of discovery.</span>&rdquo;
            </blockquote>

            <p style={{ fontSize: "14px", color: "#52525b", margin: 0 }}>
              &ldquo;.contrib eliminates the cold start by doing that translation once per issue, offline, deterministically.&rdquo;
            </p>
          </div>

          <div style={{ borderTop: "2px solid #e4e4e7", paddingTop: "16px", marginTop: "24px", fontSize: "14px", fontWeight: "bold", color: "#18181b" }}>
            ✓ VERIFIED IN ANTIGRAVITY IDE WORKSPACE
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
