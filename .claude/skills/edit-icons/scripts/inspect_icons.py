#!/usr/bin/env python3
"""Read only the requested icons from the worktree's Illustrator document."""

import argparse
import json
from pathlib import Path
import re
import subprocess
import tempfile


def main():
    root = Path(__file__).resolve().parents[4]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("icons", nargs="+")
    parser.add_argument("--role", action="append", choices=[
        "master", "light", "bold", "study-stroke", "study-fill", "guides", "labels",
    ])
    parser.add_argument("--points", action="store_true", help="Include anchor and handle coordinates")
    parser.add_argument("--source-path", type=Path)
    args = parser.parse_args()
    if any(not re.fullmatch(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*", icon) for icon in args.icons):
        parser.error("Use kebab-case icon names")
    source = args.source_path or root / "packages/icons/design/original/lism-icons-geometric-study.ai"
    source = source.resolve()
    if not source.is_file():
        parser.error(f"Illustrator file not found: {source}")
    roles = args.role or (["master"] if args.points else [
        "master", "light", "bold", "study-stroke", "study-fill", "guides", "labels",
    ])
    work = Path(tempfile.mkdtemp(prefix="lism-inspect-icons-"))
    result_file = work / "result.json"
    config = {
        "source": str(source), "icons": list(dict.fromkeys(args.icons)),
        "roles": roles, "points": args.points, "result": str(result_file),
    }
    template = Path(__file__).with_suffix(".jsx").read_text()
    script = work / "inspect.jsx"
    script.write_text("var config = " + json.dumps(config, ensure_ascii=True) + ";\n" + template)
    result = subprocess.run(
        ["bash", str(root / "packages/icons/scripts/run-ai.sh"), str(script)],
        capture_output=True, text=True,
    )
    if result.returncode:
        parser.exit(result.returncode, f"{result.stderr or result.stdout}\nInspection files: {work}\n")
    report = json.loads(result_file.read_text())
    print(json.dumps({"saved": report["saved"], "readOnly": True}, ensure_ascii=False))
    for icon in report["icons"]:
        print(json.dumps(icon, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    main()
