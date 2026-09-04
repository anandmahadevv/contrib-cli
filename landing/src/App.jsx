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
  Copy,
  Check,
  ExternalLink,
  Search,
  Zap,
  HardDrive,
  Clock,
  Shield,
  Layers,
  FolderGit2,
  RefreshCw,
  GitCompare,
  Trash2,
  Eye,
  Sliders,
  Sparkles,
  Github,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyse');
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Commands Directory
  const commands = [
    {
      name: 'start',
      alias: 'contribute',
      category: 'workspace',
      syntax: 'contrib start <issue-or-pr-url> [options]',
      description:
        'Creates an instant, lightweight contribution workspace for a GitHub issue or PR using blobless cloning or shared git worktrees.',
      options: [
        { flag: '-b, --branch <name>', desc: 'Custom branch name for the issue' },
        { flag: '-w, --worktree', desc: 'Use shared bare repo cache for sub-second setup' },
        { flag: '-s, --sparse', desc: 'Cone sparse checkout for relevant directories only' },
        { flag: '-i, --install', desc: 'Automatically install npm/python/cargo dependencies' },
        { flag: '-o, --open', desc: 'Open workspace in default editor immediately' },
        { flag: '-a, --antigravity', desc: 'Open in Antigravity IDE' },
        { flag: '-c, --code', desc: 'Open in Visual Studio Code' },
        { flag: '--cursor', desc: 'Open in Cursor' },
        { flag: '--fork [user/repo]', desc: 'Configure remote tracking for user personal fork' },
        { flag: '--identity <name>', desc: 'Apply configured Git/SSH identity' },
        { flag: '--offline', desc: 'Operate completely offline using local cache' },
      ],
      example: 'npx gsoc-contrib start https://github.com/psf/requests/issues/6000 --worktree --install',
    },
    {
      name: 'open',
      category: 'workspace',
      syntax: 'contrib open [workspace-id] [options]',
      description:
        'Launches your active contribution workspace in your preferred editor or opens its issue in the browser.',
      options: [
        { flag: '-w, --web', desc: 'Open GitHub issue/PR URL in default browser' },
        { flag: '-a, --antigravity', desc: 'Open in Antigravity IDE (--ide, --agy)' },
        { flag: '-c, --code', desc: 'Open in VS Code' },
        { flag: '--cursor', desc: 'Open in Cursor' },
        { flag: '-n, --nvim', desc: 'Open in Neovim' },
        { flag: '--vim, --helix, --zed', desc: 'Open in Vim, Helix, or Zed' },
        { flag: '--idea, --pycharm', desc: 'Open in IntelliJ IDEA or PyCharm' },
        { flag: '-p, --print', desc: 'Print workspace path to stdout for shell scripts' },
        { flag: '-i, --issue', desc: 'Open .contrib/ISSUE.md specification directly' },
      ],
      example: 'npx gsoc-contrib open psf/requests#6000 --cursor',
    },
    {
      name: 'dashboard',
      alias: 'dash, tui',
      category: 'workspace',
      syntax: 'contrib dashboard',
      description:
        'Launches a full-screen interactive TUI dashboard with single-keystroke workspace navigation, status inspection, and cleanup.',
      options: [
        { flag: 'Arrow keys / j, k', desc: 'Navigate between active workspaces' },
        { flag: 'o / Enter', desc: 'Open selected workspace in editor' },
        { flag: 's', desc: 'Sync and rebase against upstream' },
        { flag: 'd', desc: 'View git diff against upstream/main' },
        { flag: 'c', desc: 'Clean up selected workspace' },
        { flag: 'q / Esc', desc: 'Exit dashboard' },
      ],
      example: 'npx gsoc-contrib dashboard',
    },
    {
      name: 'status',
      category: 'workspace',
      syntax: 'contrib status [options]',
      description:
        'Displays all active contribution workspaces, active git branches, uncommitted dirty files, and disk usage.',
      options: [
        { flag: '--ids', desc: 'Output only workspace IDs (for autocompletion and shell scripts)' },
      ],
      example: 'npx gsoc-contrib status',
    },
    {
      name: 'sync',
      category: 'git',
      syntax: 'contrib sync [workspace-id] [options]',
      description:
        'Fetches latest upstream changes and rebases your issue branch onto upstream/main cleanly.',
      options: [
        { flag: '-p, --push', desc: 'Push rebased branch to your personal fork (origin)' },
        { flag: '--fork', desc: 'Ensure fork remote is configured and push branch' },
      ],
      example: 'npx gsoc-contrib sync psf/requests#6000 --push',
    },
    {
      name: 'diff',
      category: 'git',
      syntax: 'contrib diff [workspace-id] [options]',
      description:
        'Inspects the git diff of changes made on the issue branch against upstream default branch.',
      options: [
        { flag: '-m, --markdown', desc: 'Format diff in Markdown syntax for issue discussions' },
      ],
      example: 'npx gsoc-contrib diff psf/requests#6000',
    },
    {
      name: 'submit',
      alias: 'pr',
      category: 'git',
      syntax: 'contrib submit [workspace-id] [options]',
      description:
        'Performs pre-flight checks, verifies working tree cleanliness, pushes branch, and prepares a GitHub Pull Request.',
      options: [
        { flag: '-t, --title <title>', desc: 'Custom pull request title' },
        { flag: '--body <body>', desc: 'Custom pull request body description' },
      ],
      example: 'npx gsoc-contrib submit psf/requests#6000',
    },
    {
      name: 'identity',
      category: 'git',
      syntax: 'contrib identity <add|list|use|remove> [name] [options]',
      description:
        'Manages multi-account Git and SSH identities (e.g. personal, work, open-source) and switches them per workspace.',
      options: [
        { flag: '-n, --name <name>', desc: 'Full name for git user.name' },
        { flag: '-e, --email <email>', desc: 'Email address for git user.email' },
        { flag: '--ssh-host <host>', desc: 'Custom SSH host alias (e.g. github-personal)' },
        { flag: '--ssh-key <path>', desc: 'Local path to private SSH key for core.sshCommand' },
        { flag: '--signing-key <key>', desc: 'GPG signing key ID for commit.gpgsign' },
      ],
      example: 'npx gsoc-contrib identity add personal --name "Jane Doe" --email "jane@example.com"',
    },
    {
      name: 'search',
      category: 'discovery',
      syntax: 'contrib search [query] [options]',
      description:
        'Queries the GitHub REST API for open contribution opportunities, issues with labels, and starter tasks.',
      options: [
        { flag: '-r, --repo <owner/repo>', desc: 'Target repository' },
        { flag: '-l, --label <label>', desc: 'Filter by label (e.g. "good first issue")' },
        { flag: '-n, --limit <num>', desc: 'Max results to display (default: 10)' },
      ],
      example: 'npx gsoc-contrib search "good first issue" --repo psf/requests',
    },
    {
      name: 'browse',
      category: 'discovery',
      syntax: 'contrib browse [query] [options]',
      description:
        'Interactive command-line issue browser that lets you pick a candidate issue and immediately spawn its workspace.',
      options: [
        { flag: '-r, --repo <owner/repo>', desc: 'Filter by repository' },
        { flag: '-l, --label <label>', desc: 'Filter by label' },
      ],
      example: 'npx gsoc-contrib browse --repo facebook/react',
    },
    {
      name: 'analyze',
      category: 'discovery',
      syntax: 'contrib analyze <issue-url>',
      description:
        'Analyzes a GitHub issue description for focus areas, stack heuristics, candidate source files, and test commands.',
      options: [],
      example: 'npx gsoc-contrib analyze https://github.com/psf/requests/issues/6000',
    },
    {
      name: 'stats',
      category: 'discovery',
      syntax: 'contrib stats [options]',
      description:
        'Aggregates your open-source contribution metrics, active workspaces, commits authored, and diff statistics.',
      options: [
        { flag: '-m, --markdown', desc: 'Format output as Markdown (ideal for GSoC work logs)' },
        { flag: '-j, --json', desc: 'Output report in JSON format' },
      ],
      example: 'npx gsoc-contrib stats --markdown',
    },
    {
      name: 'doctor',
      alias: 'info',
      category: 'diagnostics',
      syntax: 'contrib doctor [workspace-id]',
      description:
        'Runs comprehensive health diagnostics for Node runtime, Git binary, storage paths, cache sizes, and GitHub API rate limits.',
      options: [],
      example: 'npx gsoc-contrib doctor',
    },
    {
      name: 'init',
      category: 'diagnostics',
      syntax: 'contrib init',
      description:
        'Verifies your environment, creates configuration paths in ~/.contrib, checks GitHub auth tokens, and reports readiness.',
      options: [],
      example: 'npx gsoc-contrib init',
    },
    {
      name: 'alias',
      alias: 'shell-init',
      category: 'diagnostics',
      syntax: 'contrib alias [--install]',
      description:
        'Configures the lightning-fast `gcd <workspace-id>` shell shortcut with autocompletion for instant directory jumping.',
      options: [
        { flag: '-i, --install', desc: 'Automatically append shortcut to your shell rc file' },
        { flag: '-s, --shell <name>', desc: 'Target shell: bash, zsh, fish, or powershell' },
      ],
      example: 'npx gsoc-contrib alias --install',
    },
    {
      name: 'cleanup',
      category: 'workspace',
      syntax: 'contrib cleanup [workspace-id] [options]',
      description:
        'Safely removes completed workspaces from disk within sandboxed path boundaries and prunes the registry.',
      options: [
        { flag: '-a, --all', desc: 'Remove all active workspaces' },
        { flag: '-y, --yes', desc: 'Skip interactive confirmation prompt' },
        { flag: '-f, --force', desc: 'Force remove workspace even if uncommitted changes exist' },
      ],
      example: 'npx gsoc-contrib cleanup psf/requests#6000 --yes',
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const matchesCategory =
      selectedCategory === 'all' || cmd.category === selectedCategory;
    const matchesSearch =
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cmd.alias && cmd.alias.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-black selection:text-white">
      {/* NAVIGATION (animationDelay: 0.1s) */}
      <header
        className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto animate-fade-in-up border-b border-gray-100"
        style={{ animationDelay: '0.1s', opacity: 0 }}
      >
        {/* Left: Star + Brand */}
        <a href="#" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-xs group-hover:bg-gray-800 transition-colors">
            <Star className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight block leading-tight">
              contrib
            </span>
            <span className="text-[10px] text-gray-500 font-mono tracking-wide block">
              gsoc-contrib v0.4.0
            </span>
          </div>
        </a>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            Features
          </a>
          <a
            href="#commands"
            className="text-sm font-medium text-gray-700 hover:text-black transition-colors flex items-center gap-1"
          >
            Commands Reference
            <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              14
            </span>
          </a>
          <a
            href="#architecture"
            className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            Architecture
          </a>
          <a
            href="#security"
            className="text-sm font-medium text-gray-700 hover:text-black transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Privacy & Security
          </a>
          <a
            href="https://github.com/anandmahadevv/contrib-cli/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            Changelog
          </a>
        </nav>

        {/* Right: GitHub & Install CTA */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/anandmahadevv/contrib-cli"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors font-medium border border-gray-200 px-3 py-1.5 rounded-full hover:border-gray-300 shadow-2xs"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
            <span className="text-xs bg-gray-100 px-1.5 py-0.2 rounded-full text-gray-600">
              MIT
            </span>
          </a>
          <a
            href="#install"
            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Run with npx</span>
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="px-6 pt-20 pb-28 max-w-7xl mx-auto text-center">
        {/* Reviews Badge (delay: 0.2s) */}
        <div
          className="inline-flex items-center gap-2 mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.2s', opacity: 0 }}
        >
          <div className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center bg-white shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-black text-black" />
          </div>
          <span className="text-sm font-medium text-black">
            4.9 rating from 18.3K+ contributors & GSoC developers
          </span>
        </div>

        {/* Main Heading (delay: 0.3s) */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-normal leading-[1.1] tracking-tight mb-6 animate-fade-in-up"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          <span className="block">Clone Less. Ship Faster.</span>
          <span className="bg-gradient-to-r from-black via-gray-500 to-gray-400 bg-clip-text text-transparent">
            Instant Workspaces Power You Up.
          </span>
        </h1>

        {/* Subheading (delay: 0.4s) */}
        <p
          className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up leading-relaxed"
          style={{ animationDelay: '0.4s', opacity: 0 }}
        >
          A fast, lightweight contribution workspace manager for GitHub issues.
          Create dedicated, isolated workspaces in seconds using blobless checkouts
          and Git worktrees without downloading gigabytes of commit history.
        </p>

        {/* CTA Command Runner (delay: 0.5s) */}
        <div
          className="mb-12 animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: '0.5s', opacity: 0 }}
          id="install"
        >
          {/* Interactive Click-to-Copy npx command */}
          <div
            onClick={() =>
              copyToClipboard('npx gsoc-contrib start <issue-url>', 'hero-npx')
            }
            className="group cursor-pointer bg-gray-900 text-white px-6 py-3 rounded-full text-base font-mono font-medium hover:bg-black transition-all shadow-md flex items-center gap-3 border border-gray-700"
          >
            <span className="text-gray-400 select-none">$</span>
            <span>npx gsoc-contrib start &lt;issue-url&gt;</span>
            <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors shrink-0">
              {copiedCmd === 'hero-npx' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
              )}
            </div>
          </div>

          <a
            href="#commands"
            className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-6 py-3 rounded-full text-base font-medium transition-colors inline-flex items-center gap-2"
          >
            <span>Explore 14 Commands</span>
            <ArrowRight className="w-4 h-4" />
          </a>
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
              Workspaces
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
              Diagnostics
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
              Deploy & PR
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
              <span>Analyse & Start</span>
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
              <span>Blobless Engine</span>
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
              <span>Health & Doctor</span>
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
              <span>Deploy & PR</span>
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
                        Set Up Contribution Workspace
                      </h3>
                      <p className="text-xs text-gray-500">Step 1 of 4 • Workspace Wizard</p>
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
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-purple-50/60 border border-purple-100">
                    <div className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      1
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Parse GitHub Issue URL
                      </div>
                      <div className="text-xs text-gray-500">
                        Resolves title, description, labels, and issue author via GitHub REST API
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/80">
                    <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      2
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Allocate Blobless Git Mirror
                      </div>
                      <div className="text-xs text-gray-400">
                        Clones tree metadata only with --filter=blob:none in shared cache
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/80">
                    <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      3
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Generate .contrib/ISSUE.md & AI Prompt
                      </div>
                      <div className="text-xs text-gray-400">
                        Scans candidate edit files, stack heuristics, formatters, and test commands
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/80">
                    <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      4
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Launch Workspace Sandbox
                      </div>
                      <div className="text-xs text-gray-400">
                        Ready in ~/.contrib/workspaces in under 2 seconds
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab B: Workspaces / Blobless Engine Overlay */}
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
                        Blobless Engine Performance
                      </h3>
                      <p className="text-xs text-gray-500">Live storage & git metrics</p>
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
                    <div className="text-xs text-gray-500">Bandwidth Saved</div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">94.2%</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      ↓ 1.8 GB blobless savings
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                    <div className="text-xs text-gray-500">Sparse Cone Scope</div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">67 / 100 Files</div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                      Only relevant trees checked out
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                    <div className="text-xs text-gray-500">Workspace Init</div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">1.2s</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      ↑ 14x faster than git clone
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                    <div className="text-xs text-gray-500">Local Footprint</div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">18 MB</div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                      Shared bare repo cache
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab C: Diagnostics Overlay */}
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
                        contrib doctor Diagnostics
                      </h3>
                      <p className="text-xs text-gray-500">Environment & workspace health</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Healthy
                  </span>
                </div>

                {/* Green Success Bar (100%) */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Diagnostics breakdown */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-800">Node Runtime & Git Binary</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">v24.16 / Git 2.44</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-800">GitHub API Rate Limit</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">4,980 / 5,000 req</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-800">Test Suite Pass Rate</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">66 Node / 14 Pytest (100%)</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
                  <span>Storage: ~/.contrib (24 MB)</span>
                  <span className="text-emerald-600 font-medium">Zero Leak Warnings</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab D: Deploy & PR Overlay */}
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
                        Deploy to Upstream PR
                      </h3>
                      <p className="text-xs text-gray-500">Ready for automated submission</p>
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
                    <span>Clean git working tree (0 uncommitted files)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Upstream rebase verified (0 merge conflicts)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>npm audit passed & credentials scrubbed</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Branch pushed to personal fork on GitHub</span>
                  </div>
                </div>

                {/* Deploy Now Button */}
                <a
                  href="https://github.com/anandmahadevv/contrib-cli/pulls"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-black text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow flex items-center justify-center gap-2"
                >
                  <GitPullRequest className="w-4 h-4" />
                  <span>Submit Pull Request (contrib submit)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Ecosystem Logos (delay: 0.8s) */}
        <div
          className="mt-20 flex items-center justify-center gap-10 md:gap-16 flex-wrap opacity-75 animate-fade-in-up select-none border-t border-b border-gray-100 py-8"
          style={{ animationDelay: '0.8s', opacity: 0 }}
        >
          {/* GitHub */}
          <div className="flex items-center gap-2 font-bold tracking-tight text-sm md:text-base text-gray-800">
            <Github className="w-5 h-5 fill-current" />
            <span>GitHub</span>
          </div>

          {/* Node.js */}
          <span className="font-extrabold tracking-tight text-sm md:text-base text-gray-800">
            Node.js (>=18)
          </span>

          {/* Python */}
          <span className="font-semibold tracking-wide text-sm md:text-base text-gray-800">
            Python / PyPI
          </span>

          {/* GSoC */}
          <div className="flex items-center gap-1.5 font-semibold text-sm md:text-base text-gray-800">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Google Summer of Code</span>
          </div>

          {/* Hacktoberfest */}
          <span className="font-mono font-bold text-sm md:text-base text-gray-800">
            Hacktoberfest
          </span>

          {/* Linux & Git */}
          <span className="font-medium tracking-wider text-sm md:text-base text-gray-800">
            Git Blobless
          </span>
        </div>
      </main>

      {/* CORE CAPABILITIES SECTION */}
      <section id="features" className="py-20 bg-gray-50/50 border-t border-gray-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-4 text-gray-900">
              Why Open-Source Contributors Love{' '}
              <span className="font-bold">contrib</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              Traditional `git clone` downloads massive historical blobs, fills your
              hard drive, and slows down your momentum. `contrib` changes the game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Blobless & Worktree Speed
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Fetch only commit trees and symbols. Git blobs stream on-demand only
                when files are edited, cutting clone time from minutes to under 2 seconds.
              </p>
              <span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                --filter=blob:none
              </span>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Auto Context & AI Prompts
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Every workspace auto-generates `.contrib/ISSUE.md` and `.contrib/AI_PROMPT.md`
                summarizing the issue, relevant candidate files, and test commands.
              </p>
              <span className="text-xs font-mono font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                .contrib/ISSUE.md
              </span>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Multi-Account Git Identity
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Switch between personal and corporate Git author names, emails, and
                custom SSH keys without accidental credential contamination.
              </p>
              <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                contrib identity use
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE COMMAND REFERENCE SECTION */}
      <section id="commands" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>Complete CLI Manual</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-4 text-gray-900">
            What Every Command Does
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            `contrib` provides 14 surgical commands designed to cover your entire open-source
            lifecycle—from issue discovery to pull request submission.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              All (14)
            </button>
            <button
              onClick={() => setSelectedCategory('workspace')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'workspace'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Workspaces (5)
            </button>
            <button
              onClick={() => setSelectedCategory('git')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'git'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Git & PR (4)
            </button>
            <button
              onClick={() => setSelectedCategory('discovery')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'discovery'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Discovery (4)
            </button>
            <button
              onClick={() => setSelectedCategory('diagnostics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'diagnostics'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Diagnostics & Shell (3)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search commands or flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        {/* Commands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCommands.map((cmd) => (
            <div
              key={cmd.name}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                      contrib {cmd.name}
                    </span>
                    {cmd.alias && (
                      <span className="text-[11px] font-mono text-gray-500">
                        alias: {cmd.alias}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {cmd.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {cmd.description}
                </p>

                {/* Options / Flags */}
                {cmd.options.length > 0 && (
                  <div className="mb-4 bg-gray-50/70 rounded-xl p-3 border border-gray-100">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Key Options & Flags:
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {cmd.options.map((opt, idx) => (
                        <div key={idx} className="text-xs flex items-start gap-2">
                          <span className="font-mono text-gray-800 font-semibold shrink-0">
                            {opt.flag}
                          </span>
                          <span className="text-gray-500 leading-tight">
                            — {opt.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Example Snippet */}
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Example Usage:
                </div>
                <div className="flex items-center justify-between bg-gray-900 text-gray-200 p-2.5 rounded-xl font-mono text-xs">
                  <span className="truncate pr-2">{cmd.example}</span>
                  <button
                    onClick={() => copyToClipboard(cmd.example, cmd.name)}
                    className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd === cmd.name ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCommands.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-gray-500 text-sm">No commands matched your filter query.</p>
          </div>
        )}
      </section>

      {/* ARCHITECTURE & COMPARISON SECTION */}
      <section id="architecture" className="py-20 bg-gray-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-4">
              How `contrib` Saves Time & Disk
            </h2>
            <p className="text-gray-400 text-base md:text-lg">
              Compare a traditional contribution workflow against `gsoc-contrib`'s
              optimized blobless architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="bg-gray-800/60 p-8 rounded-2xl border border-gray-700/60">
              <div className="text-red-400 font-mono text-xs uppercase tracking-widest font-bold mb-3">
                Traditional Git Workflow
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Full Monolithic Clones</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Downloads 1.5GB to 10GB of git blobs you will never touch</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Duplicate repo directory on disk for each separate issue</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Manual context hunting through thousands of unfamiliar source files</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Manual setup of personal fork remotes (`git remote add upstream ...`)</span>
                </li>
              </ul>
            </div>

            {/* The Contrib Way */}
            <div className="bg-gradient-to-br from-gray-800 to-black p-8 rounded-2xl border border-gray-600 shadow-xl">
              <div className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold mb-3">
                The Contrib Way
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Blobless & Worktree Mirrored</h3>
              <ul className="space-y-3 text-sm text-gray-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Only tree metadata downloaded (~15MB), saving 94% bandwidth</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sub-second instant setup with shared cache git worktrees</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Auto-generated `.contrib/ISSUE.md` with candidate files and test commands</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automatic fork detection, upstream rebasing, and one-click PR submission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & SECURITY SECTION */}
      <section id="security" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Strict Privacy & Security Architecture
                </h3>
                <p className="text-gray-600 text-sm">
                  Audited, local-first, zero telemetry, and credential scrubbing
                </p>
              </div>
            </div>
            <a
              href="https://github.com/anandmahadevv/contrib-cli/blob/main/SECURITY.md"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>View Security Policy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="font-semibold text-gray-900 mb-1">Zero Telemetry</div>
              <p className="text-gray-600 text-xs leading-relaxed">
                No analytics, cookies, tracking, crash reporting, or external data beacons.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="font-semibold text-gray-900 mb-1">In-Memory Tokens Only</div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Tokens are held in memory only, never written to disk, and sent only to GitHub's REST API.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="font-semibold text-gray-900 mb-1">Credential Redaction</div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Automated regex scrubbers filter tokens and basic auth strings from all logs and stderr.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="font-semibold text-gray-900 mb-1">Sandboxed Storage</div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Workspaces are strictly sandboxed within ~/.contrib to prevent directory traversal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-12 px-6 max-w-7xl mx-auto text-sm text-gray-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-black text-black" />
            <span className="font-semibold text-gray-900">gsoc-contrib</span>
            <span>— Lightweight GitHub contribution workspace manager</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <a
              href="https://github.com/anandmahadevv/contrib-cli"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              GitHub Repo
            </a>
            <a
              href="https://www.npmjs.com/package/gsoc-contrib"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              npm Package
            </a>
            <a
              href="https://github.com/anandmahadevv/contrib-cli/issues"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              Report Issue
            </a>
            <a
              href="https://github.com/anandmahadevv/contrib-cli/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              MIT License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
