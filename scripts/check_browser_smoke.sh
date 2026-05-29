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

BASE_URL="${SEEKLUME_BASE_URL:-}"
SERVER_PID=""
SERVER_LOG="${TMPDIR:-/tmp}/seeklume-smoke-server.log"

if [[ -z "$BASE_URL" ]]; then
  SMOKE_PORT="${SEEKLUME_SMOKE_PORT:-8931}"
  BASE_URL="http://localhost:${SMOKE_PORT}"
  rm -f "$SERVER_LOG"
  python3 -m http.server "$SMOKE_PORT" >"$SERVER_LOG" 2>&1 &
  SERVER_PID="$!"
  cleanup() {
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
      kill "$SERVER_PID" >/dev/null 2>&1 || true
    fi
  }
  trap cleanup EXIT

  ready=0
  for _ in $(seq 1 30); do
    if curl -fsS "${BASE_URL}/docs/" >/dev/null 2>&1; then
      ready=1
      break
    fi
    if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
      echo "FAIL: smoke server exited before becoming ready" >&2
      cat "$SERVER_LOG" >&2 || true
      exit 1
    fi
    sleep 0.5
  done
  if [[ "$ready" != "1" ]]; then
    echo "FAIL: smoke server did not become ready at ${BASE_URL}/docs/" >&2
    cat "$SERVER_LOG" >&2 || true
    exit 1
  fi
fi

SEEKLUME_BASE_URL="$BASE_URL" npx playwright test tests/smoke.spec.js --project=chromium
