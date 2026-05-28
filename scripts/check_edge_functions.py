#!/usr/bin/env python3
"""Validate baseline contracts and safety checks for Supabase Edge Functions."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FUNCTIONS_DIR = ROOT / "supabase" / "functions"
REQUIRED_CONTRACT_SECTIONS = [
    "## Purpose",
    "## Auth",
    "## Input",
    "## Output",
    "## Errors",
    "## Secrets",
    "## AI",
]


def has_all(text: str, needles: list[str]) -> bool:
    return all(needle in text for needle in needles)


def check_function(function_dir: Path) -> list[str]:
    errors: list[str] = []
    name = function_dir.name
    index = function_dir / "index.ts"
    contract = function_dir / "CONTRACT.md"
    rel_index = index.relative_to(ROOT).as_posix()

    if not index.exists() or index.stat().st_size == 0:
        return [f"{name}: missing non-empty index.ts"]
    text = index.read_text(encoding="utf-8")

    if not contract.exists() or contract.stat().st_size == 0:
        errors.append(f"{name}: missing non-empty CONTRACT.md")
    else:
        contract_text = contract.read_text(encoding="utf-8")
        for section in REQUIRED_CONTRACT_SECTIONS:
            if section not in contract_text:
                errors.append(f"{name}: CONTRACT.md missing {section}")

    required_runtime = [
        "Deno.serve",
        'req.method === "OPTIONS"',
        'req.method !== "POST"',
        "status: 405",
        'req.headers.get("Authorization")',
        'startsWith("Bearer ")',
        "req.json()",
        "Content-Type",
        "application/json",
    ]
    for needle in required_runtime:
        if needle not in text:
            errors.append(f"{rel_index}: missing runtime guard {needle!r}")

    if "createClient(" in text:
        for needle in ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]:
            if needle not in text:
                errors.append(f"{rel_index}: Supabase client missing {needle}")
        if not ("auth.getUser(token)" in text or "auth.admin.getUserById" in text):
            errors.append(f"{rel_index}: missing Supabase user verification")

    if "api.deepseek.com" in text:
        if "DEEPSEEK_API_KEY" not in text:
            errors.append(f"{rel_index}: DeepSeek call missing DEEPSEEK_API_KEY")
        if "!DEEPSEEK_API_KEY" not in text:
            errors.append(f"{rel_index}: missing explicit DEEPSEEK_API_KEY configuration error")
        if "deepseekRes.ok" not in text or "status: 502" not in text:
            errors.append(f"{rel_index}: missing DeepSeek error handling")

    for status in ["status: 400", "status: 401", "status: 500"]:
        if status not in text:
            errors.append(f"{rel_index}: missing {status} JSON error path")

    if re.search(r"sk-[A-Za-z0-9_-]{20,}", text):
        errors.append(f"{rel_index}: contains a hard-coded AI-style secret")

    if '"text"' in text or "{ text }" in text:
        if "MAX_" not in text:
            errors.append(f"{rel_index}: text input function should define an explicit MAX_* limit")

    if "const messages =" in text and not has_all(text, ["MAX_CHAT_HISTORY", "MAX_CHAT_MESSAGE_CHARS"]):
        errors.append(f"{rel_index}: chat function should define explicit history/message limits")

    return errors


def main() -> int:
    if not FUNCTIONS_DIR.exists():
        print("FAIL: missing supabase/functions", file=sys.stderr)
        return 1

    function_dirs = sorted(
        path for path in FUNCTIONS_DIR.iterdir()
        if path.is_dir() and not path.name.startswith(".") and (path / "index.ts").exists()
    )
    if not function_dirs:
        print("FAIL: no Supabase Edge Functions found", file=sys.stderr)
        return 1

    errors: list[str] = []
    for function_dir in function_dirs:
        errors.extend(check_function(function_dir))

    if errors:
        for err in errors:
            print(f"FAIL: {err}", file=sys.stderr)
        return 1

    print(f"OK: Edge Function contracts valid ({len(function_dirs)} functions)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
