#!/bin/bash
# 构建部署文件到 docs/ 目录（供 GitHub Pages 使用）
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cp "$PROJECT_DIR/data/grammar_knowledge_core.js" "$PROJECT_DIR/docs/data/grammar_knowledge_core.js"
cp "$PROJECT_DIR/data/grammar_knowledge.js" "$PROJECT_DIR/docs/data/grammar_knowledge.js"
cp "$PROJECT_DIR/data/grammar_knowledge_traps.js" "$PROJECT_DIR/docs/data/grammar_knowledge_traps.js"
mkdir -p "$PROJECT_DIR/docs/grammar-fill"

# 本脚本只同步 data/grammar_knowledge*.js → docs/data/。
# docs/grammar-fill/ 和 docs/data/grammar_bank.js 是 canonical（直接编辑），
# 不要在此脚本里覆盖它们 —— grammar_bank.js 携带 fine_category tags，
# 被迁移训练和导入下钻使用。

echo "部署文件已更新到 docs/ 目录"
