# Stellar.ai & Contrib Landing Page

A modern, responsive landing page hero section built with **React**, **Tailwind CSS**, and **Lucide Icons**, implementing the exact Inter font styling, CSS animations, interactive tab switcher, video background, and 4 conditional modal overlays.

## Features

- **Exact Font & Theme**: Inter (weights 400, 500, 600, 700) from Google Fonts, pure white background (`bg-white`), centered container (`max-w-7xl mx-auto`).
- **Custom CSS Keyframe Animations**:
  - `fadeInUp` (`0.6s ease-out forwards`) with staggered `animationDelay` (0.1s to 0.8s) across each section.
  - `fadeInOverlay` (`0.4s ease-out forwards`) for the backdrop.
  - `fadeInDialog` / `animate-slide-up-overlay` (`0.5s ease-out forwards`) for centered modal cards.
- **Auto-cycling Tab Bar**: Cycles every 4 seconds across **Analyse**, **Train**, **Testing**, and **Deploy**. Supports immediate manual tab switching with instant timer restart.
- **Rich Conditional Modal Overlays**:
  1. **Analyse**: "Set Up Your AI Workspace" wizard with purple progress bar at 25% and 4 steps.
  2. **Train**: "AI Model Training" with orange progress bar at 67% and 4 live metrics.
  3. **Testing**: "Test Suite Results" with green progress at 100% and 127/127 passing tests.
  4. **Deploy**: "Deploy to Production" with 4 checklist items and a "Deploy Now" CTA.
- **Company Logos**: INTERSCOPE, SPOTIFY, NEXERA (dot grid), M³ (serif italic), LAURA COLE (LC circle), vertex (dots).
- **Dual-Mode Toggle**: Seamlessly preview both the original **Stellar.ai Template** and the adapted **Contrib.ai (CLI Edition)**.

## Quick Start / How to Run

### Option 1: Open Instantly in Browser (Zero Install)
Simply open `index.html` directly in your browser:
```bash
# Windows PowerShell
Start-Process .\index.html
```

### Option 2: Run Local Dev Server
```bash
npx serve -l 5173 .
# or
npm run dev
```
Then visit [http://localhost:5173](http://localhost:5173).
