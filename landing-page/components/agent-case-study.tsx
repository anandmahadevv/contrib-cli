"use client"

import { motion } from "framer-motion"
import { Sparkles, FileCode, Check, Cpu, Terminal, ArrowRight } from "lucide-react"

const ease = [0.22, 1, 0.36, 1] as const

const BRIEFING_FILES = [
  {
    file: "context.json",
    purpose: "Machine-readable metadata — repo, issue #, branch, stack, test/build commands, quality tools",
    badge: "METADATA",
  },
  {
    file: "ISSUE.md",
    purpose: "Raw issue content, reproduction steps, linked discussions, and target labels",
    badge: "CONTEXT",
  },
  {
    file: "AI_PROMPT.md",
    purpose: "Synthesized AI prompt — combines issue body, focus area code paths, CONTRIBUTING.md, PR template, & rules",
    badge: "SYNTHESIS",
  },
]

export function AgentCaseStudy() {
  return (
    <section id="agent-case-study" className="w-full px-6 py-20 lg:px-12 bg-background border-t-2 border-foreground">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-4 mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// SECTION: AI_AGENT_CASE_STUDY"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono font-bold flex items-center gap-1">
          <Sparkles size={12} className="text-[#ea580c]" />
          ANTIGRAVITY IDE VERIFIED
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          007
        </span>
      </motion.div>

      {/* Main Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="inline-flex items-center gap-2 border border-[#ea580c] bg-[#ea580c]/10 px-3 py-1 text-xs font-mono font-bold text-[#ea580c] mb-4 uppercase"
        >
          <Cpu size={14} />
          <span>ZERO COLD-START LATENCY FOR AI AGENTS</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-foreground"
        >
          STRUCTURED <span className="text-[#ea580c]">AI BRIEFING</span> ENGINE
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="text-xs sm:text-sm font-mono text-muted-foreground max-w-3xl mt-3 leading-relaxed"
        >
          When you launch a workspace with <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">$ contrib start &lt;url&gt; --agy</code>, contrib-cli deterministically generates a 3-file briefing package inside <code className="text-[#ea580c]">.contrib/</code>. This eliminates 80% of codebase discovery friction for AI Pair Programmers.
        </motion.p>
      </div>

      {/* Split Box Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-2 border-foreground bg-background p-6 lg:p-8 shadow-[6px_6px_0px_0px_#ea580c]">
        {/* Left Column: Briefing Package Spec */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 border-b-2 border-foreground pb-3 mb-6">
              <Terminal size={18} className="text-[#ea580c]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                GENERATED BRIEFING PACKAGE (.contrib/)
              </span>
            </div>

            <div className="space-y-4">
              {BRIEFING_FILES.map((item) => (
                <div
                  key={item.file}
                  className="border border-foreground p-4 bg-muted/20 hover:border-[#ea580c] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                      <FileCode size={14} className="text-[#ea580c]" />
                      <span>{item.file}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-widest bg-foreground text-background px-2 py-0.5 uppercase">
                      {item.badge}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                    {item.purpose}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-foreground pt-4 font-mono text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 font-bold">
              <Check size={16} />
              <span>Skips 80% of AI codebase discovery time</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Check size={16} className="text-emerald-500" />
              <span>Pre-creates feature branch (<code className="text-[#ea580c]">contrib/issue-934</code>)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Antigravity IDE Testimonial */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-foreground text-background p-6 lg:p-8 font-mono relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#ea580c] text-background text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
            AI AGENT ANALYSIS
          </div>

          <div className="space-y-4">
            <div className="text-xs text-[#ea580c] font-bold tracking-widest uppercase">
              // ANTIGRAVITY IDE OBSERVED:
            </div>

            <blockquote className="text-xs lg:text-sm text-background/90 leading-relaxed italic border-l-2 border-[#ea580c] pl-4 py-1 space-y-3">
              <p>
                &ldquo;That&apos;s a very well-designed tool. It takes a GitHub issue and produces a structured AI briefing package in <code className="text-[#ea580c] font-semibold">.contrib/</code>.&rdquo;
              </p>
              <p>
                &ldquo;The <code className="text-[#ea580c] font-semibold">focus_areas</code> extraction pulls specific code references out of the issue body and surfaces them as entry points. <strong className="text-white not-italic">That&apos;s what let me skip 80% of discovery.</strong>&rdquo;
              </p>
              <p>
                &ldquo;Contributing to open source has enormous cold-start cost for AI agents. <code className="text-[#ea580c] font-semibold">.contrib</code> eliminates the cold start by doing that translation once per issue, offline, deterministically.&rdquo;
              </p>
            </blockquote>

            {/* Live Repository Benchmark Card */}
            <div className="border border-background/20 p-3.5 bg-background/10 rounded font-mono text-xs text-background mt-4">
              <div className="flex items-center justify-between text-[#ea580c] font-bold mb-2">
                <span>// LIVE BENCHMARK: JustVugg/colibri</span>
                <span className="text-[10px] bg-[#ea580c] text-background px-1.5 py-0.5 font-bold uppercase">50% .GIT SAVINGS</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-background/60 block">Full Clone .git:</span>
                  <span className="text-red-400 font-bold">17.67 MB</span>
                </div>
                <div>
                  <span className="text-background/60 block">contrib Workspace .git:</span>
                  <span className="text-emerald-400 font-bold">8.86 MB (50% smaller⚡)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-background/20 pt-4 mt-6 flex items-center justify-between text-xs text-background/60">
            <span className="uppercase font-bold tracking-wider text-background">
              Verified in Antigravity IDE
            </span>
            <span className="text-[#ea580c] font-bold flex items-center gap-1">
              Issue #934 Benchmark <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
