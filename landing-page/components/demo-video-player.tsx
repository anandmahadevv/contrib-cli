"use client"

import { useState } from "react"
import { Sparkles, Cpu, Check, Copy, Search, Film } from "lucide-react"

export function DemoVideoPlayer() {
  const [customUrl, setCustomUrl] = useState("https://github.com/JustVugg/colibri/issues/1")
  const [copied, setCopied] = useState(false)

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
          <span className="font-bold tracking-wider uppercase text-background flex items-center gap-2">
            <Film size={14} className="text-[#ea580c]" />
            HAILUO_AI_BOOTH_PROMO_4K.MP4
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-bold">
            <Sparkles size={12} /> 60 FPS AI ANIMATION
          </span>
          <span className="border border-background/30 px-2 py-0.5 uppercase font-bold text-background/80">
            BOOTH DISPLAY LOOP
          </span>
        </div>
      </div>

      {/* Interactive URL Command Bar */}
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

      {/* Actual HTML5 Video Container */}
      <div className="relative w-full bg-black flex items-center justify-center overflow-hidden">
        <video
          src="/hailuo_booth_demo.mp4"
          autoPlay
          loop
          muted
          playsInline
          controls
          className="w-full h-auto max-h-[560px] object-contain"
        />
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
