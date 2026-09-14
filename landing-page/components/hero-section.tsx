"use client"

import { WorkflowDiagram } from "@/components/workflow-diagram"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  return (
    <section className="relative w-full px-6 pt-6 pb-12 lg:px-16 lg:pt-10 lg:pb-16">
      <div className="flex flex-col items-center text-center">
        
        {/* Live on NPM & PyPI Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="inline-flex items-center gap-3 border-2 border-foreground bg-background px-4 py-1.5 mb-6 text-xs font-mono font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_#ea580c]"
        >
          <span className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-background" />
            WE ARE LIVE ON NPM & PYPI
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-foreground">gsoc-contrib v0.5.3</span>
        </motion.div>

        {/* Top headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease }}
          className="font-pixel text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-2 select-none uppercase"
        >
          SPARSE. BLOBLESS.
        </motion.h1>

        {/* Central Workflow Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="w-full max-w-2xl my-4 lg:my-6"
        >
          <WorkflowDiagram />
        </motion.div>

        {/* Bottom headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.25, ease }}
          className="font-pixel text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-4 select-none uppercase"
          aria-hidden="true"
        >
          CONTRIBUTE.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease }}
          className="text-xs lg:text-sm text-muted-foreground max-w-xl mb-6 leading-relaxed font-mono"
        >
          contrib-cli is the zero-clone workspace engine between GitHub issues and your IDE. Sub-3.4s workspace creation. 95% bandwidth savings. Instant developer onboarding.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigator.clipboard.writeText("npx gsoc-contrib start <issue-url> --agy")}
          className="group flex items-center gap-0 bg-foreground text-background text-xs font-mono tracking-wider uppercase font-bold"
        >
          <span className="flex items-center justify-center w-10 h-10 bg-[#ea580c]">
            <motion.span
              className="inline-flex"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <ArrowRight size={16} strokeWidth={2} className="text-background" />
            </motion.span>
          </span>
          <span className="px-5 py-2.5">
            $ npx gsoc-contrib start &lt;issue-url&gt; --agy
          </span>
        </motion.button>
      </div>
    </section>
  )
}
