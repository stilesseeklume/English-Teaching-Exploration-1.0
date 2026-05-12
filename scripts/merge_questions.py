#!/usr/bin/env python3
"""Merge grammar questions: keep manual data for 3 exams, use script data for 17 new exams."""
import re, json

HTML_PATH = '/Users/zhenliu/Desktop/英语教学系统1.0/src/grammar-fill/index.html'
JSON_PATH = '/Users/zhenliu/Desktop/英语教学系统1.0/scripts/all_questions_debug.json'

def escape_js(s):
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')

def main():
    # Load script-generated questions
    with open(JSON_PATH) as f:
        all_qs = json.load(f)

    # Keep manual questions for these 3 exams
    manual_exams = {'2023全国一卷', '2024全国一卷', '2025全国一卷'}

    # Filter: use script data for non-manual exams only
    new_qs = [q for q in all_qs if q['exam'] not in manual_exams]

    # Read HTML
    with open(HTML_PATH) as f:
        html = f.read()

    # Find the existing ALL_QUESTIONS array
    start_marker = 'const ALL_QUESTIONS = ['
    end_marker = '\n];'
    start_idx = html.find(start_marker)
    end_idx = html.find(end_marker, start_idx) + len(end_marker)

    # Generate ALL_QUESTIONS entries for new questions only
    new_entries = []
    for q in new_qs:
        pe = escape_js(q['passage'])
        se = escape_js(q['sentence'])
        ae = escape_js(q['analysis'])
        te = escape_js(q['technique'])

        new_entries.append('')
        new_entries.append(f"  {{ no:{q['no']}, year:{q['year']}, exam:'{q['exam']}', answer:'{q['answer']}', category:'{q['category']}',")
        new_entries.append(f"    passage:\"{pe}\",")
        new_entries.append(f"    sentence:\"{se}\",")
        new_entries.append(f"    analysis:'{ae}',")
        new_entries.append(f"    technique:'{te}'}},")

    new_entries_text = '\n'.join(new_entries)

    # Insert new entries BEFORE the closing ]; of ALL_QUESTIONS
    # Find the closing ]; for ALL_QUESTIONS
    all_qs_end = html.find(end_marker, start_idx) + len(end_marker)

    # Insert new entries after the last existing entry, before ];
    insert_pos = html.rfind('\n];', start_idx, all_qs_end)
    if insert_pos == -1:
        insert_pos = html.rfind('];', start_idx, all_qs_end)

    new_html = html[:insert_pos] + new_entries_text + '\n' + html[insert_pos:]

    with open(HTML_PATH, 'w') as f:
        f.write(new_html)

    print(f"Added {len(new_qs)} new questions (from {len(set(q['exam'] for q in new_qs))} exams)")
    print(f"Total ALL_QUESTIONS entries: {len(all_qs)} (30 manual + {len(new_qs)} script-generated)")

    # Category summary
    from collections import Counter
    manual_cats = Counter(q['category'] for q in all_qs if q['exam'] in manual_exams)
    new_cats = Counter(q['category'] for q in new_qs)
    all_cats = Counter(q['category'] for q in all_qs)

    print("\nCategory breakdown (total including manual):")
    NAMES = {
        'predicate': '谓语动词', 'nonpredicate': '非谓语动词', 'word': '词性转换',
        'number': '数词', 'article': '冠词', 'pronoun': '代词', 'preposition': '介词',
        'logic': '逻辑连词', 'attrib': '定语从句', 'nounclause': '名词性从句',
    }
    for cat, count in sorted(all_cats.items(), key=lambda x: -x[1]):
        print(f"  {cat} ({NAMES.get(cat, cat)}): {count} total ({manual_cats.get(cat, 0)} manual + {new_cats.get(cat, 0)} new)")

if __name__ == '__main__':
    main()
