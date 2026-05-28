#!/usr/bin/env python3
"""
build_grammar_bank.py

从 data/语法填空库/ 下的所有 markdown 文件提取语法填空题，输出统一的题库 JSON。

输出位置：
  - data/grammar_bank.json   （题库索引：按考点+按套件双视图）

每道题字段：
  exam_id     e.g. "2024广州一模"
  year, type ("真题"/"模拟卷"/"模拟题")
  no          空格题号 (36-45 或 56-65)
  answer
  explanation 该题完整解析
  grammar_point 解析中的「考查 X」原文标签
  category    11 类标准化分类
  passage     带 ___N___ 占位符的完整短文
  exam_title  e.g. "2024广州一模 · 语法填空"
"""
from __future__ import annotations
import json
import os
import re
import sys
from pathlib import Path

# 兼容两套路径：本地 macOS 真实路径 + 沙箱挂载路径
_CANDIDATES = [
    Path("/Users/zhenliu/Desktop/英语教学系统1.0/data/语法填空库"),
    Path("/sessions/compassionate-upbeat-archimedes/mnt/英语教学系统1.0/data/语法填空库"),
]
BANK_DIR = next((p for p in _CANDIDATES if p.exists()), _CANDIDATES[0])
OUT_FILE = BANK_DIR.parent / "grammar_bank.json"


# ───────────────────────── 11 类标准分类 ────────────────────────────
CATEGORY_NAMES = {
    "predicate":   "谓语动词",
    "nonpredicate": "非谓语动词",
    "word":        "词性转换",
    "number":      "数词",
    "article":     "冠词",
    "pronoun":     "代词",
    "preposition": "介词",
    "logic":       "逻辑连词",
    "attrib":      "定语从句",
    "nounclause":  "名词性从句",
    "advclause":   "状语从句",
}

CLASSIFICATION_CORRECTIONS = {
    ("2023浙江首考", 56): {
        "grammar_point": "连词",
        "category": "logic",
        "explanation": "考查并列连词。空格连接 planned the city of Beijing 和 arranged the residential areas 两个并列谓语动作，表示顺承关系，应用 and。",
    },
    ("2023浙江首考", 57): {
        "grammar_point": "副词",
        "category": "word",
        "explanation": "考查副词。originally 修饰 meaning，表示“最初意为”，应用副词形式 originally。",
    },
    ("2023浙江首考", 58): {
        "grammar_point": "非谓语动词",
        "category": "nonpredicate",
        "explanation": "考查非谓语动词。Forbidden City 与 surround 构成逻辑上的动宾关系，空格作后置定语，应用过去分词 surrounded。",
    },
    ("2023浙江首考", 59): {
        "grammar_point": "谓语动词",
        "category": "predicate",
        "explanation": "考查谓语动词。主语 Citizens 与 permit 为被动关系，结合历史叙述语境用一般过去时被动语态 were permitted。",
    },
    ("2023浙江首考", 60): {
        "grammar_point": "谓语动词",
        "category": "predicate",
        "explanation": (
            "考查谓语动词。句中缺少谓语，主语 The large siheyuan of these "
            "high-ranking officials and wealthy businessmen 与 feature 是主动关系；"
            "结合上文 dynastic period、Ming Dynasty 等历史语境，用一般过去时 featured。"
        ),
    },
    ("2023浙江首考", 61): {
        "grammar_point": "形容词",
        "category": "word",
        "explanation": "考查形容词。空格修饰 homes，space 变为形容词 spacious，表示“宽敞的”。",
    },
    ("2023浙江首考", 62): {
        "grammar_point": "形容词比较级",
        "category": "word",
        "explanation": "考查形容词比较级。空格与 far smaller 并列，比较普通百姓住宅与高阶层住宅的设计装饰，应用 simpler 或 more simple。",
    },
    ("2023浙江首考", 63): {
        "grammar_point": "介词",
        "category": "preposition",
        "explanation": "考查介词。history as capital of China 表示“作为中国首都的历史”，应用介词 as。",
    },
    ("2023浙江首考", 64): {
        "grammar_point": "名词复数",
        "category": "word",
        "explanation": "考查名词复数。event 为可数名词，前有 historic 修饰且语境表示多个历史事件，应用复数 events。",
    },
    ("2023浙江首考", 65): {
        "grammar_point": "冠词",
        "category": "article",
        "explanation": "考查定冠词。culture 后有 of grassroots Beijingers 限定，表示特定文化，应用 the。",
    },
    ("2024浙江首考", 56): {
        "grammar_point": "非谓语动词",
        "category": "nonpredicate",
        "explanation": "考查非谓语动词。buying extra 的目的或结果是 benefit from price reductions，此处用不定式作目的状语，填 to benefit。",
    },
    ("2024浙江首考", 57): {
        "grammar_point": "连词",
        "category": "logic",
        "explanation": "考查连词。Either...or... 为固定搭配，表示“要么……要么……”，应用 or。",
    },
    ("2024浙江首考", 58): {
        "grammar_point": "定语从句",
        "category": "attrib",
        "explanation": "考查定语从句。先行词为 the way，关系词在从句中作主语，且 way 前有 the 限定，此处用 that。",
    },
    ("2024浙江首考", 59): {
        "grammar_point": "名词性从句",
        "category": "nounclause",
        "explanation": "考查表语从句。空格引导表语从句，并在从句中作 promote 的宾语，表示“他们会推广的东西”，用 what。",
    },
    ("2024浙江首考", 60): {
        "grammar_point": "名词",
        "category": "word",
        "explanation": "考查名词。空格前有定冠词 the，后接同位语从句 that they lead to waste，应用名词 criticism。",
    },
    ("2024浙江首考", 61): {
        "grammar_point": "谓语动词",
        "category": "predicate",
        "explanation": "考查被动语态。they 指商品，与 offer 是被动关系，且位于 could 后，应用 be offered。",
    },
    ("2024浙江首考", 62): {
        "grammar_point": "谓语动词",
        "category": "predicate",
        "explanation": "考查谓语动词。时间状语 Over the last two years 常与现在完成时连用，主语 some supermarkets 为复数，填 have started。",
    },
    ("2024浙江首考", 63): {
        "grammar_point": "非谓语动词",
        "category": "nonpredicate",
        "explanation": "考查非谓语动词。packs 与 design 为被动关系，空格作后置定语，应用过去分词 designed。",
    },
    ("2024浙江首考", 64): {
        "grammar_point": "冠词",
        "category": "article",
        "explanation": "考查定冠词。one section 与 the other 构成“一者……另一者……”的对应关系，应用 the。",
    },
    ("2024浙江首考", 65): {
        "grammar_point": "代词",
        "category": "pronoun",
        "explanation": "考查代词。one 代指前文 some supermarkets 中的个体，前有 some of the more forward looking 修饰，应用复数 ones。",
    },
    ("2025浙江首考", 56): {
        "grammar_point": "冠词",
        "category": "article",
        "explanation": "考查冠词。way 为可数名词单数，此处表示“一种新的穿衣方式”，new 以辅音音素开头，应用 a。",
    },
    ("2025浙江首考", 57): {
        "grammar_point": "名词复数",
        "category": "word",
        "explanation": "考查名词复数。time 表“次数”时为可数名词，前有 fewer 修饰，应用复数形式 times。",
    },
    ("2025浙江首考", 58): {
        "grammar_point": "介词",
        "category": "preposition",
        "explanation": "考查介词。focus on 为固定搭配，表示“关注”，应用 on。",
    },
    ("2025浙江首考", 59): {
        "grammar_point": "连词",
        "category": "logic",
        "explanation": "考查并列连词。have something unique to wear 与 are not overstuffing... 构成并列关系，应用 and。",
    },
    ("2025浙江首考", 60): {
        "grammar_point": "非谓语动词",
        "category": "nonpredicate",
        "explanation": "考查非谓语动词。fashion clothes for women to rent 表示“供女性租用的时装”，用不定式作后置定语。",
    },
    ("2025浙江首考", 61): {
        "grammar_point": "名词",
        "category": "word",
        "explanation": "考查名词。空前有形容词 less expensive 修饰，且空格作 providing 的宾语，solve 应变为名词 solution。",
    },
    ("2025浙江首考", 62): {
        "grammar_point": "谓语动词",
        "category": "predicate",
        "explanation": "考查谓语动词。主语 The concept 为单数，句子陈述一般事实，应用一般现在时 is。",
    },
    ("2025浙江首考", 63): {
        "grammar_point": "定语从句",
        "category": "attrib",
        "explanation": "考查非限制性定语从句。先行词为 less formal clothing，关系词在从句中作 package 的宾语，应用 which。",
    },
    ("2025浙江首考", 64): {
        "grammar_point": "名词所有格",
        "category": "pronoun",
        "explanation": "考查名词所有格。空格修饰 lives，表示“人们的生活”，应用 people 的所有格 people's。",
    },
    ("2025浙江首考", 65): {
        "grammar_point": "非谓语动词",
        "category": "nonpredicate",
        "explanation": "考查非谓语动词。mean 表示“意味着”时后接动名词作宾语，应用 returning。",
    },
}


def classify(grammar_point: str, explanation: str, answer: str) -> str:
    """根据「考查 XX」标签 + 解析正文 + 答案表面形态，落到 11 类之一

    分类优先级：
      1) grammar_point（来自「考查 XX」原文标签）— 最权威
      2) 解析正文中的关键词扫描 — 次之
      3) 答案表面形态兜底
    """
    gp = (grammar_point or "").strip()
    expl = (explanation or "").strip()
    ans = (answer or "").strip().lower()

    # ───── 第 1 优先级：以 grammar_point 标签为准 ─────
    # （注意：动名词 / 现在分词 等关键词如果出现在解析的句子分析里，
    #  会导致误判 → 必须以 gp 标签为先）
    if gp:
        if any(k in gp for k in ["主语从句", "宾语从句", "表语从句", "同位语从句", "名词性从句"]):
            return "nounclause"
        if "定语从句" in gp:
            return "attrib"
        if "状语从句" in gp:
            return "advclause"
        if any(k in gp for k in ["非谓语动词", "不定式", "现在分词", "过去分词", "动名词", "分词"]):
            return "nonpredicate"
        # 注意：时态/语态/主谓一致 都是谓语动词题
        if any(k in gp for k in [
            "时态", "语态", "主谓一致", "动词时态", "动词的时态",
            "谓语动词", "动词语态"
        ]):
            return "predicate"
        if any(k in gp for k in ["介词"]):
            return "preposition"
        if any(k in gp for k in ["冠词", "定冠词", "不定冠词"]):
            return "article"
        if any(k in gp for k in ["代词", "人称代词", "物主代词", "反身代词", "指示代词"]):
            return "pronoun"
        if "连词" in gp and "从句" not in gp:
            return "logic"
        if any(k in gp for k in ["数词", "基数词", "序数词"]):
            return "number"
        if any(k in gp for k in [
            "形容词", "副词", "名词", "比较级", "最高级", "词性转换", "名词的数", "名词复数"
        ]):
            return "word"

    # ───── 第 2 优先级：解析正文关键词扫描（仅当无 gp 时） ─────
    text = expl
    if any(k in text for k in ["主语从句", "宾语从句", "表语从句", "同位语从句", "名词性从句"]):
        return "nounclause"
    if "定语从句" in text:
        return "attrib"
    if "状语从句" in text:
        return "advclause"
    if any(k in text for k in ["非谓语动词", "不定式作", "现在分词作", "过去分词作", "分词作"]):
        return "nonpredicate"
    if any(k in text for k in [
        "考查时态", "时态和主谓一致", "时态和语态", "时态语态", "动词时态",
        "动词的时态", "动词时态和主谓一致", "动词的时态、语态", "动词语态", "动词的语态",
        "时态、语态和主谓一致"
    ]):
        return "predicate"
    if "被动语态" in text and "非谓语" not in text:
        return "predicate"
    if any(k in text for k in ["考查介词", "介词短语"]):
        return "preposition"
    if any(k in text for k in ["考查冠词", "定冠词", "不定冠词"]):
        return "article"
    if any(k in text for k in [
        "考查代词", "人称代词", "物主代词", "反身代词", "指示代词", "不定代词"
    ]):
        return "pronoun"
    if any(k in text for k in [
        "考查连词", "并列连词", "选择关系", "转折关系", "并列关系", "因果关系", "递进关系"
    ]) and "从句" not in text:
        return "logic"
    if any(k in text for k in ["考查数词", "基数词", "序数词"]):
        return "number"
    if any(k in text for k in [
        "考查形容词", "考查副词", "考查名词", "考查词性转换",
        "名词复数", "名词的数", "比较级", "最高级"
    ]):
        return "word"

    # 2) 没命中 → 按答案表面形态兜底
    if ans in ("a", "an", "the"):
        return "article"
    if ans in ("by", "for", "from", "as", "to", "with", "at", "in", "on", "of",
               "into", "before", "after", "during", "through", "over", "under",
               "upon", "within", "without", "like", "towards", "onto", "above", "below"):
        return "preposition"
    if ans in ("and", "or", "but", "so", "yet", "nor"):
        return "logic"
    if ans in ("because", "since", "although", "though", "unless", "until",
               "while", "whereas", "whether", "if", "when", "as", "before", "after"):
        return "advclause"
    if ans in ("who", "whom", "which", "that", "whose", "where", "when", "why"):
        return "attrib"
    if ans in ("what", "how", "whatever", "whoever", "whichever", "whomever"):
        return "nounclause"
    if ans in ("it", "they", "them", "their", "theirs", "its", "he", "she", "him",
               "her", "his", "we", "us", "our", "ours", "you", "your", "yours",
               "me", "my", "mine", "myself", "yourself", "himself", "herself",
               "itself", "ourselves", "themselves", "this", "that", "these", "those",
               "one", "ones", "another", "other", "others"):
        return "pronoun"
    if "'s" in ans or "s'" in ans:
        return "pronoun"
    if ans.startswith("to "):
        return "nonpredicate"
    if ans.startswith(("was ", "were ", "is ", "are ", "has ", "have ", "had ", "be ", "been ")):
        return "predicate"
    if ans.endswith("ing") or ans.endswith("ed"):
        return "nonpredicate"
    return "word"


# ───────────────────────── 解析器 ─────────────────────────────
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
BLANK_BARE_RE = re.compile(r"_{2,}(\d+)_{2,}")
BLANK_U_RE = re.compile(r"<u>\s*(\d+)\s*</u>")


def parse_frontmatter(text: str) -> dict:
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}
    info = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            info[k.strip()] = v.strip()
    return info


def normalize_passage(raw: str) -> tuple[str, list[int]]:
    """把 ______56______ / <u>56</u> 全部规范为 ___56___，并返回空格号列表"""
    passage = raw
    passage = BLANK_U_RE.sub(lambda m: f"___{m.group(1)}___", passage)
    passage = BLANK_BARE_RE.sub(lambda m: f"___{m.group(1)}___", passage)

    blanks = [int(n) for n in re.findall(r"___(\d+)___", passage)]

    # 兜底：bare-number 题型（如 2025广州二模 用 "describes 56 this"）
    if len(blanks) < 8:
        # 探测候选数字（36-65 之间）
        candidates = []
        for m in re.finditer(r"(?<![_\d])(\d{2})(?![_\d])", passage):
            n = int(m.group(1))
            if 36 <= n <= 65:
                candidates.append(n)
        # 统计在 36-45 / 56-65 区间各有多少
        in_3645 = sorted(set(n for n in candidates if 36 <= n <= 45))
        in_5665 = sorted(set(n for n in candidates if 56 <= n <= 65))
        target = None
        if len(in_3645) >= 8 and len(in_3645) >= len(in_5665):
            target = in_3645
        elif len(in_5665) >= 8:
            target = in_5665
        if target:
            for n in sorted(target, reverse=True):
                # 用 word boundary 避免误伤
                passage = re.sub(rf"(?<![_\d]){n}(?![_\d])", f"___{n}___", passage, count=1)
            blanks = [int(n) for n in re.findall(r"___(\d+)___", passage)]

    # 去重保序
    seen = set()
    deduped = []
    for n in blanks:
        if n not in seen:
            seen.add(n)
            deduped.append(n)
    return passage, deduped


def extract_passage(body: str) -> str:
    """从 markdown body 中切出原文（不含答案/解析）"""
    # 题面以「阅读下面短文」/「阅读下面材料」开头，截止于第一处 【答案】 或 ### 答案
    start_markers = ["阅读下面短文", "阅读下面材料"]
    end_markers = ["【答案】", "【解析】", "### 第二节（语法填空）",
                   "### 第二节(语法填空）", "**答案与解析", "\n答案：", "\n【答案"]
    start = -1
    for m in start_markers:
        i = body.find(m)
        if i >= 0:
            # 跳过该行
            nl = body.find("\n", i)
            start = nl + 1 if nl >= 0 else i
            break
    if start < 0:
        # 退路：从「### 第二节」之后开始
        m = re.search(r"###\s*第二节[^\n]*\n", body)
        if m:
            start = m.end()
        else:
            start = 0

    end = len(body)
    for m in end_markers:
        i = body.find(m, start)
        if i >= 0:
            end = min(end, i)
    return body[start:end].strip()


def parse_answers(body: str, blanks: list[int]) -> dict[int, str]:
    """支持多种答案格式"""
    answers: dict[int, str] = {}

    # 找 【答案】 区段
    m = re.search(r"【\s*答案\s*】", body)
    if m:
        ans_zone_start = m.end()
        # 答案区段到下一个大段落标记
        end_idx = len(body)
        for marker in ["【解析】", "【导语】", "\n---"]:
            i = body.find(marker, ans_zone_start)
            if i >= 0:
                end_idx = min(end_idx, i)
        ans_zone = body[ans_zone_start:end_idx]

        # 去掉 ##alternative
        ans_zone_clean = re.sub(r"##[^\n]+", "", ans_zone)
        # 把多行合并为单行进行扫描
        flat = ans_zone_clean.replace("\n", " ")
        # 匹配 N[.|空格] answer
        # 允许 "36. answer" / "36 answer" 两种格式
        for mm in re.finditer(
            r"(\d+)[.\s]+([A-Za-z][\w\s'\-/]*?)(?=\s+\d+[.\s]+[A-Za-z]|\s*$)",
            flat,
        ):
            no = int(mm.group(1))
            ans = mm.group(2).strip().rstrip(".,;，。；")
            ans = ans.split("/")[0].strip().split("##")[0].strip()
            if no in blanks and no not in answers:
                answers[no] = ans

    # 「N. 【答案】 answer」格式（如 2024 全国二卷）
    if len(answers) < len(blanks):
        for mm in re.finditer(r"(\d+)\.\s*【\s*答案\s*】\s*([A-Za-z][\w\s'\-/]*)", body):
            no = int(mm.group(1))
            ans = mm.group(2).strip().rstrip(".,;，。；")
            ans = ans.split("/")[0].strip().split("##")[0].strip()
            if no in blanks and no not in answers:
                answers[no] = ans

    # 「**56. answer**」格式（如 2023 全国一卷）
    if len(answers) < len(blanks):
        for mm in re.finditer(r"\*\*(\d+)\.\s*([^*]+?)\*\*", body):
            no = int(mm.group(1))
            ans = mm.group(2).strip().rstrip(".,;，。；")
            ans = ans.split("/")[0].strip().split("##")[0].strip()
            if no in blanks and no not in answers:
                answers[no] = ans

    # 「答案与解析」+ 1-10 顺序编号格式（如 2025 广州二模）
    if not answers:
        m = re.search(r"答案与解析", body)
        if m:
            tail = body[m.end():]
            sorted_blanks = sorted(blanks)
            # 形如 "1. how /why 考查..." 或 "1. how /why考查..."
            entries = re.findall(
                r"\n\s*(\d{1,2})\.\s*([A-Za-z][\w'\-/\s]*?)(?=\s*考查|\s*[一-鿿])",
                "\n" + tail.replace("##", " "),
            )
            for idx_s, raw_ans in entries:
                idx = int(idx_s)
                if 1 <= idx <= 10 and idx - 1 < len(sorted_blanks):
                    no = sorted_blanks[idx - 1]
                    ans = raw_ans.strip().rstrip(".,;，。；").split("/")[0].strip()
                    if no not in answers:
                        answers[no] = ans

    return answers


def parse_explanations(body: str, blanks: list[int]) -> dict[int, str]:
    """支持多种解析格式，返回 {no: 完整解析正文}"""
    out: dict[int, str] = {}

    # 格式 A：【N 题详解】... \n（直到下一个【N 题详解】或文末）
    # 容忍 "【39题详解】" 或 "39题详解】"（左侧 【 偶尔缺失，来自源数据排版错误）
    matches_a = list(re.finditer(r"【?(\d+)题详解】", body))
    if matches_a:
        for i, m in enumerate(matches_a):
            no = int(m.group(1))
            start = m.end()
            end = matches_a[i + 1].start() if i + 1 < len(matches_a) else len(body)
            # 截止到下一个大段
            for marker in ["\n---", "\n【参考译文】"]:
                p = body.find(marker, start, end)
                if p >= 0:
                    end = p
            text = body[start:end].strip()
            if no in blanks:
                out[no] = text

    # 格式 B：「N. 【答案】 ans \n【解析】... 」（如 2024 全国二卷）
    if not out:
        # 用 anchors 切段
        pieces = re.split(r"\n(\d+)\.\s*【\s*答案\s*】", "\n" + body)
        if len(pieces) > 1:
            # pieces[0] 是前缀，后面交替 [no, content, no, content...]
            for i in range(1, len(pieces), 2):
                if i + 1 >= len(pieces):
                    break
                no = int(pieces[i])
                content = pieces[i + 1]
                expl_m = re.search(r"【\s*解析\s*】\s*(.+?)(?=\n\d+\.\s*【|\Z)",
                                   content, re.DOTALL)
                if expl_m and no in blanks:
                    out[no] = expl_m.group(1).strip()

    # 格式 C：「**56. answer**\n【解析】...」（如 2023 全国一卷）
    if not out:
        for mm in re.finditer(
            r"\*\*(\d+)\.\s*[^*]+\*\*\s*\n?\s*【\s*解析\s*】(.+?)(?=\n\*\*\d+\.|\n---|\Z)",
            body, re.DOTALL
        ):
            no = int(mm.group(1))
            if no in blanks:
                out[no] = mm.group(2).strip()

    # 格式 D：「56. answer 非谓语动词。...」  （如 2024 全国一卷集中解析）
    if len(out) < len(blanks):
        # 在 【解析】 段之后，按 「\n数字. word 」 切分
        m = re.search(r"\n【\s*解析\s*】\s*", body)
        if m:
            tail = body[m.end():]
            # 去 【导语】... 段
            tail = re.sub(r"【\s*导语\s*】.*?\n\n", "", tail, count=1, flags=re.DOTALL)
            # 找所有 "\n56. answer ..." 段
            entries = re.findall(
                r"\n(\d+)\.\s*([A-Za-z][\w'\-/]*(?:\s+[A-Za-z][\w'\-/]*)?)\s+(.+?)(?=\n\d+\.\s*[A-Za-z]|\n---|\Z)",
                "\n" + tail, re.DOTALL,
            )
            for no_s, _ans, content in entries:
                no = int(no_s)
                if no in blanks and no not in out:
                    out[no] = content.strip()

    # 格式 E：单行：「【36 题详解】不定冠词，...」（如 2025 深圳二模）
    if len(out) < len(blanks):
        for mm in re.finditer(r"【(\d+)题详解】(.+?)(?=【\d+题详解】|\n---|\Z)",
                              body, re.DOTALL):
            no = int(mm.group(1))
            if no in blanks and no not in out:
                out[no] = mm.group(2).strip()

    # 格式 F：「答案与解析」+ 顺序 1-10（如 2025 广州二模）
    if not out:
        m = re.search(r"答案与解析", body)
        if m:
            tail = body[m.end():]
            sorted_blanks = sorted(blanks)
            # 整段切分：每条以 "\n数字. " 开头
            segs = re.split(r"\n\s*(\d{1,2})\.\s*", "\n" + tail)
            # segs = [前缀, '1', content1, '2', content2, ...]
            for i in range(1, len(segs), 2):
                if i + 1 >= len(segs):
                    break
                idx = int(segs[i])
                content = segs[i + 1]
                if 1 <= idx <= 10 and idx - 1 < len(sorted_blanks):
                    no = sorted_blanks[idx - 1]
                    if no not in out:
                        out[no] = content.strip()

    # 清理空白
    return {no: re.sub(r"\s+", " ", t).strip() for no, t in out.items()}


def extract_grammar_point(explanation: str) -> str:
    """从解析中抽取「考查 XX」标签"""
    if not explanation:
        return ""
    m = re.search(r"考查([^。，,；;]+)", explanation)
    if m:
        gp = m.group(1).strip()
        # 截短
        if len(gp) > 20:
            gp = gp[:20]
        return gp
    # 没有「考查」字样，看开头的语法术语
    head = explanation[:30]
    for kw in ["非谓语动词", "定语从句", "宾语从句", "主语从句", "表语从句",
               "状语从句", "时态和语态", "时态语态", "动词时态", "动词的时态",
               "动词时态和主谓一致", "时态和主谓一致", "动词的时态、语态和主谓一致",
               "动词语态", "比较级", "最高级", "名词复数", "名词的数",
               "副词", "形容词", "名词", "代词", "冠词", "介词", "连词", "数词",
               "不定冠词", "定冠词", "物主代词", "反身代词"]:
        if kw in head:
            return kw
    return ""


# ───────────────────────── 主流程 ─────────────────────────────
def process_file(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    fm = parse_frontmatter(text)
    body = text[FRONTMATTER_RE.match(text).end():] if FRONTMATTER_RE.match(text) else text

    raw_passage = extract_passage(body)
    passage, blanks = normalize_passage(raw_passage)
    # 题号必须在合理区间
    blanks = [n for n in blanks if 30 <= n <= 70]
    if not blanks:
        print(f"  [skip] no blanks: {path.name}")
        return None

    answers = parse_answers(body, blanks)
    explanations = parse_explanations(body, blanks)

    exam_id = fm.get("exam", path.stem.split("_")[0])
    questions = []
    for no in sorted(blanks):
        if no not in answers:
            continue
        ans = answers[no]
        expl = explanations.get(no, "")
        gp = extract_grammar_point(expl)
        cat = classify(gp, expl, ans)
        correction = CLASSIFICATION_CORRECTIONS.get((exam_id, no))
        if correction:
            expl = correction.get("explanation", expl)
            gp = correction.get("grammar_point", gp)
            cat = correction.get("category", cat)
        questions.append({
            "no": no,
            "answer": ans,
            "explanation": expl,
            "grammar_point": gp,
            "category": cat,
            "category_name": CATEGORY_NAMES[cat],
        })

    return {
        "exam_id": exam_id,
        "year": int(fm.get("year", "0")),
        "type": fm.get("type", "真题"),
        "question_id": fm.get("question_id", ""),
        "passage": passage,
        "blank_count": len(questions),
        "questions": questions,
    }


def main():
    if not BANK_DIR.exists():
        print(f"[error] not found: {BANK_DIR}", file=sys.stderr)
        sys.exit(1)

    exams = []
    for md in sorted(BANK_DIR.glob("*.md")):
        result = process_file(md)
        if not result:
            continue
        print(f"  ✓ {result['exam_id']:18s}  {result['blank_count']:2d} 题")
        exams.append(result)

    # 全部题目展开成扁平列表（便于按考点检索）
    flat = []
    for ex in exams:
        for q in ex["questions"]:
            flat.append({
                "id": f"{ex['exam_id']}-{q['no']}",
                "exam_id": ex["exam_id"],
                "year": ex["year"],
                "type": ex["type"],
                "no": q["no"],
                "answer": q["answer"],
                "explanation": q["explanation"],
                "grammar_point": q["grammar_point"],
                "category": q["category"],
                "category_name": q["category_name"],
                "passage": ex["passage"],
            })

    # 按考点统计
    from collections import Counter
    cat_counter = Counter(q["category"] for q in flat)
    print()
    print(f"总计 {len(exams)} 套, {len(flat)} 题")
    print("按考点分布：")
    for cat, count in cat_counter.most_common():
        print(f"  {cat:14s} ({CATEGORY_NAMES[cat]:6s}) {count:3d} 题")

    payload = {
        "version": "1.0",
        "generated_from": "data/语法填空库",
        "category_names": CATEGORY_NAMES,
        "exams": exams,
        "questions": flat,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n→ 写入 {OUT_FILE}")

    # 同时输出一份 .js 包装文件（file:// 直接打开 HTML 时也能加载）
    js_path = OUT_FILE.with_suffix(".js")
    js_path.write_text(
        "// 自动生成 · 请勿手工编辑\n"
        "// 数据源：data/语法填空库/*.md\n"
        "// 重新生成：python3 scripts/build_grammar_bank.py\n"
        "window.GRAMMAR_BANK = " +
        json.dumps(payload, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"→ 写入 {js_path}")


if __name__ == "__main__":
    main()
