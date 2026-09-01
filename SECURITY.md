# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

We take the security of `gsoc-contrib` and its users seriously.

If you discover a security vulnerability or suspect an issue with command injection, path traversal, or credential leakage:

1. **Do NOT open a public GitHub issue.**
2. Report the vulnerability privately via GitHub Security Advisories at:
   - [Report a Vulnerability](https://github.com/anandmahadevv/contrib-cli/security/advisories/new)
3. Provide detailed steps to reproduce the vulnerability, including:
   - CLI version
   - OS environment
   - Minimal reproduction command and payload
4. You will receive an initial response acknowledging the report within 48 hours.

## Security Practices

* **Zero Shell Execution**: All Git and child processes execute using strictly parameterized argument lists with `shell: false`.
* **Path Sandboxing**: Workspaces are restricted to `~/.contrib/workspaces` (or `$CONTRIB_HOME`) using strict boundary checks (`isPathInside`).
* **Zero Token Persistence**: Personal access tokens are read from environment variables or GitHub CLI memory and are never written to disk, printed in terminal logs, or included in telemetry.
