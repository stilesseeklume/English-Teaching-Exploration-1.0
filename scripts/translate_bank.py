#!/usr/bin/env python3
"""
translate_bank.py

批量翻译 grammar_bank.json 中所有 exam 的 passage 为中文，
翻译时先填入答案（生成完整文章），保存到 data/exam_translations.json，
然后注入到 grammar_bank.js。

使用方式：
  python3 scripts/translate_bank.py
"""
from __future__ import annotations
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY") or "sk-90494f47bb6b46a3acbcb2b0e183ae23"
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
BANK_JSON = os.path.join(PROJECT_DIR, "data", "grammar_bank.json")
BANK_JS = os.path.join(PROJECT_DIR, "data", "grammar_bank.js")
TRANS_FILE = os.path.join(PROJECT_DIR, "data", "exam_translations.json")

SYSTEM_PROMPT = """你是一名专业的英中翻译助手。你的唯一任务是将英文短文翻译为流畅的中文。

翻译规则：
1. 保留原文的段落结构（段落数一致）
2. 翻译通顺自然，符合中文表达习惯
3. 人名、地名、专有名词保留原文或使用通用译名
4. 不要添加任何解释、注释或额外文字

输出格式：只输出中文译文，不要加任何前缀、后缀或 Markdown 标记。"""


def fill_answers(passage: str, questions: list) -> str:
    """将 ___N___ 替换为对应题号的答案，生成完整文章."""
    result = passage
    for q in questions:
        no = q.get("no")
        answer = q.get("answer", "?")
        if no is not None:
            result = result.replace(f"___{no}___", answer)
    return result


def translate_passage(passage: str, exam_id: str) -> str:
    """调用 DeepSeek API 翻译一篇短文."""
    body = json.dumps({
        "model": "deepseek-chat",
        "temperature": 0.3,
        "max_tokens": 4096,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"请翻译以下英文短文：\n\n---\n{passage}\n---"},
        ],
    }).encode("utf-8")

    req = urllib.request.Request(DEEPSEEK_API_URL, data=body, headers={
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    })

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                return content.strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            print(f"  HTTP {e.code}: {err_body[:200]}")
            if e.code == 429:
                wait = (attempt + 1) * 5
                print(f"  速率限制，等待 {wait}s...")
                time.sleep(wait)
            else:
                raise
        except Exception as e:
            print(f"  错误: {e}")
            if attempt < 2:
                time.sleep(3)
            else:
                raise
    return ""


def inject_translations():
    """将 exam_translations.json 的翻译注入到 grammar_bank.js 的 exams 数组中."""
    if not os.path.exists(TRANS_FILE):
        print(f"翻译文件不存在: {TRANS_FILE}")
        return

    with open(TRANS_FILE, "r", encoding="utf-8") as f:
        translations = json.load(f)

    if not translations:
        print("翻译文件为空，跳过注入")
        return

    with open(BANK_JS, "r", encoding="utf-8") as f:
        js = f.read()

    prefix = "window.GRAMMAR_BANK = "
    idx = js.find(prefix)
    if idx == -1:
        print("JS 文件格式不匹配：未找到 window.GRAMMAR_BANK")
        return

    json_str = js[idx + len(prefix):].rstrip(";\n ")
    data = json.loads(json_str)

    count = 0
    for exam in data.get("exams", []):
        eid = exam.get("exam_id", "")
        if eid in translations:
            exam["chinese_translation"] = translations[eid]
            count += 1

    new_js = prefix + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
    with open(BANK_JS, "w", encoding="utf-8") as f:
        f.write(new_js)
    print(f"已注入 {count} 篇翻译到 {BANK_JS}")

    with open(BANK_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"已同步到 {BANK_JSON}")


def main():
    with open(BANK_JSON, "r", encoding="utf-8") as f:
        bank = json.load(f)

    # 清空旧翻译（旧的是用 ___N___ 标记翻的，不是完整文章）
    existing = {}
    print("已清空旧翻译（将用填入答案后的完整文章重新翻译）\n")

    exams = bank.get("exams", [])
    print(f"共 {len(exams)} 套题\n")

    for i, exam in enumerate(exams):
        exam_id = exam.get("exam_id", f"exam-{i}")
        passage = exam.get("passage", "")
        questions = exam.get("questions", [])

        # 填入答案，生成完整文章
        full_passage = fill_answers(passage, questions)

        print(f"[{i+1}/{len(exams)}] {exam_id} ({len(full_passage)} 字符) ...", end=" ", flush=True)

        try:
            chinese = translate_passage(full_passage, exam_id)
            if chinese:
                existing[exam_id] = chinese
                print(f"✓ ({len(chinese)} 字符)")
            else:
                print("✗ 空响应")
        except Exception as e:
            print(f"✗ {e}")

        with open(TRANS_FILE, "w", encoding="utf-8") as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)

        if i < len(exams) - 1:
            time.sleep(1.0)

    with open(TRANS_FILE, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    print(f"\n翻译完成：共 {len(existing)} 篇")
    print(f"保存到 {TRANS_FILE}")

    print("\n注入翻译到 grammar_bank.js ...")
    inject_translations()


if __name__ == "__main__":
    main()
