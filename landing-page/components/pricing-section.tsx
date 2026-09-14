"use client"

import { useState } from "react"
import { ArrowRight, Check, Copy, Terminal, Zap } from "lucide-react"
import { motion } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

/* ── blinking cursor indicator ── */
function BlinkDot() {
  return <span className="inline-block h-2 w-2 bg-[#ea580c] animate-blink" />
}

export function PricingSection() {
  const [copiedStep1Npm, setCopiedStep1Npm] = useState(false)
  const [copiedStep1Pip, setCopiedStep1Pip] = useState(false)
  const [copiedStep2, setCopiedStep2] = useState(false)

  const copyStep1Npm = () => {
    navigator.clipboard.writeText("npm install -g gsoc-contrib")
    setCopiedStep1Npm(true)
    setTimeout(() => setCopiedStep1Npm(false), 2000)
  }

  const copyStep1Pip = () => {
    navigator.clipboard.writeText("pip install gsoc-contrib")
    setCopiedStep1Pip(true)
    setTimeout(() => setCopiedStep1Pip(false), 2000)
  }

  const copyStep2 = () => {
    navigator.clipboard.writeText("npx gsoc-contrib start https://github.com/psf/requests/issues/6000")
    setCopiedStep2(true)
    setTimeout(() => setCopiedStep2(false), 2000)
  }

  return (
    <section id="quickstart" className="w-full px-6 py-20 lg:px-12">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-4 mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// SECTION: 2_STEP_QUICKSTART"}
        </span>
        <div className="flex-1 border-t border-border" />
        <BlinkDot />
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          006
        </span>
      </motion.div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <div className="inline-block border border-foreground/30 px-3 py-1 text-xs font-mono mb-4 text-[#ea580c] font-bold">
          🟢 LIVE ON NPM & PYPI REGISTRIES
        </div>
        <h2 className="text-3xl lg:text-5xl font-mono font-bold tracking-tight uppercase">
          GET STARTED IN <span className="text-[#ea580c]">2 STEPS</span>
        </h2>
        <p className="text-xs lg:text-sm font-mono text-muted-foreground mt-3 leading-relaxed">
          Install globally via NPM or PyPI (pip), or run instantly with npx.
        </p>
      </motion.div>

      {/* 2 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
        {/* STEP 01: DOWNLOAD / INSTALL (NPM & PyPI) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col border-2 border-foreground p-8 bg-background relative shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]"
        >
          <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-6">
            <span className="text-xs font-mono font-bold tracking-wider text-[#ea580c]">STEP [01]</span>
            <span className="text-[10px] font-mono tracking-widest uppercase bg-foreground text-background px-3 py-1 font-bold">
              DOWNLOAD & INSTALL
            </span>
          </div>

          <h3 className="text-xl font-mono font-bold uppercase mb-2">1. INSTALL (NPM & PYPI)</h3>
          <p className="text-xs font-mono text-muted-foreground mb-6 leading-relaxed">
            `contrib-cli` is published on both NPM and PyPI. Choose your preferred package manager:
          </p>

          {/* Code Command Boxes */}
          <div className="space-y-3 mb-6">
            {/* NPM */}
            <div className="bg-foreground text-background font-mono text-xs p-3.5 rounded flex items-center justify-between font-bold">
              <span>$ npm install -g gsoc-contrib</span>
              <button onClick={copyStep1Npm} className="text-[#ea580c] hover:underline flex items-center gap-1 text-[11px]">
                {copiedStep1Npm ? "COPIED!" : "COPY NPM"} <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PyPI */}
            <div className="bg-muted border border-foreground/30 text-foreground font-mono text-xs p-3.5 rounded flex items-center justify-between font-bold">
              <span>$ pip install gsoc-contrib</span>
              <button onClick={copyStep1Pip} className="text-[#ea580c] hover:underline flex items-center gap-1 text-[11px]">
                {copiedStep1Pip ? "COPIED!" : "COPY PIP"} <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2 mb-8 font-mono text-xs flex-1">
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Published on NPM Registry (`gsoc-contrib`)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Published on PyPI (`pip install gsoc-contrib`)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Instant zero-install mode via `npx gsoc-contrib init`</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-2 font-mono text-xs">
            <a
              href="https://www.npmjs.com/package/gsoc-contrib"
              target="_blank"
              className="flex-1 bg-foreground text-background text-center py-3 font-bold uppercase tracking-wider hover:bg-[#ea580c] transition-colors"
            >
              NPM PACKAGE ↗
            </a>
            <a
              href="https://pypi.org/project/gsoc-contrib/"
              target="_blank"
              className="flex-1 bg-muted border-2 border-foreground text-foreground text-center py-3 font-bold uppercase tracking-wider hover:bg-[#ea580c] hover:text-background transition-colors"
            >
              PYPI PACKAGE ↗
            </a>
          </div>
        </motion.div>

        {/* STEP 02: START WORKSPACE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="flex flex-col border-2 border-foreground p-8 bg-background relative shadow-[6px_6px_0px_0px_#ea580c]"
        >
          <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-6">
            <span className="text-xs font-mono font-bold tracking-wider text-[#ea580c]">STEP [02]</span>
            <span className="text-[10px] font-mono tracking-widest uppercase bg-[#ea580c] text-background px-3 py-1 font-bold">
              START WORKSPACE
            </span>
          </div>

          <h3 className="text-xl font-mono font-bold uppercase mb-2">2. START WORKSPACE</h3>
          <p className="text-xs font-mono text-muted-foreground mb-6 leading-relaxed">
            Pass any GitHub issue URL. `contrib` creates a sparse checkout and opens your IDE in 3.4 seconds.
          </p>

          {/* Code Command Boxes */}
          <div className="space-y-3 mb-6">
            <div className="bg-foreground text-background font-mono text-xs p-4 rounded flex items-center justify-between font-bold">
              <span>$ contrib start &lt;issue-url&gt;</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-muted border border-foreground/20 text-foreground font-mono text-xs p-3 rounded flex items-center justify-between">
              <span>Shorthand: $ contrib contribute owner/repo#123</span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2 mb-8 font-mono text-xs flex-1">
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Fetches blobless commit tree (--filter=blob:none)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Creates feature branch (contrib/fix-issue)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Launches Antigravity IDE / VS Code instantly</span>
            </div>
          </div>

          {/* Copy CTA */}
          <button
            onClick={copyStep2}
            className="w-full bg-[#ea580c] text-background font-mono text-xs py-4 font-bold tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2"
          >
            {copiedStep2 ? "COPIED START COMMAND!" : "COPY STEP 2 START COMMAND"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Auxiliary Commands Ribbon */}
      <div className="max-w-4xl mx-auto border-2 border-foreground p-6 bg-muted/40 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-[#ea580c]">// OTHER HELPER COMMANDS:</span>
          <div className="text-muted-foreground mt-1">
            `contrib analyze &lt;url&gt;` | `contrib recommend` | `contrib open --antigravity`
          </div>
        </div>
        <a
          href="https://github.com/anandmahadevv/contrib-cli#readme"
          target="_blank"
          className="bg-foreground text-background px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#ea580c] transition-colors shrink-0"
        >
          View Full CLI Docs ↗
        </a>
      </div>
    </section>
  )
}
