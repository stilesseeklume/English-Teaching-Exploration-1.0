#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

required=(
  "$ROOT/docs/index.html"
  "$ROOT/docs/privacy.html"
  "$ROOT/docs/grammar-fill/index.html"
  "$ROOT/docs/config.js"
  "$ROOT/docs/CNAME"
  "$ROOT/docs/data/grammar_bank.js"
  "$ROOT/docs/shared/cloud.js"
  "$ROOT/docs/shared/auth-ui.js"
  "$ROOT/docs/shared/word-import.js"
  "$ROOT/docs/shared/observability.js"
  "$ROOT/docs/grammar-fill/modules/passage-utils.js"
  "$ROOT/docs/grammar-fill/modules/category-rules.js"
  "$ROOT/docs/grammar-fill/modules/teaching-axes.js"
  "$ROOT/docs/grammar-fill/modules/teaching-view-model.js"
  "$ROOT/docs/grammar-fill/modules/migration-training.js"
  "$ROOT/docs/grammar-fill/modules/question-model.js"
  "$ROOT/docs/grammar-fill/modules/app-state.js"
)

for file in "${required[@]}"; do
  if [[ ! -s "$file" ]]; then
    echo "FAIL: missing or empty $file" >&2
    exit 1
  fi
done

cname="$(tr -d '[:space:]' < "$ROOT/docs/CNAME")"
if [[ "$cname" != "englishteaching.seeklume.work" ]]; then
  echo "FAIL: docs/CNAME expected englishteaching.seeklume.work, got $cname" >&2
  exit 1
fi

if ! head -n 3 "$ROOT/data/grammar_bank.js" | grep -q "自动生成"; then
  echo "FAIL: data/grammar_bank.js must keep the generated-file header" >&2
  exit 1
fi

if ! head -n 5 "$ROOT/docs/data/grammar_bank.js" | grep -q "当前 canonical"; then
  echo "FAIL: docs/data/grammar_bank.js must keep the canonical-data header" >&2
  exit 1
fi

if command -v node >/dev/null 2>&1; then
  node --check "$ROOT/docs/shared/cloud.js"
  node --check "$ROOT/docs/shared/auth-ui.js"
  node --check "$ROOT/docs/shared/word-import.js"
  node --check "$ROOT/docs/shared/ai-assistant.js"
  node --check "$ROOT/docs/shared/admin-ui.js"
  node --check "$ROOT/docs/shared/error-book.js"
  node --check "$ROOT/docs/shared/lesson-prep.js"
  node --check "$ROOT/docs/shared/observability.js"
  node --check "$ROOT/docs/grammar-fill/modules/passage-utils.js"
  node --check "$ROOT/docs/grammar-fill/modules/category-rules.js"
  node --check "$ROOT/docs/grammar-fill/modules/teaching-axes.js"
  node --check "$ROOT/docs/grammar-fill/modules/teaching-view-model.js"
  node --check "$ROOT/docs/grammar-fill/modules/migration-training.js"
  node --check "$ROOT/docs/grammar-fill/modules/question-model.js"
  node --check "$ROOT/docs/grammar-fill/modules/app-state.js"
fi

echo "OK: static site release checks passed"
