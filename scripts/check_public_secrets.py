#!/usr/bin/env python3
"""Block private keys and local private data from the public repository."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {
    ".git",
    ".claude",
    ".obsidian",
    "__pycache__",
    "private",
    "辅助ai的临时性文件",
    "教材",
}
SKIP_PARTS = {
    ("methodology", "_原始资料"),
    ("data", "exams"),
    ("data", "语法填空库"),
}
TEXT_SUFFIXES = {
    ".js",
    ".ts",
    ".py",
    ".sh",
    ".sql",
    ".md",
    ".html",
    ".css",
    ".json",
    ".toml",
    ".yml",
    ".yaml",
    ".txt",
}

PATTERNS = [
    ("generic OpenAI/DeepSeek style secret key", re.compile(r"sk-[A-Za-z0-9_-]{20,}")),
    ("Supabase service role JWT", re.compile(r"eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\"?[^\\n]{0,80}service_role", re.I)),
    ("service role assignment", re.compile(r"(SUPABASE_SERVICE_ROLE_KEY|service_role)\s*[:=]\s*['\"][^'\"]{12,}", re.I)),
    ("private env key literal", re.compile(r"(^|\n)\s*(DEEPSEEK_API_KEY|OPENAI_API_KEY)\s*=\s*['\"]?sk-[A-Za-z0-9_-]{20,}", re.I)),
    ("private Supabase key literal", re.compile(r"(^|\n)\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*['\"]?eyJ[A-Za-z0-9_-]{20,}", re.I)),
]

ALLOWLIST = [
    ("supabase/functions/deepseek-chat/index.ts", "SUPABASE_SERVICE_ROLE_KEY"),
    ("supabase/functions/deepseek-parse/index.ts", "SUPABASE_SERVICE_ROLE_KEY"),
    ("supabase/functions/translate-passage/index.ts", "SUPABASE_SERVICE_ROLE_KEY"),
    ("supabase/functions/deepseek-chat/index.ts", "DEEPSEEK_API_KEY"),
    ("supabase/functions/deepseek-parse/index.ts", "DEEPSEEK_API_KEY"),
    ("supabase/functions/translate-passage/index.ts", "DEEPSEEK_API_KEY"),
    ("supabase/SETUP.md", "service_role"),
    ("docs/config.js", "anon key"),
]


def should_skip(path: Path) -> bool:
    rel_parts = path.relative_to(ROOT).parts
    if any(part in SKIP_DIRS for part in rel_parts):
        return True
    for parts in SKIP_PARTS:
        if len(rel_parts) >= len(parts) and rel_parts[: len(parts)] == parts:
            return True
    if path.suffix not in TEXT_SUFFIXES:
        return True
    return False


def allowed(rel: str, snippet: str) -> bool:
    return any(rel == path and marker in snippet for path, marker in ALLOWLIST)


def main() -> int:
    findings: list[str] = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or should_skip(path):
            continue
        rel = path.relative_to(ROOT).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for label, pattern in PATTERNS:
            for match in pattern.finditer(text):
                start = max(0, match.start() - 60)
                end = min(len(text), match.end() + 60)
                snippet = text[start:end].replace("\n", "\\n")
                if allowed(rel, snippet):
                    continue
                findings.append(f"{rel}: {label}: {snippet[:180]}")

    if findings:
        for item in findings:
            print(f"FAIL: {item}", file=sys.stderr)
        return 1
    print("OK: no public secrets detected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
