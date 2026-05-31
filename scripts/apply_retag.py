#!/usr/bin/env python3
"""Apply a fine_category (+ optional facets) remap to all three copies of the grammar bank.

Usage:
    python3 scripts/apply_retag.py <mapping.json>

Mapping format:
    {
        "2023全国一卷-57": { "fine_category": "nonpred-to-do", "facets": { "form": "to-do" } },
        "2023全国一卷-59": { "fine_category": "word-noun", "facets": { "subtype": "gerund" } }
    }

    key = "<exam_id>-<no>" (no is a string representation of the integer blank number)
    value.fine_category: required
    value.facets: optional dict; if present, overwrites the question's "facets" key

Behavior per copy:
  docs/data/grammar_bank.js  — update both exams[].questions AND flat questions[].
                                Always writes both; fine_category + facets applied.
  data/grammar_bank.json     — update exams[].questions AND flat questions[] (if present),
                                but ONLY remap fine_category when the question already has it.
                                Never adds fine_category to questions that lack it.
                                Never adds facets to grammar_bank.json.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_BANK_JS = ROOT / "docs" / "data" / "grammar_bank.js"
RAW_BANK_JSON = ROOT / "data" / "grammar_bank.json"

JS_PREFIX = "window.GRAMMAR_BANK = "


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_js() -> tuple[str, dict]:
    """Return (header_text, parsed_bank).

    header_text includes everything up to and including the JS_PREFIX string,
    so round-tripping is: write header_text + json.dumps(bank) + ";\n".
    """
    text = PUBLIC_BANK_JS.read_text(encoding="utf-8")
    pos = text.find(JS_PREFIX)
    if pos == -1:
        sys.exit(f"ERROR: {PUBLIC_BANK_JS} does not contain {JS_PREFIX!r}")
    header = text[: pos + len(JS_PREFIX)]  # everything up to and including the prefix
    json_text = text[pos + len(JS_PREFIX) :].strip().rstrip(";")
    bank = json.loads(json_text)
    return header, bank


def save_js(header: str, bank: dict) -> None:
    content = header + json.dumps(bank, ensure_ascii=False, indent=2) + ";\n"
    PUBLIC_BANK_JS.write_text(content, encoding="utf-8")


def load_json() -> dict:
    return json.loads(RAW_BANK_JSON.read_text(encoding="utf-8"))


def save_json(bank: dict) -> None:
    RAW_BANK_JSON.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def make_key_from_exam_q(exam_id: str, q: dict) -> str:
    return f"{exam_id}-{q.get('no')}"


def make_key_from_flat_q(q: dict) -> str:
    return q.get("id") or f"{q.get('exam_id')}-{q.get('no')}"


# ---------------------------------------------------------------------------
# Core update logic
# ---------------------------------------------------------------------------

def apply_to_js(mapping: dict) -> tuple[int, int]:
    """Apply mapping to docs/data/grammar_bank.js.

    Returns (exams_updated, flat_updated).
    """
    header, bank = load_js()

    exams_updated = 0
    flat_updated = 0

    # 1. Update exams[].questions
    for exam in bank.get("exams", []):
        exam_id = exam.get("exam_id", "")
        for q in exam.get("questions", []):
            key = make_key_from_exam_q(exam_id, q)
            if key in mapping:
                m = mapping[key]
                q["fine_category"] = m["fine_category"]
                if "facets" in m:
                    q["facets"] = m["facets"]
                exams_updated += 1

    # 2. Update flat questions[]
    for q in bank.get("questions", []):
        key = make_key_from_flat_q(q)
        if key in mapping:
            m = mapping[key]
            q["fine_category"] = m["fine_category"]
            if "facets" in m:
                q["facets"] = m["facets"]
            flat_updated += 1

    save_js(header, bank)
    return exams_updated, flat_updated


def apply_to_json(mapping: dict) -> int:
    """Apply mapping to data/grammar_bank.json.

    Only remaps fine_category on questions that already have it.
    Never adds fine_category or facets to questions that lack them.
    Returns json_updated count.
    """
    bank = load_json()
    json_updated = 0

    def _try_update(q: dict, key: str) -> None:
        nonlocal json_updated
        if key in mapping and "fine_category" in q:
            m = mapping[key]
            q["fine_category"] = m["fine_category"]
            # NOTE: intentionally never add facets to grammar_bank.json
            json_updated += 1

    # exams[].questions
    for exam in bank.get("exams", []):
        exam_id = exam.get("exam_id", "")
        for q in exam.get("questions", []):
            key = make_key_from_exam_q(exam_id, q)
            _try_update(q, key)

    # flat questions[] (if present)
    for q in bank.get("questions", []):
        key = make_key_from_flat_q(q)
        _try_update(q, key)

    save_json(bank)
    return json_updated


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(f"Usage: python3 {sys.argv[0]} <mapping.json>")

    mapping_path = Path(sys.argv[1])
    if not mapping_path.exists():
        sys.exit(f"ERROR: mapping file not found: {mapping_path}")

    mapping: dict = json.loads(mapping_path.read_text(encoding="utf-8"))
    if not mapping:
        print("Mapping is empty — nothing to do.")
        # Still round-trip both files (normalises formatting).
        header, bank = load_js()
        save_js(header, bank)
        raw = load_json()
        save_json(raw)
        print("Round-trip done (formatting normalised, no tag changes).")
        return

    # Collect all known keys before applying, for miss-detection
    header, bank = load_js()
    known_keys: set[str] = set()
    for exam in bank.get("exams", []):
        eid = exam.get("exam_id", "")
        for q in exam.get("questions", []):
            known_keys.add(make_key_from_exam_q(eid, q))

    # Apply changes
    js_exams, js_flat = apply_to_js(mapping)
    json_updated = apply_to_json(mapping)

    # Detect mapping keys not found in the bank
    missing_keys = [k for k in mapping if k not in known_keys]

    print(f"apply_retag: .js exams updated={js_exams}, .js flat updated={js_flat}, .json updated={json_updated}")
    if missing_keys:
        print(f"WARNING: {len(missing_keys)} mapping key(s) NOT found in bank (check spelling):")
        for k in missing_keys:
            print(f"  - {k!r}")
    else:
        print(f"All {len(mapping)} mapping key(s) found and applied.")


if __name__ == "__main__":
    main()
