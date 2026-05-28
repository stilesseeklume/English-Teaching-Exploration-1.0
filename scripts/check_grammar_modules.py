#!/usr/bin/env python3
"""Validate grammar-fill module boundaries and HTML loading contracts."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRAMMAR_PAGE = ROOT / "docs" / "grammar-fill" / "index.html"
MODULE_DIR = ROOT / "docs" / "grammar-fill" / "modules"

EXPECTED_MODULES = [
    {
        "path": "passage-utils.js",
        "namespace": "GrammarPassageUtils",
        "exports": [
            "asText",
            "escapeRegExpText",
            "findBlankMatch",
            "safeQuestionNo",
            "getQuestionSentence",
            "getQuestionSentenceFallback",
            "getBlankPrefix",
            "extractSentence",
            "extractContextWindow",
            "splitTextParagraphs",
            "findParagraphIndexAtOffset",
            "splitEnglishSentences",
            "splitChineseSentences",
            "getQuestionChineseSentence",
        ],
        "legacy_globals": ["extractSentence", "extractContextWindow"],
    },
    {
        "path": "category-rules.js",
        "namespace": "GrammarCategoryRules",
        "exports": [
            "DEFAULT_CATEGORY_NAMES",
            "CATEGORY_TIPS",
            "buildCategoryMap",
            "getCategoryTip",
        ],
    },
    {
        "path": "focus-rules.js",
        "namespace": "GrammarFocusRules",
        "exports": [
            "getQuestionTextBlob",
            "hasExplicitWordCue",
            "hasAdverbCue",
            "hasAdjectiveCue",
            "getWordExplanationLead",
            "detectWordFormTarget",
            "hasBeDoneAnswer",
            "hasPredicatePassiveCue",
            "hasPredicateAgreementCue",
            "hasPredicatePerfectCue",
            "hasPredicatePastCue",
            "getTrapById",
            "inferQuestionTrapId",
            "getQuestionTrap",
            "getQuestionTrapId",
            "getQuestionFocus",
            "getQuestionFocusKey",
        ],
    },
    {
        "path": "teaching-axes.js",
        "namespace": "GrammarTeachingAxes",
        "exports": [
            "NONP_FUNCTION_LABELS",
            "NONP_FORM_LABELS",
            "NONP_FORM_NOTES",
            "getNonpAxis",
        ],
    },
    {
        "path": "teaching-view-model.js",
        "namespace": "GrammarTeachingViewModel",
        "exports": [
            "GRAPH_NODE_PRIORITY",
            "CATEGORY_GRAPH_FALLBACK",
            "GRAPH_NODE_TYPE_LABELS",
            "GRAPH_TYPE_COLORS",
            "GLOBAL_GRAPH_FOCUS_PRESETS",
            "TEACHING_GRAMMAR_MINDMAPS",
            "normalizeTab",
            "getTabLabel",
            "buildHeaderInfo",
            "getKnowledgeNodeIds",
            "getGraphNodeIdForQuestion",
            "getMindmapActiveKeys",
            "mindmapKeyMatches",
            "isMindmapBranchActive",
            "getMindmapDefinition",
            "getMindmapFallback",
            "buildGraphNodeIndex",
            "getGraphNodeTypeLabel",
            "getGraphTypeColor",
            "getGraphNodeSize",
            "getGraphRelevantIds",
            "graphHasFocus",
            "graphEdgeActive",
            "getGlobalGraphFocusPresets",
            "getGlobalGraphFocusPreset",
            "getGraphBoundsForNodes",
            "renderGraphTextLines",
            "getGraphNodeLabelGroups",
            "getGraphNodePath",
            "graphNodeMatchesQuestion",
            "getGlobalGraphQuestionMatches",
            "searchGraphNodes",
            "getNodeCategoryLabels",
            "getRootColorStyle",
        ],
    },
    {
        "path": "teaching-guide.js",
        "namespace": "GrammarTeachingGuide",
        "exports": [
            "FOCUS_GUIDES",
            "TRAP_GUIDES",
            "normalizeTeachingAxes",
            "detectPredicateForm",
            "getArticleGuide",
            "getLogicRelation",
            "getClauseRole",
            "getFocusGuide",
            "getQuestionTeachingGuide",
            "getQuestionLessonPath",
            "getQuestionPracticalGuide",
        ],
    },
    {
        "path": "migration-training.js",
        "namespace": "GrammarMigrationTraining",
        "exports": [
            "questionKey",
            "isErrorQuestionItem",
            "asArray",
            "sameQuestion",
            "nonpAxisExactMatch",
            "nonpAxisFormMatch",
            "dedupe",
            "onePerExam",
            "selectMigrationItems",
            "selectSourcePool",
            "buildTabs",
            "buildDisplayPools",
            "getTeachingMigrationKeys",
            "hasTeachingMigrationOverlap",
            "buildMigrationData",
        ],
    },
    {
        "path": "question-model.js",
        "namespace": "GrammarQuestionModel",
        "exports": [
            "buildAllQuestions",
            "buildExamsById",
            "getOrderedExams",
            "getFineTagInfo",
            "createExamQuestionFromRaw",
            "buildExamQuestions",
            "createExamStateFromId",
            "createErrorStateForQuestion",
            "countByFineTag",
            "getFrequencyStyle",
        ],
    },
    {
        "path": "home-dashboard-model.js",
        "namespace": "GrammarHomeDashboardModel",
        "exports": [
            "BOOK_ORDER",
            "COVER_MAP",
            "getGreeting",
            "getUserActivityState",
            "getTextbookGallery",
            "buildDashboardModel",
        ],
    },
    {
        "path": "exam-grid-model.js",
        "namespace": "GrammarExamGridModel",
        "exports": [
            "asArray",
            "isGreenExamType",
            "getExamTagClass",
            "getExamBlankCount",
            "normalizeYear",
            "compareYearDesc",
            "buildExamCardModel",
            "groupExamsByYear",
            "buildExamGridModel",
        ],
    },
    {
        "path": "classroom-switcher-model.js",
        "namespace": "GrammarClassroomSwitcherModel",
        "exports": [
            "asArray",
            "getExamBlankCount",
            "getExamLabel",
            "buildExamOptions",
            "buildQuestionOptions",
            "getProgressText",
            "buildAnswerButtonModel",
            "buildClassroomSwitcherModel",
        ],
    },
    {
        "path": "practice-view-model.js",
        "namespace": "GrammarPracticeViewModel",
        "exports": [
            "asArray",
            "asText",
            "buildPracticeHeaderModel",
            "buildToggleModel",
            "getStoredChineseText",
            "splitTranslationParagraphs",
            "buildChinesePassageModel",
            "getPracticePassageText",
            "groupCategoryQuestionsByExam",
            "getCategoryPracticeHint",
            "replaceBlankMarker",
            "buildCategoryPracticeModel",
            "getPassageSource",
            "splitPassageParagraphs",
            "getUnmatchedQuestions",
            "buildSequentialPassageModel",
            "applySequentialBlankReplacements",
        ],
    },
    {
        "path": "sidebar-view-model.js",
        "namespace": "GrammarSidebarViewModel",
        "exports": [
            "asArray",
            "getCategoryLabel",
            "isGreenExamType",
            "getExamTagClass",
            "groupExamsByYear",
            "buildCategoryItems",
            "buildErrorCategoryGroups",
            "buildErrorItems",
            "buildPrepItems",
            "shouldHideHomeSidebar",
            "buildPageSidebarModel",
            "buildContextSidebarModel",
        ],
    },
    {
        "path": "knowledge-view-model.js",
        "namespace": "GrammarKnowledgeViewModel",
        "exports": [
            "BOOK_ORDER",
            "COVER_MAP",
            "CATEGORY_STAT_COLORS",
            "stripHtml",
            "normalizeTagId",
            "countByFineTag",
            "getFrequencyStyle",
            "buildCategoryStatsModel",
            "buildSearchIndex",
            "searchKnowledgeIndex",
            "buildFineCategoryModel",
            "groupTextbookUnitsByBook",
            "buildTextbookUnitModel",
            "buildTextbookModel",
            "buildUnitQuestionListModel",
        ],
    },
    {
        "path": "saved-materials-model.js",
        "namespace": "GrammarSavedMaterialsModel",
        "exports": [
            "asArray",
            "getCategoryLabel",
            "getErrorFingerprint",
            "getPrepFingerprint",
            "normalizeErrorImportItem",
            "importErrorItems",
            "groupErrorsByCategory",
            "buildErrorListModel",
            "normalizePrepImportItem",
            "importPrepItems",
            "buildPrepListModel",
            "buildPrepQuestions",
            "createPrepStateForPassage",
        ],
    },
    {
        "path": "app-state.js",
        "namespace": "GrammarAppState",
        "exports": [
            "state",
            "get",
            "set",
            "patch",
            "createTeachingContextSnapshot",
            "isSameTeachingExamContext",
            "clampQuestionIndex",
            "getWrappedQuestionIndex",
            "getCurrentQuestionIndex",
            "getPreviousViewLabel",
            "normalizeHomeView",
            "getHomeDockKey",
            "buildHomeViewState",
            "normalizeKnowledgeView",
            "buildKnowledgeViewState",
            "getDockBackLabel",
            "createTeachingSession",
            "resetPracticeDisplayState",
            "togglePracticeAnswers",
            "togglePracticeChinese",
            "clampFontSize",
            "adjustFontSize",
            "buildFontScaleState",
        ],
    },
]

FORBIDDEN_IN_PURE_MODULES = [
    r"\bdocument\b",
    r"\bquerySelector\b",
    r"\bgetElementById\b",
    r"\baddEventListener\b",
    r"\binnerHTML\b",
    r"\blocalStorage\b",
    r"\bsessionStorage\b",
    r"\bfetch\s*\(",
    r"\balert\s*\(",
    r"\bconfirm\s*\(",
    r"\bnavigator\b",
    r"\blocation\b",
]


def fail(errors: list[str]) -> int:
    for error in errors:
        print(f"FAIL: {error}", file=sys.stderr)
    return 1


def script_module_order(html: str) -> list[str]:
    pattern = re.compile(r'<script\s+src="\.\/modules\/([^"]+)"\s*>\s*</script>')
    return pattern.findall(html)


def exported_object_body(text: str, namespace: str) -> str | None:
    marker = f"window.{namespace} = {{"
    start = text.find(marker)
    if start == -1:
        return None
    body_start = start + len(marker)
    end = text.find("\n  };", body_start)
    if end == -1:
        end = text.find("\n};", body_start)
    if end == -1:
        return None
    return text[body_start:end]


def strip_string_literals(text: str) -> str:
    # Keep the scanner simple: pure-module side-effect checks should not match
    # words inside classroom labels, regex strings, or data keys.
    return re.sub(r"(['\"])(?:\\.|(?!\1).)*\1", "''", text)


def check_module(module: dict[str, object]) -> list[str]:
    errors: list[str] = []
    rel_path = str(module["path"])
    namespace = str(module["namespace"])
    path = MODULE_DIR / rel_path
    if not path.exists() or path.stat().st_size == 0:
        return [f"missing non-empty grammar module docs/grammar-fill/modules/{rel_path}"]

    text = path.read_text(encoding="utf-8")
    body = exported_object_body(text, namespace)
    if body is None:
        errors.append(f"{rel_path}: missing window.{namespace} export object")
    else:
        for export in module.get("exports", []):
            if re.search(rf"\b{re.escape(str(export))}\s*:", body) is None:
                errors.append(f"{rel_path}: window.{namespace} missing export {export}")

    for global_name in module.get("legacy_globals", []):
        if f"window.{global_name} =" not in text:
            errors.append(f"{rel_path}: missing legacy window.{global_name} bridge")

    code_text = strip_string_literals(text)
    for pattern in FORBIDDEN_IN_PURE_MODULES:
        if re.search(pattern, code_text):
            errors.append(f"{rel_path}: pure module should not use browser side effect {pattern}")

    return errors


def main() -> int:
    errors: list[str] = []
    if not GRAMMAR_PAGE.exists():
        return fail(["missing docs/grammar-fill/index.html"])

    html = GRAMMAR_PAGE.read_text(encoding="utf-8")
    expected_order = [str(item["path"]) for item in EXPECTED_MODULES]
    actual_order = script_module_order(html)

    if actual_order != expected_order:
        errors.append(
            "grammar-fill module script order mismatch: "
            f"expected {expected_order}, got {actual_order}"
        )

    for module in EXPECTED_MODULES:
        errors.extend(check_module(module))

    if errors:
        return fail(errors)

    print(f"OK: grammar-fill module contracts valid ({len(EXPECTED_MODULES)} modules)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
