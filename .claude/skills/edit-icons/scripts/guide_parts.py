#!/usr/bin/env python3
"""List LISM guide symbols, place a reusable guide part, or copy a guide between icons in Illustrator."""

import argparse
import json
import math
from pathlib import Path
import re
import subprocess
import tempfile


def kebab(value: str) -> str:
    if not re.fullmatch(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*", value):
        raise argparse.ArgumentTypeError("Use a kebab-case name")
    return value


def main():
    root = Path(__file__).resolve().parents[4]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-path", type=Path)
    commands = parser.add_subparsers(dest="command", required=True)

    list_parser = commands.add_parser("list", help="List reusable LISM guide symbols")
    list_parser.add_argument("--match", help="Only include names containing this text")

    copy = commands.add_parser("copy", help="Copy guide parts and description text from one icon's study to another")
    copy.add_argument("source_icon", type=kebab, help="Icon to copy from")
    copy.add_argument("target_icon", type=kebab, help="Icon to copy into (its study set must exist)")
    copy.add_argument("--only-missing", action="store_true", help="Add only part-* groups the target lacks; keep its text")
    copy.add_argument("--allow-unsaved", action="store_true", help="Allow --apply to save a live unsaved document backup")
    copy_mode = copy.add_mutually_exclusive_group(required=True)
    copy_mode.add_argument("--check", action="store_true", help="Report what would be copied without changing the document")
    copy_mode.add_argument("--apply", action="store_true", help="Back up, copy, and save the document")

    place = commands.add_parser("place", help="Plan or place one named guide part")
    place.add_argument("icon", type=kebab)
    place.add_argument("--symbol", required=True, help="Exact LISM symbol name")
    place.add_argument("--part", required=True, type=kebab)
    place.add_argument("--x", required=True, type=float, help="Local 24px center X")
    place.add_argument("--y", required=True, type=float, help="Local 24px center Y")
    place.add_argument("--with-center", action="store_true", help="Resolve a standalone Circle to its Circle + Center set")
    place.add_argument("--rotate", type=float, default=0, help="Rotate the placed SymbolItem in degrees")
    place.add_argument("--allow-unsaved", action="store_true", help="Allow --apply to save a live unsaved document backup")
    mode = place.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="Report the placement without changing the document")
    mode.add_argument("--apply", action="store_true", help="Back up, place, and save the document")

    args = parser.parse_args()
    source = (args.source_path or root / "packages/icons/design/original/lism-icons-geometric-study.ai").resolve()
    if not source.is_file():
        parser.error(f"Illustrator file not found: {source}")
    if args.command == "place" and not args.symbol.startswith("LISM / "):
        parser.error("--symbol must be an exact LISM / symbol name")
    if args.command == "place" and not (math.isfinite(args.x) and math.isfinite(args.y) and math.isfinite(args.rotate)):
        parser.error("--x, --y, and --rotate must be finite numbers")

    work = Path(tempfile.mkdtemp(prefix="lism-guide-parts-"))
    result_file = work / "result.json"
    config = {
        "source": str(source),
        "action": args.command,
        "result": str(result_file),
    }
    if args.command == "list":
        config["match"] = args.match or ""
    elif args.command == "copy":
        if args.source_icon == args.target_icon:
            parser.error("Source and target icons must differ")
        config.update({
            "from": args.source_icon,
            "to": args.target_icon,
            "onlyMissing": args.only_missing,
            "apply": args.apply,
            "allowUnsaved": args.allow_unsaved,
            "backup": str(work / "before-live.ai"),
            "diskBackup": str(work / "before-disk.ai"),
        })
    else:
        config.update({
            "icon": args.icon,
            "symbol": args.symbol,
            "part": args.part,
            "x": args.x,
            "y": args.y,
            "withCenter": args.with_center,
            "rotate": args.rotate,
            "apply": args.apply,
            "allowUnsaved": args.allow_unsaved,
            "backup": str(work / "before-live.ai"),
            "diskBackup": str(work / "before-disk.ai"),
        })

    script = work / "guide-parts.jsx"
    script.write_text(
        "var config = " + json.dumps(config, ensure_ascii=True) + ";\n"
        + Path(__file__).with_suffix(".jsx").read_text()
    )
    result = subprocess.run(
        ["bash", str(root / "packages/icons/scripts/run-ai.sh"), str(script)],
        capture_output=True,
        text=True,
    )
    if result_file.exists():
        print(result_file.read_text().strip())
    if result.returncode:
        parser.exit(result.returncode, f"{result.stderr or result.stdout}\nGuide-part files: {work}\n")
    if not result_file.exists():
        parser.exit(1, f"No result; inspect before retrying: {work}\n")


if __name__ == "__main__":
    main()
