#!/usr/bin/env python3
"""Plan or apply the construction-study layout without moving icon masters."""

import argparse
import json
from pathlib import Path
import subprocess
import tempfile


def main():
    root = Path(__file__).resolve().parents[4]
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Report the plan without changing the document")
    mode.add_argument("--apply", action="store_true", help="Back up the live document, arrange, and save")
    parser.add_argument("--source-path", type=Path)
    parser.add_argument("--allow-unsaved", action="store_true", help="Explicitly allow saving live user edits with a backup")
    args = parser.parse_args()
    source = (args.source_path or root / "packages/icons/design/original/lism-icons-geometric-study.ai").resolve()
    if not source.is_file():
        parser.error(f"Illustrator file not found: {source}")
    work = Path(tempfile.mkdtemp(prefix="lism-layout-studies-"))
    result_file = work / "result.json"
    settings = json.loads(Path(__file__).with_suffix(".json").read_text())
    config = {
        "source": str(source), "apply": args.apply, "allowUnsaved": args.allow_unsaved, "settings": settings,
        "result": str(result_file), "backup": str(work / "before-live.ai"),
        "diskBackup": str(work / "before-disk.ai"),
    }
    script = work / "layout.jsx"
    script.write_text("var config = " + json.dumps(config, ensure_ascii=True) + ";\n" + Path(__file__).with_suffix(".jsx").read_text())
    result = subprocess.run(
        ["bash", str(root / "packages/icons/scripts/run-ai.sh"), str(script)],
        capture_output=True, text=True,
    )
    if result_file.exists():
        print(result_file.read_text().strip())
    if result.returncode:
        parser.exit(result.returncode, f"{result.stderr or result.stdout}\nLayout files: {work}\n")
    if not result_file.exists():
        parser.exit(1, f"No result; inspect before retrying: {work}\n")


if __name__ == "__main__":
    main()
