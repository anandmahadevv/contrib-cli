"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Sparkles, Terminal, Cpu, FileCode, Check, Copy, ArrowRight, Zap, Search } from "lucide-react"

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

const SAMPLE_FILES = {
  prompt: `// AI_PROMPT.md (Synthesized Briefing Package)
# Task Briefing: Fix Header Parsing in requests #6000

## Focus Areas
- src/requests/adapters.py (L142-L188)
- src/requests/utils.py (L45-L89)

## Context & Guidelines
- Follow PEP8 styling rules
- Run pytest tests/test_adapters.py before opening PR
- Isolated git branch: contrib/issue-6000`,
  context: `{
  "repo": "psf/requests",
  "issue": 6000,
  "branch": "contrib/issue-6000",
  "stack": "python",
  "testCommand": "pytest",
  "qualityTools": ["flake8", "black"]
}`,
  issue: `# Issue #6000: Header parsing fails on multiline headers

Reproduction:
  import requests
  requests.get('https://httpbin.org/headers', headers={'X-Test': 'line1\\nline2'})

Expected:
  Headers parsed correctly without splitting.`,
}

export function DemoVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentScene, setCurrentScene] = useState(0)
  const [activeTab, setActiveTab] = useState<"prompt" | "context" | "issue">("prompt")
  const [customUrl, setCustomUrl] = useState("https://github.com/JustVugg/colibri/issues/1")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % SCENES.length)
    }, 3500)

    return () => clearInterval(timer)
  }, [isPlaying])

  const active = SCENES[currentScene]

  const handleCopy = () => {
    navigator.clipboard.writeText(`npx gsoc-contrib start ${customUrl} --agy`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-8 border-2 border-foreground bg-background shadow-[10px_10px_0px_0px_#ea580c]">
      {/* Player Top Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-foreground bg-foreground px-4 py-3 text-background font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
            <span className="h-3 w-3 rounded-full bg-yellow-500 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
          </div>
          <span className="font-bold tracking-wider uppercase text-background">
            BOOTH_SHOWCASE_ENGINE_v0.5.3.MP4
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

      {/* Interactive URL Input Simulation Bar */}
      <div className="border-b-2 border-foreground bg-zinc-900 px-4 py-3 font-mono text-xs text-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <Search size={14} className="text-[#ea580c] shrink-0" />
          <span className="text-zinc-400 shrink-0">$ contrib start</span>
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 px-3 py-1 text-white font-mono text-xs w-full focus:outline-none focus:border-[#ea580c]"
            placeholder="Paste any GitHub Issue URL..."
          />
        </div>
        <button
          onClick={handleCopy}
          className="w-full sm:w-auto bg-[#ea580c] hover:bg-white hover:text-black text-black px-4 py-1.5 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span>COPIED COMMAND!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>COPY --AGY COMMAND</span>
            </>
          )}
        </button>
      </div>

      {/* Main Animated Video Screen Area */}
      <div className="relative min-h-[400px] sm:min-h-[480px] bg-[#09090b] text-white p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
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
            VERIFIED IN ANTIGRAVITY IDE
          </div>
        </div>

        {/* Animated Scene Content */}
        <div className="my-auto z-10 py-4">
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
                    <span>$ git clone {customUrl}</span>
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

              {/* Scene 3 Interactive File Inspector */}
              {active.id === 3 && (
                <div className="border border-zinc-700 bg-zinc-950 max-w-2xl font-mono text-xs mt-4">
                  <div className="flex border-b border-zinc-800 bg-zinc-900">
                    {(["prompt", "context", "issue"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                          activeTab === tab
                            ? "border-b-2 border-[#ea580c] text-[#ea580c] bg-zinc-950"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {tab === "prompt" ? "AI_PROMPT.md" : tab === "context" ? "context.json" : "ISSUE.md"}
                      </button>
                    ))}
                  </div>
                  <pre className="p-4 text-zinc-300 overflow-x-auto text-[11px] leading-relaxed max-h-[160px]">
                    {SAMPLE_FILES[activeTab]}
                  </pre>
                </div>
              )}

              {/* Scene 4 Command snippet */}
              {active.id === 4 && (
                <div className="border-2 border-white bg-zinc-900 p-4 max-w-xl font-mono text-xs text-white font-bold flex items-center gap-2 mt-4 shadow-[4px_4px_0px_0px_#ea580c]">
                  <span className="text-[#ea580c]">$</span>
                  <span>npx gsoc-contrib start {customUrl} --agy</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Video Scrubber & Controls */}
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

      {/* Verified Live Metrics HUD Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t-2 border-foreground bg-foreground text-background font-mono p-4 text-xs divide-x-2 divide-background/20">
        <div className="px-4 py-2">
          <span className="text-[10px] text-background/60 block uppercase">Avg Setup Speed</span>
          <span className="text-lg font-bold text-emerald-400">3.4s⚡</span>
        </div>
        <div className="px-4 py-2">
          <span className="text-[10px] text-background/60 block uppercase">Bandwidth Saved</span>
          <span className="text-lg font-bold text-[#ea580c]">95.4%</span>
        </div>
        <div className="px-4 py-2">
          <span className="text-[10px] text-background/60 block uppercase">JustVugg/colibri</span>
          <span className="text-lg font-bold text-emerald-400">50% .git saved</span>
        </div>
        <div className="px-4 py-2">
          <span className="text-[10px] text-background/60 block uppercase">AI Discovery Latency</span>
          <span className="text-lg font-bold text-white">80% Skipped</span>
        </div>
      </div>
    </div>
  )
}
