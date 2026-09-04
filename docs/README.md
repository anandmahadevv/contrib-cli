# gsoc-contrib Documentation

The official technical documentation portal for `gsoc-contrib` (`contrib`), the fast, lightweight contribution workspace manager for GitHub repositories.

## Features

- **CLI Reference**: Full syntax, flags, descriptions, and examples for all 14 CLI commands.
- **Architecture**: In-depth explanation of blobless clones (`--filter=blob:none`) and git worktrees.
- **Security & Privacy**: Documented zero-telemetry policy, local storage sandboxing, and network request audit.
- **Developer Experience**: Interactive instant search, one-click code copy, clean typography with Inter and JetBrains Mono.

## Running Locally

```bash
npm run dev
# Or
npx -y serve -l 5173 .
```

Visit `http://localhost:5173`.
