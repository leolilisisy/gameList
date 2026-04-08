#!/bin/sh
set -eu

cd "$(dirname "$0")"
PORT="${1:-4173}"

echo "Serving /Volumes/ZHITAI7100/work/claude_project/games at http://127.0.0.1:${PORT}"
python3 -m http.server "${PORT}"
