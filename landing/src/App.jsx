import React, { useState, useEffect } from 'react';
import {
  Star,
  ChevronDown,
  BarChart3,
  BookOpen,
  Users,
  Rocket,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  ArrowRight,
  GitPullRequest,
  Terminal,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyse');
  const [isContribMode, setIsContribMode] = useState(false);

  // Auto-cycle tabs every 4 seconds
  useEffect(() => {
    const tabs = ['analyse', 'train', 'testing', 'deploy'];
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const nextIndex = (tabs.indexOf(prev) + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-black selection:text-white">
      {/* Top Banner / Mode Toggle for Contrib / Stellar */}
      <div className="bg-gray-50 border-b border-gray-200 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-3">
        <span className="text-gray-500">Previewing:</span>
        <button
          onClick={() => setIsContribMode(false)}
          className={`px-2.5 py-0.5 rounded-full font-medium transition-all ${
            !isContribMode
              ? 'bg-black text-white shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Stellar.ai Template
        </button>
        <button
          onClick={() => setIsContribMode(true)}
          className={`px-2.5 py-0.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
            isContribMode
              ? 'bg-black text-white shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <Terminal className="w-3 h-3" />
          Contrib.ai (CLI Edition)
        </button>
      </div>

      {/* NAVIGATION (animationDelay: 0.1s) */}
      <header
        className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto animate-fade-in-up"
        style={{ animationDelay: '0.1s', opacity: 0 }}
      >
        {/* Left: Star + Brand */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Star className="w-5 h-5 fill-black text-black" />
          <span className="text-lg font-semibold tracking-tight">
            {isContribMode ? 'Contrib.ai' : 'Stellar.ai'}
          </span>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition-colors">
            {isContribMode ? 'Workspaces' : 'Solutions'}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition-colors">
            For Teams
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <a
            href="#about"
            className="text-sm text-gray-700 hover:text-black transition-colors"
          >
            About Us
          </a>
          <a
            href="#learn"
            className="text-sm text-gray-700 hover:text-black transition-colors"
          >
            {isContribMode ? 'CLI Docs' : 'Learn Hub'}
          </a>
        </nav>

        {/* Right: Login + CTA */}
        <div className="flex items-center gap-5">
          <a
            href="#login"
            className="text-sm text-gray-700 hover:text-black transition-colors"
          >
            Login
          </a>
          <button className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            {isContribMode ? 'Install CLI' : 'Get started free'}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="px-6 pt-24 pb-32 max-w-7xl mx-auto text-center">
        {/* Reviews Badge (delay: 0.2s) */}
        <div
          className="inline-flex items-center gap-2 mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.2s', opacity: 0 }}
        >
          <div className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center bg-white shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-black text-black" />
          </div>
          <span className="text-sm font-medium text-black">
            {isContribMode
              ? '4.9 rating from 18.3K+ contributors'
              : '4.9 rating from 18.3K+ users'}
          </span>
        </div>

        {/* Main Heading (delay: 0.3s) */}
        <h1
          className="text-6xl md:text-7xl lg:text-[80px] font-normal leading-[1.1] tracking-tight mb-5 animate-fade-in-up"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          <span className="block">
            {isContribMode ? 'Clone Less. Ship Faster.' : 'Work Smarter. Move Faster.'}
          </span>
          <span className="bg-gradient-to-r from-black via-gray-500 to-gray-400 bg-clip-text text-transparent">
            {isContribMode ? 'Blobless Git Powers You Up.' : 'AI Powers You Up.'}
          </span>
        </h1>

        {/* Subheading (delay: 0.4s) */}
        <p
          className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: '0.4s', opacity: 0 }}
        >
          {isContribMode
            ? 'Intelligent blobless automation syncs with GitHub to isolate issues, stream repositories on demand, and save hours of bandwidth.'
            : 'Intelligent automation syncs with the tools you love to streamline tasks, boost output, and save time.'}
        </p>

        {/* CTA Button (delay: 0.5s) */}
        <div
          className="mb-12 animate-fade-in-up"
          style={{ animationDelay: '0.5s', opacity: 0 }}
        >
          <button className="bg-black text-white px-8 py-3 rounded-full text-base font-medium hover:bg-gray-800 transition-colors shadow-md inline-flex items-center gap-2 group">
            {isContribMode ? 'npx gsoc-contrib start' : 'Begin Free Trial'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Tab Bar (delay: 0.6s) */}
        <div
          className="mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.6s', opacity: 0 }}
        >
          {/* Mobile Tab Bar (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl max-w-xs mx-auto md:hidden">
            <button
              onClick={() => setActiveTab('analyse')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all ${
                activeTab === 'analyse'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analyse
            </button>
            <button
              onClick={() => setActiveTab('train')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all ${
                activeTab === 'train'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Train
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all ${
                activeTab === 'testing'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Users className="w-4 h-4" />
              Testing
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all ${
                activeTab === 'deploy'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Deploy
            </button>
          </div>

          {/* Desktop Tab Bar (Horizontal Row with Dividers) */}
          <div className="hidden md:inline-flex items-center bg-gray-100 rounded-full p-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab('analyse')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition-all ${
                activeTab === 'analyse'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analyse
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={() => setActiveTab('train')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition-all ${
                activeTab === 'train'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Train
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={() => setActiveTab('testing')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition-all ${
                activeTab === 'testing'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Users className="w-4 h-4" />
              Testing
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition-all ${
                activeTab === 'deploy'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Deploy
            </button>
          </div>
        </div>

        {/* Video + Overlay Section (delay: 0.7s) */}
        <div
          className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] shadow-2xl border border-gray-200/80 animate-fade-in-up"
          style={{ animationDelay: '0.7s', opacity: 0 }}
        >
          {/* Background Video */}
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* 4 Conditional Overlays */}

          {/* Tab A: Analyse Overlay */}
          {activeTab === 'analyse' && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in-overlay flex items-center justify-center p-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/40 animate-slide-up-overlay text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {isContribMode
                          ? 'Set Up Contribution Workspace'
                          : 'Set Up Your AI Workspace'}
                      </h3>
                      <p className="text-xs text-gray-500">Step 1 of 4 • Configuration</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    25% Complete
                  </span>
                </div>

                {/* Purple Progress Bar (25%) */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: '25%' }}
                  />
                </div>

                {/* 4 Steps */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-purple-50/50 border border-purple-100">
                    <div className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      1
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {isContribMode ? 'Parse GitHub Issue' : 'Connect Data Sources'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isContribMode
                          ? 'Resolves title, description, and tags from GitHub REST API'
                          : 'Auto-syncs schema and historical training telemetry'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/80">
                    <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      2
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {isContribMode ? 'Allocate Blobless Git Mirror' : 'Configure Model Weights'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {isContribMode
                          ? 'Downloads tree metadata only (--filter=blob:none)'
                          : 'Select precision and hyperparameter matrix'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/80">
                    <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      3
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {isContribMode ? 'Generate .contrib/ISSUE.md' : 'Pipeline Parallelism'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {isContribMode
                          ? 'Pre-computes candidate edit files and test commands'
                          : 'Distribute shards across available cluster nodes'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/80">
                    <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      4
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {isContribMode ? 'Launch Workspace Sandbox' : 'Finalize & Deploy'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {isContribMode
                          ? 'Ready in ~/.contrib/workspaces in < 2 seconds'
                          : 'Generate production ready inferencing endpoint'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab B: Train Overlay */}
          {activeTab === 'train' && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in-overlay flex items-center justify-center p-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/40 animate-slide-up-overlay text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {isContribMode ? 'Workspace Intelligence' : 'AI Model Training'}
                      </h3>
                      <p className="text-xs text-gray-500">Live compute metrics</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                    67% Progress
                  </span>
                </div>

                {/* Orange Progress Bar (67%) */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: '67%' }}
                  />
                </div>

                {/* 4 Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                    <div className="text-xs text-gray-500">
                      {isContribMode ? 'Bandwidth Saved' : 'Training Loss'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">
                      {isContribMode ? '94.2%' : '0.0418'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      {isContribMode ? '↓ 1.8 GB blobless' : '↓ -12.4% vs baseline'}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                    <div className="text-xs text-gray-500">
                      {isContribMode ? 'Sparse Scope' : 'Epoch Progress'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">
                      {isContribMode ? '67 / 100 Files' : '67 / 100'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {isContribMode ? 'Cone mode enabled' : 'Est. 12m remaining'}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                    <div className="text-xs text-gray-500">
                      {isContribMode ? 'Git Speed' : 'Throughput'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">
                      {isContribMode ? '1.2s init' : '2,480 tok/s'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      {isContribMode ? '↑ 14x vs full clone' : 'Optimal hardware utilization'}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                    <div className="text-xs text-gray-500">
                      {isContribMode ? 'Local Footprint' : 'Memory Usage'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">
                      {isContribMode ? '18 MB' : '14.2 GB'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {isContribMode ? 'Zero blob bloat' : '24 GB VRAM Pool'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab C: Testing Overlay */}
          {activeTab === 'testing' && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in-overlay flex items-center justify-center p-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/40 animate-slide-up-overlay text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Test Suite Results
                      </h3>
                      <p className="text-xs text-gray-500">Continuous integration check</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    127/127 Passed
                  </span>
                </div>

                {/* Green Success Bar (100%) */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Test breakdown */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-800">Unit Test Suites</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">
                      84 / 84 passing
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-800">
                        Integration & Sparse Git
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">
                      32 / 32 passing
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-800">
                        Security & Sandboxing
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">
                      11 / 11 passing
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
                  <span>Execution Time: 3.42s</span>
                  <span className="text-emerald-600 font-medium">0 Flaky Tests</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab D: Deploy Overlay */}
          {activeTab === 'deploy' && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in-overlay flex items-center justify-center p-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/40 animate-slide-up-overlay text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {isContribMode ? 'Deploy to Upstream PR' : 'Deploy to Production'}
                      </h3>
                      <p className="text-xs text-gray-500">Ready for release</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Ready
                  </span>
                </div>

                {/* 4 Checklist Items */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {isContribMode
                        ? 'Clean git working tree (0 uncommitted files)'
                        : 'Pre-flight container builds validated'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {isContribMode
                        ? 'Upstream rebase verified (0 merge conflicts)'
                        : 'Edge replication active across 24 regions'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {isContribMode
                        ? 'npm audit & credential redaction passed'
                        : 'SSL/TLS certificates renewed and attached'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {isContribMode
                        ? 'Branch pushed to personal GitHub fork'
                        : 'Automated health-check pings 200 OK'}
                    </span>
                  </div>
                </div>

                {/* Deploy Now Button */}
                <button className="w-full bg-black text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4" />
                  {isContribMode ? 'Submit Pull Request' : 'Deploy Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Company Logos (delay: 0.8s) */}
        <div
          className="mt-24 flex items-center justify-center gap-10 md:gap-16 flex-wrap opacity-70 animate-fade-in-up select-none"
          style={{ animationDelay: '0.8s', opacity: 0 }}
        >
          {/* INTERSCOPE */}
          <span className="font-extrabold tracking-[0.25em] text-sm md:text-base text-gray-800 hover:opacity-100 transition-opacity">
            INTERSCOPE
          </span>

          {/* SPOTIFY */}
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm md:text-base text-gray-800 hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.435-5.308-1.76-8.793-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.808-.87 7.076-.51 9.722 1.113.294.18.386.562.207.857zm1.224-2.72c-.226.367-.707.483-1.074.257-2.69-1.653-6.79-2.133-9.97-1.168-.413.125-.853-.106-.978-.52-.125-.413.106-.853.52-.978 3.637-1.103 8.147-.568 11.245 1.335.367.226.483.707.257 1.074zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.494.15-1.018-.13-1.168-.624-.15-.494.13-1.018.624-1.168 3.532-1.072 9.404-.866 13.115 1.337.445.264.59.838.327 1.282-.264.444-.838.59-1.282.326z" />
            </svg>
            <span>SPOTIFY</span>
          </div>

          {/* Nexera (dot grid) */}
          <div className="flex items-center gap-2 text-sm md:text-base font-semibold tracking-wider text-gray-800 hover:opacity-100 transition-opacity">
            <div className="grid grid-cols-3 gap-0.5">
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
            </div>
            <span>NEXERA</span>
          </div>

          {/* M3 (serif italic) */}
          <span className="font-serif italic font-semibold text-lg md:text-xl text-gray-800 hover:opacity-100 transition-opacity">
            M³
          </span>

          {/* LAURA COLE (LC circle) */}
          <div className="flex items-center gap-1.5 text-xs md:text-sm tracking-[0.2em] font-medium text-gray-800 hover:opacity-100 transition-opacity">
            <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[9px] font-bold">
              LC
            </div>
            <span>LAURA COLE</span>
          </div>

          {/* vertex (dots) */}
          <div className="flex items-center gap-1.5 lowercase tracking-wider text-sm md:text-base font-mono text-gray-800 hover:opacity-100 transition-opacity">
            <span className="inline-flex gap-0.5 text-xs">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </span>
            <span>vertex</span>
          </div>
        </div>
      </main>
    </div>
  );
}
