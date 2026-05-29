#!/usr/bin/env python3
"""Validate the public grammar-fill bank before release."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK_JSON = ROOT / "data" / "grammar_bank.json"
GENERATED_BANK_JS = ROOT / "data" / "grammar_bank.js"
PUBLIC_BANK_JS = ROOT / "docs" / "data" / "grammar_bank.js"
FINE_TAGS_JS = ROOT / "docs" / "data" / "grammar_fine_tags.js"
SOURCE_BANK_DIR = ROOT / "data" / "语法填空库"

REQUIRED_EXAM_FIELDS = {"exam_id", "year", "type", "passage", "blank_count", "questions"}
REQUIRED_QUESTION_FIELDS = {"no", "answer", "explanation", "category"}


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_public_bank() -> dict:
    text = PUBLIC_BANK_JS.read_text(encoding="utf-8")
    prefix = "window.GRAMMAR_BANK = "
    marker = "当前 canonical"
    if marker not in "\n".join(text.splitlines()[:5]):
        fail(f"{PUBLIC_BANK_JS} must keep the canonical-data header")
    pos = text.find(prefix)
    if pos == -1:
        fail(f"{PUBLIC_BANK_JS} must contain {prefix!r}")
    return json.loads(text[pos + len(prefix) :].strip().rstrip(";"))


def check_generated_bank_header() -> list[str]:
    if not GENERATED_BANK_JS.exists():
        return [f"missing {GENERATED_BANK_JS}"]
    head = "\n".join(GENERATED_BANK_JS.read_text(encoding="utf-8").splitlines()[:5])
    if "自动生成" not in head or "请勿手工编辑" not in head:
        return [f"{GENERATED_BANK_JS} must keep the generated-data header"]
    if "scripts/build_grammar_bank.py" not in head:
        return [f"{GENERATED_BANK_JS} header must name the regeneration script"]
    return []


def load_fine_tag_ids() -> set[str]:
    text = FINE_TAGS_JS.read_text(encoding="utf-8")
    return set(re.findall(r"\{\s*id:\s*'([^']+)'", text))


def source_exam_ids() -> set[str]:
    if not SOURCE_BANK_DIR.exists():
        fail(f"missing {SOURCE_BANK_DIR}")
    ids: set[str] = set()
    for path in SOURCE_BANK_DIR.glob("*.md"):
        name = path.stem
        suffix = "_语法填空"
        if name.endswith(suffix):
            name = name[: -len(suffix)]
        ids.add(name)
    return ids


def check_bank_shape(bank: dict, source_name: str, fine_tag_ids: set[str], require_fine: bool) -> list[str]:
    errors: list[str] = []
    categories = set((bank.get("category_names") or {}).keys())
    if not categories:
        errors.append(f"{source_name}: category_names is missing or empty")

    exams = bank.get("exams")
    if not isinstance(exams, list) or not exams:
        errors.append(f"{source_name}: exams must be a non-empty list")
        return errors

    question_ids: set[str] = set()
    missing_fine = 0
    unknown_fine: list[str] = []

    for exam_index, exam in enumerate(exams):
        label = exam.get("exam_id") or f"exam[{exam_index}]"
        missing_exam = REQUIRED_EXAM_FIELDS - set(exam.keys())
        if missing_exam:
            errors.append(f"{source_name}: {label} missing exam fields: {sorted(missing_exam)}")

        questions = exam.get("questions")
        if not isinstance(questions, list):
            errors.append(f"{source_name}: {label} questions must be a list")
            continue
        if exam.get("blank_count") != len(questions):
            errors.append(f"{source_name}: {label} blank_count={exam.get('blank_count')} but questions={len(questions)}")
        if len(questions) != 10:
            errors.append(f"{source_name}: {label} expected 10 questions, got {len(questions)}")

        numbers: set[int] = set()
        for q_index, q in enumerate(questions):
            q_label = f"{label}-{q.get('no', q_index)}"
            missing_q = REQUIRED_QUESTION_FIELDS - set(q.keys())
            if missing_q:
                errors.append(f"{source_name}: {q_label} missing question fields: {sorted(missing_q)}")
            qid = q.get("id") or f"{label}-{q.get('no')}"
            if qid in question_ids:
                errors.append(f"{source_name}: duplicate question id {qid}")
            question_ids.add(qid)

            no = q.get("no")
            if not isinstance(no, int):
                errors.append(f"{source_name}: {q_label} no must be an integer")
            elif no in numbers:
                errors.append(f"{source_name}: {label} duplicate blank no {no}")
            else:
                numbers.add(no)

            category = q.get("category")
            if category not in categories:
                errors.append(f"{source_name}: {q_label} has invalid category {category!r}")

            if not str(q.get("answer", "")).strip():
                errors.append(f"{source_name}: {q_label} has empty answer")
            if not str(q.get("explanation", "")).strip():
                errors.append(f"{source_name}: {q_label} has empty explanation")

            fine = q.get("fine_category")
            if not fine:
                missing_fine += 1
            elif fine not in fine_tag_ids:
                unknown_fine.append(f"{q_label}:{fine}")

        if numbers and len(numbers) != len(questions):
            errors.append(f"{source_name}: {label} question numbers are not unique")

    if require_fine and missing_fine:
        errors.append(f"{source_name}: {missing_fine} questions missing fine_category")
    if unknown_fine:
        errors.append(f"{source_name}: unknown fine_category values: {unknown_fine[:20]}")
    return errors


def check_flat_questions_mirror(bank: dict, source_name: str) -> list[str]:
    """The flat `questions` array must stay a faithful mirror of `exams[].questions`.

    `docs/data/grammar_bank.js` is hand-editable; the app reads BOTH `exams`
    (套卷视图) and the flat `questions` (按考点/统计 via buildAllQuestions). Editing
    one copy without the other silently desyncs category/tag data. This guard
    fails the build when they disagree.
    """
    errors: list[str] = []
    flat = bank.get("questions")
    if flat is None:
        return errors
    by_id: dict[str, dict] = {}
    total = 0
    for exam in bank.get("exams", []):
        eid = exam.get("exam_id")
        for q in exam.get("questions", []):
            total += 1
            by_id[f"{eid}-{q.get('no')}"] = q
    if len(flat) != total:
        errors.append(f"{source_name}: flat questions count {len(flat)} != exams questions {total}")
    mirror_fields = ("category", "category_name", "fine_category", "answer", "grammar_point")
    for fq in flat:
        fid = fq.get("id") or f"{fq.get('exam_id')}-{fq.get('no')}"
        exam_q = by_id.get(fid)
        if exam_q is None:
            errors.append(f"{source_name}: flat question {fid} has no matching exams question")
            continue
        for field in mirror_fields:
            if fq.get(field) != exam_q.get(field):
                errors.append(
                    f"{source_name}: flat/exams desync at {fid}.{field}: "
                    f"flat={fq.get(field)!r} exams={exam_q.get(field)!r}"
                )
    return errors


def main() -> int:
    if not BANK_JSON.exists():
        fail(f"missing {BANK_JSON}")
    if not PUBLIC_BANK_JS.exists():
        fail(f"missing {PUBLIC_BANK_JS}")
    if not FINE_TAGS_JS.exists():
        fail(f"missing {FINE_TAGS_JS}")

    fine_tag_ids = load_fine_tag_ids()
    raw_bank = json.loads(BANK_JSON.read_text(encoding="utf-8"))
    public_bank = load_public_bank()

    errors = []
    errors.extend(check_generated_bank_header())
    errors.extend(check_bank_shape(raw_bank, "data/grammar_bank.json", fine_tag_ids, require_fine=False))
    errors.extend(check_bank_shape(public_bank, "docs/data/grammar_bank.js", fine_tag_ids, require_fine=True))
    errors.extend(check_flat_questions_mirror(public_bank, "docs/data/grammar_bank.js"))

    if raw_bank.get("generated_from") != public_bank.get("generated_from"):
        errors.append("generated_from differs between raw and public banks")
    if len(raw_bank.get("exams", [])) != len(public_bank.get("exams", [])):
        errors.append("exam count differs between raw and public banks")

    source_ids = source_exam_ids()
    raw_ids = {str(exam.get("exam_id", "")) for exam in raw_bank.get("exams", [])}
    public_ids = {str(exam.get("exam_id", "")) for exam in public_bank.get("exams", [])}
    if source_ids != raw_ids:
        errors.append(
            "source markdown exams differ from data/grammar_bank.json: "
            f"missing_in_json={sorted(source_ids - raw_ids)}, extra_in_json={sorted(raw_ids - source_ids)}"
        )
    if raw_ids != public_ids:
        errors.append(
            "data/grammar_bank.json exams differ from docs/data/grammar_bank.js: "
            f"missing_in_public={sorted(raw_ids - public_ids)}, extra_in_public={sorted(public_ids - raw_ids)}"
        )

    if errors:
        for err in errors:
            print(f"FAIL: {err}", file=sys.stderr)
        return 1

    total = sum(len(exam.get("questions", [])) for exam in public_bank["exams"])
    print(f"OK: grammar bank valid ({len(public_bank['exams'])} exams, {total} public questions)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
