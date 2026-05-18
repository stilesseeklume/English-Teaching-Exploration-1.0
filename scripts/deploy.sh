#!/bin/bash
# 构建部署文件到 docs/ 目录（供 GitHub Pages 使用）
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cp "$PROJECT_DIR/data/grammar_knowledge_core.js" "$PROJECT_DIR/docs/data/grammar_knowledge_core.js"
cp "$PROJECT_DIR/data/grammar_knowledge.js" "$PROJECT_DIR/docs/data/grammar_knowledge.js"
cp "$PROJECT_DIR/data/grammar_knowledge_traps.js" "$PROJECT_DIR/docs/data/grammar_knowledge_traps.js"
mkdir -p "$PROJECT_DIR/docs/grammar-fill"

# docs/grammar-fill/index.html is now the canonical app shell. It loads shared
# modules from docs/shared/*, while src/grammar-fill/index.html still contains an
# older single-file prototype. Do not overwrite the shared-module page here, or
# Word import will silently fall back to the legacy one-shot parser.
# docs/data/grammar_bank.js is also canonical here because it carries the
# fine_category tags used by migration training and import drill-down.

echo "部署文件已更新到 docs/ 目录"
