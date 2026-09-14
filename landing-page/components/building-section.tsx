"use client"

import { motion } from "framer-motion"
import { Zap, Bot, Terminal, Eye, CheckCircle2, Cpu, ArrowUpRight } from "lucide-react"

const ease = [0.22, 1, 0.36, 1] as const

const PILLARS = [
  {
    id: "01",
    icon: Zap,
    title: "ZERO-CLONE WORKSPACE ENGINE",
    badge: "CORE ENGINE",
    description:
      "Sub-3.4s workspace initialization leveraging Git blobless clones (--filter=blob:none) and sparse checkouts. Stop downloading multi-gigabyte repo histories to fix a single line of code.",
    features: [
      "95.4% average bandwidth reduction",
      "91.2% local disk space savings",
      "Automatic branch isolation per issue/PR",
      "Instant workspace status tracking & cleanup",
    ],
    cmd: "contrib start https://github.com/org/repo/issues/101",
  },
  {
    id: "02",
    icon: Bot,
    title: "AI GSOC & ISSUE RECOMMENDER",
    badge: "SMART MATCHING",
    description:
      "AI-powered recommendation engine matching contributor skill sets (languages, domains, experience level) with official GSoC organizations and open contribution opportunities.",
    features: [
      "Interactive quiz mode (contrib recommend)",
      "Skill filtering (--lang python,js --domain ai)",
      "Good-first-issue discoverability across 100+ orgs",
      "Historical GSoC repo indexing & classification",
    ],
    cmd: "contrib recommend --lang python,javascript --level beginner",
  },
  {
    id: "03",
    icon: Terminal,
    title: "ANTIGRAVITY IDE & EDITOR BRIDGE",
    badge: "NATIVE INTEGRATION",
    description:
      "First-class editor launch flags. Open your newly created lightweight workspace instantly in Antigravity IDE (--agy), Neovim, Vim, Helix, Zed, VS Code, or Cursor.",
    features: [
      "Native --agy / --ide / --antigravity flags out of the box",
      "Terminal editor auto-detection (Neovim, Vim, Helix)",
      "One-command open for active workspaces (contrib open --agy)",
      "Cross-platform support (Windows, macOS, Linux)",
    ],
    cmd: "contrib start https://github.com/org/repo/issues/101 --agy",
  },
  {
    id: "04",
    icon: Eye,
    title: "PRE-CLONE ISSUE ANALYZER",
    badge: "METADATA ENGINE",
    description:
      "Inspect GitHub issue context, linked pull requests, labels, and relevant target repository file paths directly from your terminal before cloning a single file.",
    features: [
      "GitHub REST & GraphQL API metadata resolution",
      "Target file impact estimation",
      "Linked PR status and discussion inspection",
      "Offline workspace state caching",
    ],
    cmd: "contrib analyze https://github.com/org/repo/issues/101",
  },
]

export function BuildingSection() {
  return (
    <section id="building" className="w-full px-6 py-20 lg:px-12 bg-background">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-4 mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// SECTION: WHAT_WE_ARE_BUILDING"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono font-bold">
          MISSION ARCHITECTURE
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          003
        </span>
      </motion.div>

      {/* Header Title */}
      <div className="mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-foreground"
        >
          WHAT WE ARE <span className="text-[#ea580c]">BUILDING</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="text-xs sm:text-sm font-mono text-muted-foreground max-w-2xl mt-3 leading-relaxed"
        >
          contrib-cli is engineered to bridge open-source issue discovery, instant zero-clone workspaces, and modern IDE workflows into a single seamless CLI.
        </motion.p>
      </div>

      {/* 2x2 Grid of Building Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PILLARS.map((pillar, i) => {
          const Icon = pillar.icon
          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
              className="group border-2 border-foreground bg-background p-6 lg:p-8 flex flex-col justify-between hover:border-[#ea580c] transition-colors duration-300 shadow-[4px_4px_0px_0px_#18181b] dark:shadow-[4px_4px_0px_0px_#ffffff]"
            >
              <div>
                {/* Card Top Bar */}
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-foreground bg-[#ea580c]/10 text-[#ea580c]">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ea580c]">
                      {pillar.badge}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    [{pillar.id}]
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-mono text-lg lg:text-xl font-bold uppercase text-foreground mb-3 tracking-tight group-hover:text-[#ea580c] transition-colors">
                  {pillar.title}
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-6">
                  {pillar.description}
                </p>

                {/* Bullet feature list */}
                <div className="space-y-2 mb-6 border-t border-border/50 pt-4">
                  {pillar.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 font-mono text-xs">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span className="text-foreground/90">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Command box snippet */}
              <div className="border border-foreground bg-foreground/5 p-3 font-mono text-[11px] flex items-center justify-between text-muted-foreground group-hover:border-[#ea580c] transition-colors">
                <span className="truncate text-foreground font-semibold">$ {pillar.cmd}</span>
                <ArrowUpRight size={14} className="text-[#ea580c] shrink-0 ml-2" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
