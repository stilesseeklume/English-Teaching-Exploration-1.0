#!/usr/bin/env python3
"""Validate Supabase migration hygiene before release."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS_DIR = ROOT / "supabase" / "migrations"
SUPABASE_DIR = ROOT / "supabase"

MIGRATION_NAME_RE = re.compile(r"^\d{4}-\d{2}-\d{2}_[a-z0-9_]+\.sql$")
RLS_RE = re.compile(
    r"\b(enable\s+row\s+level\s+security|create\s+policy|alter\s+policy|drop\s+policy)\b",
    re.I,
)
PUBLIC_TABLE_RE = re.compile(
    r"\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-zA-Z_][a-zA-Z0-9_]*)",
    re.I,
)
CREATE_POLICY_RE = re.compile(
    r"\bcreate\s+policy\s+(?:if\s+not\s+exists\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s+on\s+public\.([a-zA-Z_][a-zA-Z0-9_]*)",
    re.I,
)
CHECKLIST_REQUIRED_PATTERNS = {
    "anonymous/guest case": r"\b(anonymous|anon|guest)\b|匿名",
    "ordinary user case": r"\bordinary\b|普通用户|authenticated",
    "admin case": r"\badmin\b|管理员",
    "cleanup section": r"\bcleanup\b|清理",
}


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)


def migration_slug(path: Path) -> str:
    return re.sub(r"^\d{4}-\d{2}-\d{2}_", "", path.stem)


def rollback_mentions_created_objects(forward_text: str, rollback_text: str, rel: str) -> list[str]:
    errors: list[str] = []
    rollback_lower = rollback_text.lower()
    for table in PUBLIC_TABLE_RE.findall(forward_text):
        table_lower = table.lower()
        drops_table = (
            f"drop table if exists public.{table_lower}" in rollback_lower
            or f"drop table public.{table_lower}" in rollback_lower
        )
        if not drops_table:
            errors.append(f"{rel}: rollback does not drop public.{table}")

    for policy, table in CREATE_POLICY_RE.findall(forward_text):
        policy_lower = policy.lower()
        table_lower = table.lower()
        drops_policy = (
            f"drop policy if exists {policy_lower} on public.{table_lower}" in rollback_lower
            or f"drop policy {policy_lower} on public.{table_lower}" in rollback_lower
        )
        if not drops_policy:
            errors.append(f"{rel}: rollback does not drop policy {policy} on public.{table}")
    return errors


def checklist_covers_roles(checklist_path: Path) -> list[str]:
    text = checklist_path.read_text(encoding="utf-8").lower()
    errors: list[str] = []
    for label, pattern in CHECKLIST_REQUIRED_PATTERNS.items():
        if not re.search(pattern, text, re.I):
            errors.append(f"{checklist_path.relative_to(ROOT).as_posix()}: missing {label}")
    return errors


def main() -> int:
    errors: list[str] = []
    if not MIGRATIONS_DIR.exists():
        errors.append(f"missing {MIGRATIONS_DIR.relative_to(ROOT)}")
    else:
        migrations = sorted(
            path for path in MIGRATIONS_DIR.glob("*.sql")
            if not path.name.endswith(".rollback.sql")
        )
        if not migrations:
            errors.append("supabase/migrations has no forward migration files")

        for path in migrations:
            rel = path.relative_to(ROOT).as_posix()
            if not MIGRATION_NAME_RE.match(path.name):
                errors.append(f"{rel}: migration name must be YYYY-MM-DD_slug.sql")
            text = path.read_text(encoding="utf-8").strip()
            if not text:
                errors.append(f"{rel}: migration is empty")
                continue

            rollback = path.with_name(path.stem + ".rollback.sql")
            if not rollback.exists() or rollback.stat().st_size == 0:
                errors.append(f"{rel}: missing non-empty rollback file {rollback.name}")
                rollback_text = ""
            else:
                rollback_text = rollback.read_text(encoding="utf-8")
                errors.extend(rollback_mentions_created_objects(text, rollback_text, rel))

            rls_changed = bool(RLS_RE.search(text))
            if rls_changed:
                slug = migration_slug(path)
                checklist = SUPABASE_DIR / f"rls_checklist_{slug}.sql"
                if not checklist.exists() or checklist.stat().st_size == 0:
                    errors.append(f"{rel}: RLS change requires {checklist.relative_to(ROOT).as_posix()}")
                else:
                    errors.extend(checklist_covers_roles(checklist))

            lower_text = text.lower()
            for table in PUBLIC_TABLE_RE.findall(text):
                needle = f"alter table public.{table.lower()} enable row level security"
                if needle not in lower_text:
                    errors.append(f"{rel}: public.{table} is created without enabling RLS")

    if errors:
        for err in errors:
            fail(err)
        return 1

    print("OK: Supabase migrations have rollback/RLS checks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
