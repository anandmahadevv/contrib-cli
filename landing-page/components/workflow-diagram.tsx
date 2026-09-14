"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const LEFT_LABELS = ["Issue URL", "Blob Filter", "Sparse Tree"]
const RIGHT_LABELS = ["Branch", "IDE Launch", "Fast PR"]

function PillLabel({
  label,
  x,
  y,
  delay,
}: {
  label: string
  x: number
  y: number
  delay: number
}) {
  return (
    <motion.g
      initial={{ opacity: 0, x: x > 400 ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <rect
        x={x}
        y={y}
        width={95}
        height={26}
        rx={13}
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth={1.5}
      />
      <text
        x={x + 47.5}
        y={y + 17}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize={10}
        fontFamily="var(--font-mono), monospace"
        fontWeight={500}
        letterSpacing="0.05em"
      >
        {label}
      </text>
    </motion.g>
  )
}

export function WorkflowDiagram() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[200px] w-full" />
  }

  const centerX = 400
  const centerY = 100

  return (
    <div className="relative w-full max-w-[800px] mx-auto">
      <svg
        viewBox="0 0 800 200"
        className="w-full h-auto"
        role="img"
        aria-label="Workflow diagram showing gsoc-contrib zero-clone architecture pipeline"
      >
        {/* Left lines from center to left labels */}
        {LEFT_LABELS.map((_, i) => {
          const pillX = 60
          const pillY = 30 + i * 60
          return (
            <motion.line
              key={`left-line-${i}`}
              x1={centerX - 70}
              y1={centerY}
              x2={pillX + 95}
              y2={pillY + 13}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
            />
          )
        })}

        {/* Right lines from center to right labels */}
        {RIGHT_LABELS.map((_, i) => {
          const pillX = 645
          const pillY = 30 + i * 60
          return (
            <motion.line
              key={`right-line-${i}`}
              x1={centerX + 70}
              y1={centerY}
              x2={pillX}
              y2={pillY + 13}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
            />
          )
        })}

        {/* Left Pills */}
        {LEFT_LABELS.map((label, i) => (
          <PillLabel
            key={`left-pill-${i}`}
            label={label}
            x={60}
            y={30 + i * 60}
            delay={0.4 + i * 0.1}
          />
        ))}

        {/* Right Pills */}
        {RIGHT_LABELS.map((label, i) => (
          <PillLabel
            key={`right-pill-${i}`}
            label={label}
            x={645}
            y={30 + i * 60}
            delay={0.4 + i * 0.1}
          />
        ))}

        {/* Central Core Box */}
        <motion.g
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <rect
            x={centerX - 70}
            y={centerY - 30}
            width={140}
            height={60}
            fill="hsl(var(--background))"
            stroke="#ea580c"
            strokeWidth={2}
          />
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            fill="hsl(var(--foreground))"
            fontSize={11}
            fontFamily="var(--font-mono), monospace"
            fontWeight={700}
            letterSpacing="0.1em"
          >
            CONTRIB.CLI
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            fill="#ea580c"
            fontSize={8}
            fontFamily="var(--font-mono), monospace"
            fontWeight={600}
            letterSpacing="0.05em"
          >
            ZERO-CLONE ENGINE
          </text>
        </motion.g>
      </svg>
    </div>
  )
}
