"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Monitor, CheckCircle2, Sparkles, Terminal, Cpu } from "lucide-react"

const ease = [0.22, 1, 0.36, 1] as const

const SCENES = [
  {
    id: 1,
    title: "THE TRADITIONAL BOTTLENECK",
    subtitle: "Heavy Monolithic Git Clones",
    badge: "SCENE 01",
    accent: "#ef4444",
    detail: "Cloning 450 MB... 68.4s elapsed (Wasted bandwidth & disk space)",
  },
  {
    id: 2,
    title: "SPARSE. BLOBLESS. CONTRIBUTE.",
    subtitle: "Sub-3.4s Workspace Initialization",
    badge: "SCENE 02",
    accent: "#10b981",
    detail: "95.4% Bandwidth Saved | 91.2% Local Disk Saved",
  },
  {
    id: 3,
    title: "AUTOMATED AI BRIEFING ENGINE",
    subtitle: "0 Cold-Start Latency for AI Agents",
    badge: "SCENE 03",
    accent: "#ea580c",
    detail: "Generates .contrib/ (context.json, ISSUE.md, AI_PROMPT.md) — Skips 80% discovery time",
  },
  {
    id: 4,
    title: "TRY IT INSTANTLY IN YOUR TERMINAL",
    subtitle: "One Command Handoff to Antigravity IDE",
    badge: "SCENE 04",
    accent: "#3b82f6",
    detail: "$ npx gsoc-contrib start <url> --agy | Verified Benchmark: JustVugg/colibri (50% smaller)",
  },
]

export function DemoVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentScene, setCurrentScene] = useState(0)

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % SCENES.length)
    }, 3500)

    return () => clearInterval(timer)
  }, [isPlaying])

  const active = SCENES[currentScene]

  return (
    <div className="w-full max-w-5xl mx-auto my-8 border-2 border-foreground bg-background shadow-[8px_8px_0px_0px_#ea580c]">
      {/* Player Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-foreground bg-foreground px-4 py-3 text-background font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
            <span className="h-3 w-3 rounded-full bg-yellow-500 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
          </div>
          <span className="font-bold tracking-wider uppercase text-background">
            BOOTH_PROMO_ANIMATION_4K.MP4
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-bold">
            <Sparkles size={12} /> 60 FPS
          </span>
          <span className="border border-background/30 px-2 py-0.5 uppercase font-bold text-background/80">
            {active.badge}
          </span>
        </div>
      </div>

      {/* Main Animated Video Screen Area */}
      <div className="relative min-h-[380px] sm:min-h-[460px] bg-[#09090b] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
        {/* Background Dot Grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#3f3f46 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top Watermark / Status */}
        <div className="flex items-center justify-between z-10 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-[#ea580c]" />
            <span className="text-muted-foreground uppercase tracking-widest">
              CONTRIB-CLI v0.5.3 ENGINE
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE BOOTH SHOWCASE
          </div>
        </div>

        {/* Animated Scene Content */}
        <div className="my-auto z-10 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4, ease }}
              className="space-y-4"
            >
              <div
                className="inline-block px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest border"
                style={{
                  borderColor: active.accent,
                  color: active.accent,
                  backgroundColor: `${active.accent}15`,
                }}
              >
                {active.subtitle}
              </div>

              <h2 className="font-mono text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {active.title}
              </h2>

              <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                {active.detail}
              </p>

              {/* Scene 1 Mock Loading Bar */}
              {active.id === 1 && (
                <div className="border border-zinc-700 bg-zinc-900 p-4 max-w-xl font-mono text-xs space-y-2 mt-4">
                  <div className="flex justify-between text-red-400 font-bold">
                    <span>$ git clone https://github.com/large-org/repo.git</span>
                    <span>WAITING... (68.4s)</span>
                  </div>
                  <div className="w-full h-3 border border-red-500 bg-zinc-950 overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500"
                      initial={{ width: "10%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {/* Scene 4 Command snippet */}
              {active.id === 4 && (
                <div className="border-2 border-white bg-zinc-900 p-4 max-w-xl font-mono text-xs text-white font-bold flex items-center gap-2 mt-4 shadow-[4px_4px_0px_0px_#ea580c]">
                  <span className="text-[#ea580c]">$</span>
                  <span>npx gsoc-contrib start &lt;issue-url&gt; --agy</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Video Scrubber & Play Controls */}
        <div className="z-10 border-t border-zinc-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 border border-zinc-700 bg-zinc-800 hover:bg-[#ea580c] hover:text-black transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={() => setCurrentScene(0)}
              className="p-2 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
            <span className="text-zinc-400">
              {isPlaying ? "PLAYING LOOP" : "PAUSED"}
            </span>
          </div>

          {/* Timeline scene dots */}
          <div className="flex items-center gap-2">
            {SCENES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentScene(idx)}
                className={`h-2 transition-all duration-300 ${
                  currentScene === idx ? "w-8 bg-[#ea580c]" : "w-3 bg-zinc-700 hover:bg-zinc-500"
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
