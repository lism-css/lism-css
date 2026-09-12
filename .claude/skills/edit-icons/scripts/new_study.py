#!/usr/bin/env python3
"""Create the construction-study set (grid, text, study copy, guide) for an existing icon master."""

import argparse
import json
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
    parser.add_argument("icon", type=kebab, help="Icon whose master exists in the editable masters layer")
    parser.add_argument("--section", required=True, help="Two-digit study section ID, e.g. 06")
    parser.add_argument("--after", type=kebab, help="Place provisionally right of this icon in the section (default: below the last row)")
    parser.add_argument("--from", dest="source_icon", type=kebab, help="Copy guide parts and description text from this icon")
    parser.add_argument("--allow-unsaved", action="store_true", help="Allow --apply to save a live unsaved document backup")
    parser.add_argument("--source-path", type=Path)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Report the plan without changing the document")
    mode.add_argument("--apply", action="store_true", help="Back up, create the study set, and save")
    args = parser.parse_args()
    if not re.fullmatch(r"\d\d", args.section):
        parser.error("--section must be a two-digit ID")
    source = (args.source_path or root / "packages/icons/design/original/lism-icons-geometric-study.ai").resolve()
    if not source.is_file():
        parser.error(f"Illustrator file not found: {source}")

    work = Path(tempfile.mkdtemp(prefix="lism-new-study-"))
    result_file = work / "result.json"
    config = {
        "source": str(source), "icon": args.icon, "section": args.section,
        "after": args.after or "", "from": args.source_icon or "",
        "apply": args.apply, "allowUnsaved": args.allow_unsaved, "result": str(result_file),
        "backup": str(work / "before-live.ai"), "diskBackup": str(work / "before-disk.ai"),
    }
    script = work / "new-study.jsx"
    script.write_text("var config = " + json.dumps(config, ensure_ascii=True) + ";\n" + Path(__file__).with_suffix(".jsx").read_text())
    result = subprocess.run(
        ["bash", str(root / "packages/icons/scripts/run-ai.sh"), str(script)],
        capture_output=True, text=True,
    )
    if result_file.exists():
        print(result_file.read_text().strip())
    if result.returncode:
        parser.exit(result.returncode, f"{result.stderr or result.stdout}\nNew-study files: {work}\n")
    if not result_file.exists():
        parser.exit(1, f"No result; inspect before retrying: {work}\n")


if __name__ == "__main__":
    main()
