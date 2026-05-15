#!/bin/bash
# 构建部署文件到 docs/ 目录（供 GitHub Pages 使用）
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cp "$PROJECT_DIR/data/grammar_bank.js" "$PROJECT_DIR/docs/data/grammar_bank.js"
cp "$PROJECT_DIR/data/grammar_knowledge_core.js" "$PROJECT_DIR/docs/data/grammar_knowledge_core.js"
cp "$PROJECT_DIR/data/grammar_knowledge.js" "$PROJECT_DIR/docs/data/grammar_knowledge.js"
cp "$PROJECT_DIR/data/grammar_knowledge_traps.js" "$PROJECT_DIR/docs/data/grammar_knowledge_traps.js"
mkdir -p "$PROJECT_DIR/docs/grammar-fill"
sed \
  -e 's|../../data/grammar_bank.js|../data/grammar_bank.js|g' \
  -e 's|../../data/grammar_knowledge_core.js|../data/grammar_knowledge_core.js|g' \
  -e 's|../../data/grammar_knowledge.js|../data/grammar_knowledge.js|g' \
  -e 's|../../data/grammar_knowledge_traps.js|../data/grammar_knowledge_traps.js|g' \
  "$PROJECT_DIR/src/grammar-fill/index.html" > "$PROJECT_DIR/docs/grammar-fill/index.html"

echo "部署文件已更新到 docs/ 目录"
