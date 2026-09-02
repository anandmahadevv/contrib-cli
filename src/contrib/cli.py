"""
CLI entry point for the contrib tool (Python).
"""

from __future__ import annotations

import argparse
import sys
from typing import Optional, Sequence

from contrib import __version__
from contrib.security import SecurityError
from contrib.workspace import (
    analyze_issue,
    create_workspace,
    delete_workspace,
    get_workspace,
    list_workspaces,
)


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
  contrib cleanup --all
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
    start_parser.add_argument(
        "-s", "--sparse",
        nargs="*",
        default=None,
        help="Sparse checkout directory paths.",
    )

    # Subcommand: contribute
    contrib_parser = subparsers.add_parser(
        "contribute",
        help="Smart alias to start contributing.",
    )
    contrib_parser.add_argument(
        "target",
        help="GitHub issue URL or target.",
    )
    contrib_parser.add_argument(
        "-b", "--branch",
        default=None,
        help="Custom branch name.",
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

    # Subcommand: cleanup
    cleanup_parser = subparsers.add_parser(
        "cleanup",
        help="Clean up active contribution workspaces safely.",
    )
    cleanup_parser.add_argument(
        "id",
        nargs="?",
        default=None,
        help="Workspace ID to delete.",
    )
    cleanup_parser.add_argument(
        "-a", "--all",
        action="store_true",
        help="Delete all workspaces.",
    )
    cleanup_parser.add_argument(
        "-f", "--force",
        action="store_true",
        help="Force delete workspace even if uncommitted changes exist.",
    )

    return parser


def handle_start(args: argparse.Namespace) -> int:
    """Execute the 'start' command."""
    print(f"[*] Initializing workspace for: {args.url}")
    try:
        ws = create_workspace(args.url, branch_name=args.branch, sparse=args.sparse)
        print(f"[+] Workspace ready at: {ws['path']}")
        print(f"[+] Active branch:      {ws['branch']}")
        print(f"[+] Title:              {ws['title']}")
        print(f"  Context file:         {ws['path']}/.contrib/ISSUE.md")
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


def handle_cleanup(args: argparse.Namespace) -> int:
    """Execute the 'cleanup' command."""
    workspaces = list_workspaces()
    if not workspaces:
        print("No active contribution workspaces to clean up.")
        return 0

    if args.all:
        for ws in workspaces:
            try:
                delete_workspace(ws["id"], force=args.force)
                print(f"[+] Removed workspace: {ws['id']}")
            except Exception as e:
                print(f"[!] Skipping {ws['id']}: {e}")
        return 0

    if not args.id:
        print("[!] Please specify a workspace ID or pass --all.")
        return 1

    try:
        delete_workspace(args.id, force=args.force)
        print(f"[+] Successfully removed workspace: {args.id}")
        return 0
    except Exception as e:
        print(f"[!] Error: {e}", file=sys.stderr)
        return 1


def main(argv: Optional[Sequence[str]] = None) -> int:
    """Main CLI entry point."""
    parser = create_parser()
    args = parser.parse_args(argv)

    if not args.command:
        parser.print_help()
        return 0

    if args.command in ("start", "contribute"):
        url = getattr(args, "url", getattr(args, "target", None))
        setattr(args, "url", url)
        return handle_start(args)
    elif args.command == "analyze":
        return handle_analyze(args)
    elif args.command == "status":
        return handle_status(args)
    elif args.command == "cleanup":
        return handle_cleanup(args)

    return 0


if __name__ == "__main__":
    sys.exit(main())
