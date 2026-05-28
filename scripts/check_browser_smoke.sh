#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "${SKIP_BROWSER_SMOKE:-}" == "1" ]]; then
  echo "SKIP: browser smoke checks disabled by SKIP_BROWSER_SMOKE=1"
  exit 0
fi

cd "$ROOT"

if [[ ! -d "$ROOT/node_modules/@playwright/test" ]]; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "FAIL: npm is required for browser smoke checks" >&2
    exit 1
  fi
  npm ci --no-audit --no-fund
fi

npx playwright install chromium
npx playwright test tests/smoke.spec.js --project=chromium
