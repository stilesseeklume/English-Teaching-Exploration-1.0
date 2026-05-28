#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python3 "$ROOT/scripts/check_grammar_bank.py"
python3 "$ROOT/scripts/check_grammar_modules.py"
python3 "$ROOT/scripts/check_public_secrets.py"
python3 "$ROOT/scripts/check_supabase_migrations.py"
python3 "$ROOT/scripts/check_edge_functions.py"
bash "$ROOT/scripts/check_static_site.sh"
bash "$ROOT/scripts/check_browser_smoke.sh"

echo "OK: all engineering checks passed"
