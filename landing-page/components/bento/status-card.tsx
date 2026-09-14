"use client"

import { useEffect, useState } from "react"

const INTEGRATIONS = [
  { name: "ANTIGRAVITY", status: "READY", flag: "--agy" },
  { name: "VS CODE", status: "READY", flag: "--vscode" },
  { name: "NEOVIM", status: "READY", flag: "--nvim" },
  { name: "ZED / HELIX", status: "READY", flag: "--zed" },
  { name: "CURSOR", status: "READY", flag: "--cursor" },
]

export function StatusCard() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
          ide_launchers.status
        </span>
        <span className="text-[10px] tracking-widest text-muted-foreground font-mono">
          {`SYNC:${String(tick).padStart(4, "0")}`}
        </span>
      </div>
      <div className="flex-1 flex flex-col p-4 gap-0">
        {/* Table header */}
        <div className="grid grid-cols-3 gap-2 border-b border-border pb-2 mb-2">
          <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground font-mono">Target IDE</span>
          <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground font-mono">Status</span>
          <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground text-right font-mono">CLI Flag</span>
        </div>
        {INTEGRATIONS.map((item) => (
          <div
            key={item.name}
            className="grid grid-cols-3 gap-2 py-2 border-b border-border last:border-none"
          >
            <span className="text-xs font-mono font-bold text-foreground">{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#ea580c]" />
              <span className="text-xs font-mono text-muted-foreground">{item.status}</span>
            </div>
            <span className="text-xs font-mono text-[#ea580c] font-bold text-right">{item.flag}</span>
          </div>
        ))}
        {/* Capability bar */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between mb-1 font-mono">
            <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground">
              IDE Integration Compatibility
            </span>
            <span className="text-[9px] font-mono text-foreground font-bold">100%</span>
          </div>
          <div className="h-2 w-full border border-foreground">
            <div className="h-full bg-[#ea580c]" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
