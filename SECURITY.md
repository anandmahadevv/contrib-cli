# Security and Privacy Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.4.x   | :white_check_mark: |
| 0.3.x   | :white_check_mark: |
| 0.2.x   | :white_check_mark: |
| < 0.2.0 | :x:                |

## Reporting a Vulnerability

We take the security and privacy of `gsoc-contrib` and its users seriously.

If you discover a security vulnerability or suspect an issue with command injection, path traversal, unauthorized network communication, or credential leakage:

1. **Do NOT open a public GitHub issue.**
2. Report the vulnerability privately via GitHub Security Advisories at:
   - [Report a Vulnerability](https://github.com/anandmahadevv/contrib-cli/security/advisories/new)
3. Provide detailed steps to reproduce the vulnerability, including:
   - CLI version (`contrib --version`)
   - OS and Node.js environment
   - Minimal reproduction command and payload
4. You will receive an initial response acknowledging the report within 48 hours.

---

## Security & Privacy Practices

* **Zero Telemetry & Analytics**: The application contains no telemetry, analytics, tracking, fingerprinting, crash reporting, or external data collection. No user consent has been asked, and no tracking code exists.
* **No Project Backend or Server**: There is no backend, analytics database, or remote server operated by this project. The CLI never sends repository contents, workspace files, or credentials to any server controlled by this project.
* **Direct GitHub & Git Communication Only**: All outbound network calls are strictly restricted to official GitHub REST API endpoints (`https://api.github.com`) and user-specified Git repositories over standard HTTPS or SSH. See the [Network Request Audit in README.md](README.md#network-request-audit).
* **Zero Token Persistence**: Personal access tokens (`GITHUB_TOKEN`, `GH_TOKEN`, or `gh auth token`) are held in memory only for the duration of the command. They are never written to disk, never cached, and never transmitted to any destination other than GitHub's API `Authorization` header.
* **Automated Credential Redaction**: All error handlers, logger utilities, and subprocess watchers run through an automated redactor (`redactSensitiveOutput`) to ensure GitHub PATs, OAuth tokens, and embedded credentials in URLs are scrubbed before terminal display.
* **Zero Shell Execution**: All Git and child processes execute using strictly parameterized argument lists with `shell: false`, preventing shell injection vulnerabilities.
* **Strict Path Sandboxing**: Workspaces are strictly restricted within `~/.contrib/workspaces` (or `$CONTRIB_HOME`) using directory traversal boundary checks (`isPathInside` and `sanitizeWorkspaceName`).
* **Minimal Dependency Footprint**: The CLI runtime dependencies are audited and kept to the absolute minimum (only `commander`, 0 transitive dependencies).

