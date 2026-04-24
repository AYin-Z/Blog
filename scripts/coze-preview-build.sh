#!/usr/bin/env bash
set -euo pipefail

# 静态博客无需构建准备，确认文件存在即可
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 确认静态资源存在
[ -f "index.html" ] || exit 1

echo "Static blog ready for preview"
