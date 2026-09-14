import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AgentCaseStudy } from "@/components/agent-case-study"
import { BuildingSection } from "@/components/building-section"
import { Footer } from "@/components/footer"

export default function DemoPage() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="pt-6">
        {/* Demo Page Top Banner */}
        <div className="w-full px-6 py-4 bg-[#ea580c] text-background font-mono text-xs font-bold text-center uppercase tracking-widest">
          🎬 DEMO SHOWCASE — GSOC-CONTRIB v0.5.3 | ZERO COLD-START WORKSPACE ENGINE
        </div>

        <HeroSection />
        <AgentCaseStudy />
        <BuildingSection />
      </main>
      <Footer />
    </div>
  )
}
