#!/usr/bin/env python3
"""
Extract grammar fill-in-the-blank questions from all 20 exam papers.
Handles 4 different answer formats found across the exams.
"""
import re, os, json, sys

EXAMS_DIR = "/Users/zhenliu/Desktop/英语教学系统1.0/data/exams"

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def get_grammar_section(text):
    """Extract text from <a id=grammar> to next <a id= or end."""
    idx = text.find('<a id="grammar">')
    if idx == -1:
        return None
    rest = text[idx:]
    next_anchor = re.search(r'<a id="', rest[20:])
    if next_anchor:
        return rest[:20 + next_anchor.start()]
    return rest

def parse_passage_and_blanks(section):
    """Extract passage text and blank numbers from the grammar section."""
    # Normalize blank formats
    # Format 1: <u>　56　</u> → ___56___
    passage = re.sub(r'<u>\s*(\d+)\s*</u>', r'___\1___', section)
    # Format 2: ______56______ → ___56___
    passage = re.sub(r'_{2,}(\d+)_{2,}', r'___\1___', passage)

    # Find blank numbers, filter to expected ranges (36-45 or 56-65)
    raw_blanks = [int(n) for n in re.findall(r'___(\d+)___', passage)]
    # Determine the range: most exams use either 36-45 or 56-65
    in_36_45 = sum(1 for n in raw_blanks if 36 <= n <= 45)
    in_56_65 = sum(1 for n in raw_blanks if 56 <= n <= 65)
    if in_36_45 >= in_56_65 and in_36_45 >= 8:
        blanks = [n for n in raw_blanks if 36 <= n <= 45]
    elif in_56_65 >= 8:
        blanks = [n for n in raw_blanks if 56 <= n <= 65]
    else:
        blanks = [n for n in raw_blanks if 36 <= n <= 65]

    # Format 3: bare numbers (2025广州二模 style) - find and normalize
    if not blanks:
        for marker in ['**答案与解析', '【答案】', '### 第二节（语法填空）', '### 第二节(语法填空）']:
            if marker in passage:
                passage_part = passage[:passage.find(marker)]
                break
        else:
            passage_part = passage

        # Find 2-digit numbers likely to be blanks
        potential = re.findall(r'\b(\d{2})\b', passage_part)
        bare_blanks = sorted(set(int(n) for n in potential if 36 <= int(n) <= 65))

        if bare_blanks:
            # Normalize bare numbers to ___XX___ format
            # Replace each bare number with the blank format (preserving surrounding text)
            for n in sorted(bare_blanks, reverse=True):  # Replace from highest to avoid offset issues
                # Match the number as a word boundary, not part of a larger number
                passage = re.sub(rf'\b{n}\b', f'___{n}___', passage, count=1)

            blanks = bare_blanks

    # Clean passage: remove everything before the first blank
    if blanks:
        first_blank = min(blanks)
        first_pattern = f'___{first_blank}___'
        if first_pattern in passage:
            passage = passage[passage.find(first_pattern):]
        else:
            # Bare number - find it in context
            for marker in ['阅读下面短文', '阅读下面材料']:
                mp = passage.find(marker)
                if mp >= 0:
                    # Find the first blank after this marker
                    np = passage.find(f' {first_blank} ', mp)
                    if np >= 0:
                        passage = passage[np+1:]
                    else:
                        # Just use from the marker
                        newline = passage.find('\n', mp)
                        if newline >= 0:
                            passage = passage[newline+1:]
                    break

    # Remove the answer/analysis section from passage text
    for marker in ['**答案与解析', '【答案】', '### 第二节（语法填空）', '### 第二节(语法填空）',
                   '### 第二节 (每小题', '### 第二节(每小题']:
        mp = passage.find(marker)
        if mp >= 0:
            passage = passage[:mp].strip()
            break

    return passage, blanks

def parse_answers(section, blanks):
    """Parse answers from various formats. Returns {no: answer} dict."""
    answers = {}

    # First, try to extract answers from the full section text using a general approach
    # Find the answer area by looking for 【答案】 or similar markers
    ans_area_start = -1
    for marker in ['【答案】', '\n【答案】', '【答案']:
        ans_area_start = section.find(marker)
        if ans_area_start >= 0:
            break

    if ans_area_start >= 0:
        ans_text = section[ans_area_start:]

        # Normalize unicode spaces
        ans_text = ans_text.replace('　', ' ').replace(' ', ' ').replace(' ', ' ')

        # Pre-process: strip ##alternatives (stay on same line only)
        ans_text = re.sub(r'##[^\n#]+', '', ans_text)

        # Try Format A1: Compact list: 【答案】36. answer  37. answer...
        # Pattern: number. answer (possibly followed by another number. answer)
        # Allow / in answers (e.g., "that/which", "simpler / more simple")
        compact_match = re.findall(r'(\d+)\.?\s*([a-zA-Z][\w\s\'\-/]+?)(?=\s*\d+\.?\s*[a-zA-Z]|\s*\n\s*\n|\s*\n【解析】|\s*\n【导语】|\s*\n---|\s*$)', ans_text)
        if compact_match:
            for no_str, ans in compact_match:
                no = int(no_str)
                if no in blanks:
                    ans = ans.strip().split('##')[0].strip().rstrip('.,;，。；')
                    # Clean up / alternatives - take first one
                    ans = ans.split('/')[0].strip()
                    answers[no] = ans

        # Try Format A2: Per-line: 36. 【答案】　answer (2024全国二卷 style)
        if not answers:
            per_line = re.findall(r'(\d+)\.\s*【答案】?\s*([a-zA-Z][\w\s\'\-/]+)',
                                  ans_text)
            if per_line:
                for no_str, ans in per_line:
                    no = int(no_str)
                    if no in blanks:
                        ans = ans.strip().split('##')[0].strip().rstrip('.,;，。；')
                        ans = ans.split('/')[0].strip()
                        answers[no] = ans

            # Also try first answer without number prefix: 【答案】　answer
            first_ans = re.search(r'【答案】\s*([a-zA-Z][\w\s\'\-/]+)', ans_text)
            if first_ans and min(blanks) not in answers:
                ans = first_ans.group(1).strip().split('##')[0].strip().rstrip('.,;，。；')
                ans = ans.split('/')[0].strip()
                answers[min(blanks)] = ans

    if answers:
        return answers

    # Try Format B: ### 第二节（语法填空） with **56. answer**
    sub_match = re.search(r'(?:###|####)\s*第二节[（(]语法填空[）)]\s*\n+(.*?)(?=\n(?:###|####|<a id=)|\Z)', section, re.DOTALL)
    if sub_match:
        sub_text = sub_match.group(1)
        for m in re.finditer(r'\*\*(\d+)\.\s*([^*]+?)\*\*', sub_text):
            no = int(m.group(1))
            ans = m.group(2).strip().split('##')[0].strip().rstrip('.,;，。；')
            ans = ans.split('/')[0].strip()
            if no in blanks:
                answers[no] = ans

    if answers:
        return answers

    # Try Format C: 嘉兴-style: ### 第二节 (每小题... with 56. answer  57. answer...
    sub_match = re.search(r'(?:###|####)\s*第二节\s*[(（]每小题.*?\n+(.*?)(?=\n(?:###|####|<a id=)|\Z)', section, re.DOTALL)
    if sub_match:
        sub_text = sub_match.group(1)
        for m in re.finditer(r'(\d+)\.?\s*([a-zA-Z][\w\s\'\-/]+?)(?=\s+\d+\.?\s*[a-zA-Z]|\s*\n|$)', sub_text):
            no = int(m.group(1))
            ans = m.group(2).strip().split('##')[0].strip().rstrip('.,;，。；')
            ans = ans.split('/')[0].strip()
            if no in blanks:
                answers[no] = ans

    if answers:
        return answers

    # Try Format D: 广州二模-style: **答案与解析** with 1. answer, 2. answer...
    ans_pos = section.find('**答案与解析')
    if ans_pos >= 0:
        ans_section = section[ans_pos:]
        numbered_answers = re.findall(r'(\d+)\.?\s*([a-zA-Z][\w\s\'\-/]+?)(?:考查|$)', ans_section)
        sorted_blanks = sorted(blanks)
        for i, (ans_no, ans_text) in enumerate(numbered_answers):
            if i < len(sorted_blanks):
                ans = ans_text.strip().split('/')[0].strip().rstrip('.,;，。；').split('##')[0].strip()
                answers[sorted_blanks[i]] = ans

    return answers

def parse_analyses(section, blanks):
    """Parse analyses from various formats. Returns {no: analysis_text} dict."""
    analyses = {}

    # Normalize unicode spaces
    section = section.replace('　', ' ').replace(' ', ' ').replace(' ', ' ')

    # Format A: 【56题详解】... content ...
    for m in re.finditer(r'【(\d+)题详解】(.*?)(?=\n【\d+题详解】|\Z)', section, re.DOTALL):
        no = int(m.group(1))
        text = re.sub(r'\s+', ' ', m.group(2)).strip()
        if no in blanks:
            analyses[no] = text

    if analyses:
        return analyses

    # Format E: Per-line: 【解析】...content... (2024全国二卷 style)
    # Pattern: 【答案】answer / N. 【答案】answer / 【解析】analysis
    # Each answer+analysis pair is on consecutive lines
    per_line_analyses = {}
    sorted_blanks = sorted(blanks)
    current_idx = 0

    # Find all 【解析】 sections
    for m in re.finditer(r'【解析】(.*?)(?=\n\d+\.\s*【答案】|\n【答案】|\Z)', section, re.DOTALL):
        text = re.sub(r'\s+', ' ', m.group(1)).strip()
        if current_idx < len(sorted_blanks):
            per_line_analyses[sorted_blanks[current_idx]] = text
            current_idx += 1

    if per_line_analyses:
        return per_line_analyses

    # Format B: **56. answer**  \n【解析】...content...
    for no in blanks:
        pat = rf'\*\*{no}\.\s*[^*]+\*\*\s*\n【解析】(.*?)(?=\n\*\*|\n###|\Z)'
        m = re.search(pat, section, re.DOTALL)
        if m:
            analyses[no] = re.sub(r'\s+', ' ', m.group(1)).strip()

    if analyses:
        return analyses

    # Format C: 嘉兴-style (no individual analyses)

    # Format D: 广州二模-style: 1. answer 考查...
    ans_pos = section.find('**答案与解析')
    if ans_pos >= 0:
        ans_section = section[ans_pos:]
        parts = re.split(r'\n(\d+)\.\s*', ans_section)
        sorted_blanks = sorted(blanks)
        current_idx = 0
        for i in range(1, len(parts), 2):
            content = parts[i+1] if i+1 < len(parts) else ''
            if current_idx < len(sorted_blanks):
                no = sorted_blanks[current_idx]
                analyses[no] = re.sub(r'\s+', ' ', content).strip()
                current_idx += 1

    return analyses

def classify_question(answer, no, analysis_text):
    """Classify into one of 11 categories."""
    ans = answer.lower().strip()

    # Use analysis text first (most reliable)
    if analysis_text:
        if any(kw in analysis_text for kw in ['主语从句', '宾语从句', '表语从句', '同位语从句']):
            return 'nounclause'
        if any(kw in analysis_text for kw in ['定语从句']):
            return 'attrib'
        if any(kw in analysis_text for kw in ['状语从句']):
            return 'advclause'
        if any(kw in analysis_text for kw in ['非谓语动词', '不定式作', '现在分词作', '动名词', '分词作']):
            return 'nonpredicate'
        if any(kw in analysis_text for kw in ['考查时态', '考查动词语态', '考查时态和语态', '考查时态语态', '时态和主谓一致',
                                                '考查动词时态', '考查时态。', '考查时态，', '考查动词的时态']):
            return 'predicate'
        if any(kw in analysis_text for kw in ['作谓语', '谓语动词', '考查谓语']):
            return 'predicate'
        if '被动语态' in analysis_text and '非谓语' not in analysis_text:
            return 'predicate'
        if any(kw in analysis_text for kw in ['考查介词', '介词短语']):
            return 'preposition'
        if any(kw in analysis_text for kw in ['考查冠词', '定冠词', '不定冠词']):
            return 'article'
        if any(kw in analysis_text for kw in ['考查代词', '物主代词', '人称代词', '反身代词', '指示代词']):
            return 'pronoun'
        if any(kw in analysis_text for kw in ['考查连词', '并列连词', '表示并列', '选择关系', '转折连词']):
            return 'logic'
        if any(kw in analysis_text for kw in ['考查数词', '基数词', '序数词']):
            return 'number'
        if '考查词性转换' in analysis_text:
            return 'word'

    # Fallback: classify by answer form
    if ans in ('a', 'an', 'the'):
        return 'article'
    if ans in ('by', 'for', 'from', 'as', 'to', 'with', 'at', 'in', 'on', 'of',
               'into', 'before', 'after', 'during', 'through', 'over', 'under',
               'upon', 'within', 'without', 'like', 'towards', 'onto', 'above', 'below'):
        return 'preposition'
    if ans in ('and', 'or', 'but', 'so', 'yet', 'nor', 'because', 'since',
               'although', 'though', 'unless', 'until', 'while', 'whereas', 'whether'):
        return 'logic'
    if ans in ('it', 'they', 'them', 'their', 'theirs', 'its', 'he', 'she', 'him',
               'her', 'his', 'we', 'us', 'our', 'ours', 'you', 'your', 'yours',
               'me', 'my', 'mine', 'myself', 'yourself', 'himself', 'herself',
               'itself', 'ourselves', 'themselves', 'this', 'that', 'these', 'those',
               'one', 'ones', 'another', 'other', 'others', 'everyone', 'someone',
               'anyone', 'everybody', 'somebody', 'anybody', 'nobody', 'everything',
               'something', 'anything', 'nothing', 'both', 'all', 'each', 'every',
               'either', 'neither', 'few', 'many', 'much', 'several', 'some', 'any', 'none'):
        return 'pronoun'
    if "'s" in ans or "s'" in ans:
        return 'pronoun'
    if ans in ('who', 'whom', 'which', 'that', 'whose', 'where', 'when', 'why'):
        return 'attrib'
    if ans in ('what', 'how', 'whatever', 'whoever', 'whichever', 'whomever'):
        return 'nounclause'
    if ans.startswith(('to ', 'was ', 'were ', 'is ', 'are ', 'has ', 'have ', 'had ')):
        if ans.startswith('to '):
            return 'nonpredicate'
        return 'predicate'
    if ans.endswith('ing'):
        if '名词' in analysis_text:
            return 'word'
        return 'nonpredicate'
    if ans.endswith('ed'):
        if '被动' in analysis_text or '时态' in analysis_text:
            if '非谓语' not in analysis_text:
                return 'predicate'
        if '形容词' in analysis_text:
            return 'word'
        return 'nonpredicate'
    if ans.endswith('ly'):
        return 'word'

    # Adjective suffixes
    adj_endings = ('ive', 'ous', 'ful', 'less', 'able', 'ible', 'ent', 'ant', 'ary', 'ory', 'y', 'ish', 'some', 'like', 'ar')
    if any(ans.endswith(e) for e in adj_endings) and len(ans) > 4:
        return 'word'

    # Noun suffixes
    noun_endings = ('ness', 'tion', 'sion', 'ment', 'ance', 'ence', 'ity', 'ty', 'ure', 'ture', 'hood', 'dom', 'ship', 'th', 'age', 'cy', 'ery', 'ory', 'ism', 'ist')
    if any(ans.endswith(e) for e in noun_endings):
        return 'word'

    # -s endings: likely predicate or word
    if ans.endswith('s') and not ans.endswith('ss') and len(ans) > 3:
        if '名词' in analysis_text or '复数' in analysis_text:
            return 'word'
        return 'predicate'

    return 'word'

def extract_sentence(passage, no, answer):
    """Extract the sentence containing blank no, with answer filled in."""
    pattern = f'___{no}___'
    idx = passage.find(pattern)
    if idx == -1:
        # Fallback: search for the bare number
        bare_pattern = f' {no} '
        idx = passage.find(bare_pattern)
        if idx >= 0:
            pattern = bare_pattern
            idx += 1  # Skip leading space
        else:
            return ''

    # Find sentence start
    start = 0
    for i in range(idx - 1, max(0, idx - 250), -1):
        ch = passage[i]
        if ch in ('.', '。', '!', '?'):
            start = i + 1
            break
        if ch == '\n':
            if i + 1 < len(passage) and passage[i+1] == '\n':
                start = i + 2
                break
            start = i + 1
            break

    # Find sentence end
    end = len(passage)
    blank_end = idx + len(pattern)
    for i in range(blank_end, min(len(passage), blank_end + 250)):
        ch = passage[i]
        if ch in ('.', '。', '!', '?'):
            end = i + 1
            break
        if ch == '\n' and i + 1 < len(passage) and passage[i+1] == '\n':
            end = i
            break

    sent = passage[start:end].strip()
    sent = sent.replace(pattern, answer)
    # Remove parenthetical prompts like (read), (taste), (city)
    sent = re.sub(r'\s*\([a-zA-Z][\w\s\'\-/]*\)', '', sent)
    sent = re.sub(r'\s+', ' ', sent).strip()

    # Truncate if too long
    if len(sent) > 150:
        ans_pos = sent.find(answer)
        if ans_pos >= 0:
            half = 60
            s = max(0, ans_pos - half)
            e = min(len(sent), ans_pos + len(answer) + half)
            sent = ('...' if s > 0 else '') + sent[s:e] + ('...' if e < len(sent) else '')
        else:
            sent = sent[:150] + '...'

    return sent

def generate_analysis_text(analysis_text, answer):
    """Generate concise analysis from available text."""
    if not analysis_text:
        return f'答案为{answer}。'

    # Extract key parts
    parts = []

    # Get grammar point
    grammar_match = re.search(r'考查(.+?)。', analysis_text)
    if grammar_match:
        parts.append(grammar_match.group(0))

    # Get fixed collocation
    fix_match = re.search(r'(?:固定搭配|固定短语|短语)([""][^""]+[""]|[""][^""]+[""])', analysis_text)
    if fix_match:
        parts.append(fix_match.group(0))

    # Get concise explanation - look for key patterns
    if '表示' in analysis_text and '考查' not in analysis_text:
        explain_match = re.search(r'(表示.+?。|意为.+?。|需用.+?。)', analysis_text)
        if explain_match and len(explain_match.group(0)) < 80:
            parts.append(explain_match.group(0))

    if parts:
        result = ' '.join(parts)
        if len(result) > 15:
            return result

    # Fallback: clean up and return first 200 chars
    text = re.sub(r'\s+', ' ', analysis_text)
    # Remove structural descriptions
    text = re.sub(r'分析句子.*?可知，?', '', text)
    text = re.sub(r'根据句意.*?，?', '', text)
    text = re.sub(r'句意：?(同上|同前)。?', '', text)
    text = re.sub(r'故填\w+。?', '', text)

    if len(text) > 200:
        # Find a good breaking point
        for sep in ['。', '；', '，']:
            bp = text.rfind(sep, 0, 200)
            if bp > 50:
                return text[:bp+1]
        return text[:200]
    return text

def generate_technique(analysis_text, category):
    """Generate technique tip."""
    base = {
        'predicate': '谓语动词：①判断时态（时间状语+语境）②判断语态（主被动）③主谓一致',
        'nonpredicate': '非谓语动词：①找逻辑主语 ②判断关系（主动doing/被动done/目的to do）',
        'word': '词性转换：①判断空格在句中成分 ②选正确词性（名/形/副/动）',
        'article': '冠词：①特指用the ②泛指用a/an ③固定搭配',
        'preposition': '介词：①固定搭配 ②句意逻辑（时间/地点/方式/原因）',
        'pronoun': '代词：①确定指代对象（人/物，单/复）②判断格（主格/宾格/所有格）',
        'logic': '逻辑连词：①分析前后句关系（并列/转折/因果/选择/递进）②固定搭配',
        'attrib': '定语从句：①找先行词 ②判断从句成分（主/宾/状）③选关系词',
        'nounclause': '名词性从句：①判断从句类型（主/宾/表/同位）②缺什么选什么',
        'advclause': '状语从句：①判断主从句关系（时间/原因/条件/让步/目的/结果）②选连词',
        'number': '数词：①基数↔序数 ②分数表达 ③固定搭配',
    }.get(category, '语法填空：先判断空格成分，再确定词形。')

    if analysis_text:
        fix_match = re.search(r'固定搭配[：:]\s*(.+?)(?:。|$)', analysis_text)
        if fix_match:
            return f'{fix_match.group(1).strip()}。{base}'

        grammar_match = re.search(r'考查(.+?)。', analysis_text)
        if grammar_match:
            point = grammar_match.group(1).strip()
            if len(point) < 30:
                return f'考点：{point}。{base}'

    return base

def escape_js(s):
    return s.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'").replace('\n', '\\n')

def process_exam(filepath, dirname):
    """Process a single exam file."""
    text = read_file(filepath)
    year_match = re.match(r'(\d{4})', dirname)
    year = int(year_match.group(1)) if year_match else 0
    exam_name = dirname.replace('_套卷', '')

    section = get_grammar_section(text)
    if not section:
        return []

    passage, blanks = parse_passage_and_blanks(section)
    if not passage or not blanks:
        return []

    answers = parse_answers(section, blanks)
    if not answers:
        return []

    analyses = parse_analyses(section, blanks)

    questions = []
    for no in sorted(blanks):
        if no not in answers:
            continue

        answer = answers[no]
        analysis_text = analyses.get(no, '')
        category = classify_question(answer, no, analysis_text)
        sentence = extract_sentence(passage, no, answer)
        analysis = generate_analysis_text(analysis_text, answer)
        technique = generate_technique(analysis_text, category)

        questions.append({
            'no': no,
            'year': year,
            'exam': exam_name,
            'answer': answer,
            'category': category,
            'passage': passage,
            'sentence': sentence,
            'analysis': analysis,
            'technique': technique,
        })

    return questions

def process_all_exams():
    all_qs = []

    for dirname in sorted(os.listdir(EXAMS_DIR)):
        dirpath = os.path.join(EXAMS_DIR, dirname)
        if not os.path.isdir(dirpath):
            continue
        md_files = [f for f in os.listdir(dirpath) if f.endswith('.md')]
        if not md_files:
            continue

        filepath = os.path.join(dirpath, md_files[0])
        questions = process_exam(filepath, dirname)

        if questions:
            print(f"{dirname}: {len(questions)} questions")
            all_qs.extend(questions)
        else:
            print(f"{dirname}: SKIPPED")

    all_qs.sort(key=lambda q: (q['year'], q['exam'], q['no']))
    return all_qs

def generate_js(all_qs):
    lines = ['const ALL_QUESTIONS = [']
    for q in all_qs:
        pe = escape_js(q['passage'])
        se = escape_js(q['sentence'])
        ae = escape_js(q['analysis'])
        te = escape_js(q['technique'])
        lines.append('')
        lines.append(f"  {{ no:{q['no']}, year:{q['year']}, exam:'{q['exam']}', answer:'{q['answer']}', category:'{q['category']}',")
        lines.append(f"    passage:\"{pe}\",")
        lines.append(f"    sentence:\"{se}\",")
        lines.append(f"    analysis:'{ae}',")
        lines.append(f"    technique:'{te}'}},")
    lines.append('')
    lines.append('];')
    return '\n'.join(lines)

def print_summary(all_qs):
    from collections import Counter
    cats = Counter(q['category'] for q in all_qs)
    exams = Counter(q['exam'] for q in all_qs)

    NAMES = {
        'predicate': '谓语动词', 'nonpredicate': '非谓语动词', 'word': '词性转换',
        'number': '数词', 'article': '冠词', 'pronoun': '代词', 'preposition': '介词',
        'logic': '逻辑连词', 'attrib': '定语从句', 'nounclause': '名词性从句', 'advclause': '状语从句',
    }

    print("\n" + "="*60)
    print(f"Total: {len(all_qs)} questions from {len(exams)} exams")
    print("\nBy category:")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cat} ({NAMES.get(cat, cat)}): {count}")
    print("\nBy exam:")
    for exam, count in sorted(exams.items()):
        print(f"  {exam}: {count}")
    print("\nLow counts (< 10):")
    for cat, count in sorted(cats.items()):
        if count < 10:
            print(f"  WARNING: {cat} ({NAMES.get(cat, cat)}): only {count}")

if __name__ == '__main__':
    all_qs = process_all_exams()
    print_summary(all_qs)

    js = generate_js(all_qs)
    with open('/Users/zhenliu/Desktop/英语教学系统1.0/scripts/all_questions_output.js', 'w') as f:
        f.write(js)
    print(f"\nJS: {len(js)} chars")

    with open('/Users/zhenliu/Desktop/英语教学系统1.0/scripts/all_questions_debug.json', 'w') as f:
        json.dump(all_qs, f, ensure_ascii=False, indent=2)
    print(f"JSON written")
