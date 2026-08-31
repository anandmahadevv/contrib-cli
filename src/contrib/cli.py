"""
CLI entry point for the contrib tool.
"""

from __future__ import annotations

import argparse
import sys
from typing import Optional, Sequence

from contrib import __version__
from contrib.security import SecurityError
from contrib.workspace import analyze_issue, create_workspace, list_workspaces


def create_parser() -> argparse.ArgumentParser:
    """Construct the CLI argument parser."""
    parser = argparse.ArgumentParser(
        prog="contrib",
        description="Lightweight GitHub contribution workspace manager.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  contrib start https://github.com/psf/requests/issues/6000
  contrib analyze https://github.com/psf/requests/issues/6000
  contrib status
        """,
    )
    parser.add_argument(
        "-v", "--version",
        action="version",
        version=f"%(prog)s {__version__}",
        help="Show program's version number and exit.",
    )

    subparsers = parser.add_subparsers(dest="command", metavar="<command>")

    # Subcommand: start
    start_parser = subparsers.add_parser(
        "start",
        help="Create or open a lightweight contribution workspace for a GitHub issue.",
    )
    start_parser.add_argument(
        "url",
        help="Full GitHub issue or pull request URL.",
    )
    start_parser.add_argument(
        "-b", "--branch",
        default=None,
        help="Custom branch name to create in the workspace.",
    )

    # Subcommand: analyze
    analyze_parser = subparsers.add_parser(
        "analyze",
        help="Analyze a GitHub issue description for focus areas and keywords.",
    )
    analyze_parser.add_argument(
        "url",
        help="Full GitHub issue or pull request URL.",
    )

    # Subcommand: status
    subparsers.add_parser(
        "status",
        help="List all active contribution workspaces.",
    )

    return parser


def handle_start(args: argparse.Namespace) -> int:
    """Execute the 'start' command."""
    print(f"[*] Initializing workspace for: {args.url}")
    try:
        ws = create_workspace(args.url, branch_name=args.branch)
        print(f"[+] Workspace ready at: {ws['path']}")
        print(f"[+] Active branch:      {ws['branch']}")
        print(f"[+] Title:              {ws['title']}")
        print("\nTo begin working, navigate to the workspace:")
        print(f"  cd {ws['path']}")
        return 0
    except (SecurityError, RuntimeError) as e:
        print(f"[!] Error: {e}", file=sys.stderr)
        return 1


def handle_analyze(args: argparse.Namespace) -> int:
    """Execute the 'analyze' command."""
    print(f"[*] Analyzing issue: {args.url}")
    try:
        result = analyze_issue(args.url)
        meta = result["metadata"]
        print(f"[+] Title:  {meta.get('title')}")
        print(f"[+] Status: {meta.get('state', 'open')}")
        if meta.get("labels"):
            print(f"[+] Labels: {', '.join(meta['labels'])}")
        suggestions = result.get("suggested_focus_areas", [])
        if suggestions:
            print("\n[+] Detected focus files/areas:")
            for s in suggestions:
                print(f"    - {s}")
        else:
            print("\n[-] No specific file references identified in the issue body.")
        return 0
    except (SecurityError, RuntimeError) as e:
        print(f"[!] Error: {e}", file=sys.stderr)
        return 1


def handle_status(args: argparse.Namespace) -> int:
    """Execute the 'status' command."""
    workspaces = list_workspaces()
    if not workspaces:
        print("No active contribution workspaces found.")
        print("Run 'contrib start <issue-url>' to create one.")
        return 0

    print(f"Active Contribution Workspaces ({len(workspaces)}):")
    print("-" * 72)
    for ws in workspaces:
        print(f"  ID:     {ws['id']}")
        print(f"  Repo:   {ws['owner']}/{ws['repo']} (Issue #{ws['issue_number']})")
        print(f"  Branch: {ws['branch']}")
        print(f"  Path:   {ws['path']}")
        print("-" * 72)
    return 0


def main(argv: Optional[Sequence[str]] = None) -> int:
    """Main CLI entry point."""
    parser = create_parser()
    args = parser.parse_args(argv)

    if not args.command:
        parser.print_help()
        return 0

    if args.command == "start":
        return handle_start(args)
    elif args.command == "analyze":
        return handle_analyze(args)
    elif args.command == "status":
        return handle_status(args)

    return 0


if __name__ == "__main__":
    sys.exit(main())
