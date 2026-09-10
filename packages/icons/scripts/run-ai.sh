#!/bin/bash
set -euo pipefail

if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo 'Usage: run-ai.sh {script.jsx}' >&2
  exit 1
fi

case "$1" in
  /*) script_path="$1" ;;
  *) script_path="$PWD/$1" ;;
esac
exec osascript - "$script_path" <<'APPLESCRIPT'
on run argv
  set scriptPath to item 1 of argv
  set scriptFile to (POSIX file scriptPath) as alias
  tell application "System Events"
    set frontmost of (first process whose bundle identifier is "com.adobe.illustrator") to true
  end tell
  tell application id "com.adobe.illustrator"
    set scriptResult to do javascript scriptFile
  end tell
  if scriptResult does not start with "LISM_OK:" then
    error scriptResult number 1
  end if
  return scriptResult
end run
APPLESCRIPT
