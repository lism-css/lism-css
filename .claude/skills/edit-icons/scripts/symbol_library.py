#!/usr/bin/env python3
"""Check or rebuild the linked symbol editing library in the design document."""

import argparse
import json
from pathlib import Path
import subprocess
import tempfile


def main():
    root = Path(__file__).resolve().parents[4]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-path", type=Path)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    source = (args.source_path or root / "packages/icons/design/original/lism-icons-geometric-study.ai").resolve()
    if not source.is_file():
        parser.error(f"Illustrator file not found: {source}")
    work = Path(tempfile.mkdtemp(prefix="lism-symbol-library-")).resolve()
    config = {"source": str(source), "apply": args.apply, "backup": str(work / "before.ai"), "result": str(work / "result.txt")}
    script = work / "library.jsx"
    script.write_text("var config = " + json.dumps(config, ensure_ascii=True) + ";\n" + Path(__file__).with_suffix(".jsx").read_text())
    result = subprocess.run(["bash", str(root / "packages/icons/scripts/run-ai.sh"), str(script)], capture_output=True, text=True)
    if Path(config["result"]).exists():
        print(Path(config["result"]).read_text().strip())
    if result.returncode:
        parser.exit(result.returncode, f"{result.stderr or result.stdout}\nInspect before retrying: {work}\n")
    if not Path(config["result"]).exists():
        parser.exit(1, f"No result; inspect before retrying: {work}\n")


if __name__ == "__main__":
    main()
