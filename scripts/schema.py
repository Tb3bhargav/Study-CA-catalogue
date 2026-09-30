"""
Unified question schema helper — ponytail: single source of truth, no duplicate definitions.
Uses recommended JSON structure from spec, plus legacy flat fields for frontend compat.
"""
from __future__ import annotations
import re
import hashlib
from typing import Any

PAPER_SUBJECT_MAP = {
    4: "Cost and Management Accounting",
    5: "Auditing and Ethics",
    6: "Financial Management and Strategic Management",
}
PAPER_NAME_MAP = {
    4: "Paper-4: Cost and Management Accounting",
    5: "Paper-5: Auditing and Ethics",
    6: "Paper-6: Financial Management and Strategic Management",
}
SHORT_SUBJECT = {
    "Cost and Management Accounting": "CMA",
    "Auditing and Ethics": "AUD",
    "Financial Management and Strategic Management": "FMSM",
}

# reuse keyword logic from chapters.ts for chapter classification
CHAPTER_KEYWORDS: dict[str, list[str]] = {
    "Material Cost": ["material cost", "eoq", "economic order", "re-order", "reorder", "inventory", "stock level", "carrying cost", "ordering cost"],
    "Employee Cost": ["employee cost", "labour", "labor", "wages", "overtime", "idle time", "turnover"],
    "Overheads": ["overhead", "absorption", "apportionment", "allocation", "blanket rate"],
    "Activity Based Costing": ["activity based", "abc", "cost driver", "activity cost"],
    "Cost Sheet": ["cost sheet", "cost statement", "preparation of cost sheet"],
    "Cost Accounting System": ["cost accounting system", "integrated", "non-integrated", "reconciliation"],
    "Unit & Batch Costing": ["unit costing", "batch costing", "batch cost"],
    "Job Costing": ["job costing", "job cost", "contract costing"],
    "Process & Operation Costing": ["process costing", "process cost", "equivalent units", "normal loss", "abnormal", "operation costing"],
    "Joint Products and By Products": ["joint", "by-product", "by product", "split off", "further process"],
    "Service Costing": ["service costing", "operating costing", "transport", "hotel", "hospital"],
    "Standard Costing": ["standard costing", "variance", "material variance", "labour variance"],
    "Marginal Costing": ["marginal costing", "contribution", "break even", "breakeven", "p/v ratio", "margin of safety"],
    "Budget and Budgetary Control": ["budget", "budgetary", "flexible budget", "cash budget", "master budget"],
    "Nature, Objective and Scope of Audit": ["nature of audit", "objective of audit", "scope of audit", "inherent limitations"],
    "Audit Strategy, Planning and Programme": ["audit strategy", "audit planning", "audit programme", "audit plan"],
    "Audit Documentation & Evidence": ["audit documentation", "audit evidence", "working papers", "saa", "sa 230"],
    "Risk Assessment and Internal Control": ["risk assessment", "internal control", "internal check", "control risk"],
    "Fraud and Responsibilities": ["fraud", "error", "sa 240", "responsibilities of auditor"],
    "Audit in Automated Environment": ["automated environment", "caat", "computer assisted"],
    "Audit Sampling": ["audit sampling", "sampling risk", "tolerable error", "sa 530"],
    "Analytical Procedures": ["analytical procedure", "ratio analysis", "trend analysis", "sa 520"],
    "Audit of Items of Financial Statements": ["audit of items", "verification", "vouching", "receivables", "inventory audit"],
    "Company Audit": ["company audit", "section 139", "section 143", "appointment of auditor", "removal"],
    "Audit Reports": ["audit report", "qualified", "adverse", "disclaimer", "emphasis of matter", "sa 700"],
    "Audit of Banks": ["bank audit", "npa", "advances", "statutory audit of bank"],
    "Audit of Different Entities": ["llp audit", "co-operative", "government audit", "cag"],
    "Ethics": ["ethics", "code of ethics", "independence", "professional ethics", "charter"],
    "Scope and Objectives of Financial Management": ["scope of financial management", "objectives of financial", "profit maximisation", "wealth maximisation"],
    "Types of Financing": ["types of financing", "equity", "debenture", "preference share", "term loan"],
    "Financial Analysis and Planning — Ratio Analysis": ["ratio analysis", "liquidity ratio", "profitability ratio", "turnover ratio"],
    "Cost of Capital": ["cost of capital", "wacc", "cost of equity", "cost of debt", "capm"],
    "Financing Decisions — Capital Structure": ["capital structure", "optimum capital", "ebit-eps", "leverage"],
    "Financing Decisions — Leverages": ["leverage", "operating leverage", "financial leverage", "combined leverage"],
    "Investment Decisions": ["investment decision", "capital budgeting", "npv", "irr", "payback", "profitability index"],
    "Dividend Decisions": ["dividend", "dividend policy", "walter model", "gordon model", "mm hypothesis"],
    "Management of Working Capital": ["working capital", "cash management", "receivables management", "inventory management", "operating cycle"],
    "Introduction to Strategic Management": ["strategic management", "strategy", "vision", "mission", "objectives"],
    "Strategic Management Process": ["strategic management process", "environmental scanning", "swot"],
    "Corporate Level Strategies": ["corporate level", "growth strategy", "stability", "retrenchment", "combination"],
    "Business Level Strategies": ["business level", "porter's", "cost leadership", "differentiation", "focus"],
    "Functional Level Strategies": ["functional level", "marketing strategy", "operations strategy"],
    "Organisation and Strategic Management": ["organisation structure", "strategic business unit", "sbu"],
    "Strategic Management Implementation and Control": ["implementation", "strategic control", "evaluation", "balanced scorecard"],
}

def classify_chapter(question_text: str, paper_number: int | None) -> tuple[str | None, str | None]:
    """Heuristic chapter/topic — returns (chapter, topic). Uses keyword matching."""
    hay = question_text.lower()
    best = None
    best_kw = 0
    for ch, kws in CHAPTER_KEYWORDS.items():
        hits = sum(1 for kw in kws if kw.lower() in hay)
        if hits > best_kw:
            best_kw = hits
            best = ch
    if best_kw == 0:
        return None, None
    # topic = best for now; more specific extraction could split subtopic
    return best, best

def stable_id(*parts: object) -> str:
    digest = hashlib.sha1("|".join(str(p) for p in parts).encode()).hexdigest()[:12].upper()
    return f"Q-{digest}"

def make_question_id(subject: str, source: str, attempt: str, paper: int, qnum: int, part: str | None) -> str:
    """Deterministic ID encoding source context to avoid collisions — e.g., ACC_MTP1_PAPER4_Q001 or hash fallback."""
    subj_code = SHORT_SUBJECT.get(subject, "GEN")
    src = source.upper().replace(" ", "")
    att = attempt.replace(" ", "").upper()
    part_s = f"_{part.upper()}" if part else ""
    # e.g., CMA_SA_MAY2024_P4_Q001
    # keep safe chars
    base = f"{subj_code}_{src}_{att}_P{paper}_Q{qnum:03d}{part_s}"
    # ensure uniqueness even if same number appears twice via hash suffix if needed
    return base

def to_content_blocks(text: str) -> list[dict[str, Any]]:
    """Minimal structured content: single text block preserves whitespace. Table detection deferred — ponytail: text covers all, add when profiler says table UX broken."""
    # ponytail: keep simple — one text block per Q/A; table extraction is O(n^2) heuristic not yet needed for search-first V1
    if not text or not text.strip():
        return []
    # Preserve tables as text; don't flatten meaningful whitespace
    return [{"type": "text", "value": text.strip()}]

def build_question_record(
    *,
    subject: str,
    paper_number: int,
    attempt: str,
    exam_year: int | None,
    question_number: int,
    question_part: str | None,
    question_text: str,
    suggested_answer: str,
    marks: str | None,
    source: str,  # normalized: MTP, RTP, Suggested Answers
    source_name: str,
    paper_label: str | None = None,
    source_question_pdf: str | None = None,
    source_answer_pdf: str | None = None,
    source_pdf_single: str | None = None,
    page_start: int | None = None,
    page_end: int | None = None,
    question_kind: str = "descriptive",
    has_or_alternative: bool | None = None,
    parser_warnings: list[str] | None = None,
) -> dict[str, Any]:
    if has_or_alternative is None:
        has_or_alternative = bool(re.search(r"(?im)^\s*OR\s*$", question_text))
    if question_kind not in ("mcq", "descriptive"):
        question_kind = "descriptive" if len(question_text) > 200 else "descriptive"
    paper_name = PAPER_NAME_MAP.get(paper_number, f"Paper-{paper_number}")
    paper_label = paper_label or f"Paper {paper_number}"
    exam_year = exam_year or (int(attempt.split()[-1]) if attempt and attempt.split()[-1].isdigit() else None)
    # chapter/topic
    chapter, topic = classify_chapter(question_text, paper_number)
    # ID
    qid = make_question_id(subject, source, attempt, paper_number, question_number, question_part)
    # ensure global uniqueness: add hash suffix if collision risk (like duplicate Q numbers across PDFs). For now deterministic + hash fallback not needed; we include hash in needs_review path.
    # content blocks
    q_blocks = to_content_blocks(question_text)
    a_blocks = to_content_blocks(suggested_answer)
    # source_documents
    if source == "MTP":
        source_docs = {"question_pdf": source_question_pdf, "answer_pdf": source_answer_pdf}
        source_filename = source_question_pdf or source_answer_pdf or ""
        source_pdf = source_question_pdf or ""
    else:
        source_docs = {"question_pdf": source_pdf_single, "answer_pdf": source_pdf_single} if source_pdf_single else {}
        # single doc
        if source_question_pdf and not source_pdf_single:
            source_docs = {"question_pdf": source_question_pdf, "answer_pdf": source_answer_pdf or source_question_pdf}
        source_filename = (source_pdf_single or source_question_pdf or "")
        source_pdf = source_pdf_single or source_question_pdf or ""

    # legacy URL — try to preserve ICAI url pattern if available; otherwise placeholder
    source_url = ""
    if source == "Suggested Answers":
        # leave empty; real URL not known for new extraction unless mapped
        source_url = ""
    elif source == "MTP":
        source_url = ""
    elif source == "RTP":
        source_url = ""

    # needs_review flag
    needs_review = False
    review_reason = None
    warnings = parser_warnings or []
    if not question_text.strip() or not suggested_answer.strip():
        needs_review = True
        review_reason = "empty question or answer text"
        warnings.append("empty_content")
    if len(question_text.strip()) < 30:
        needs_review = True
        review_reason = (review_reason or "") + "; suspiciously short question"
    if len(suggested_answer.strip()) < 10:
        needs_review = True
        review_reason = (review_reason or "") + "; suspiciously short answer"

    record: dict[str, Any] = {
        "id": qid,
        # legacy flat fields for current frontend compat
        "subject": subject,
        "paper_number": paper_number,
        "paper_name": paper_name,
        "attempt": attempt,
        "exam_year": exam_year,
        "question_number": question_number,
        "question_part": question_part,
        "question_kind": question_kind,
        "has_or_alternative": has_or_alternative,
        "question_text": question_text,
        "suggested_answer": suggested_answer,
        "marks": marks,
        "source_id": qid,
        "source_filename": source_filename.split("/")[-1] if "/" in source_filename else source_filename.split("\\")[-1] if "\\" in source_filename else source_filename,
        "source_pdf": source_pdf,
        "source_url": source_url,
        "source_pages": {"start": page_start, "end": page_end} if page_start else None,
        "parser_confidence": "high" if not warnings else "review",
        "parser_warnings": warnings,
        # new enriched structure
        "metadata": {
            "subject": subject,
            "chapter": chapter,
            "topic": topic,
            "attempt": attempt,
            "year": exam_year,
            "source": source,
            "source_name": source_name,
            "paper": paper_label,
            "question_number": str(question_number) + (f"({question_part})" if question_part else ""),
            "marks": marks,
            "source_documents": source_docs,
            "page_start": page_start,
            "page_end": page_end,
            "question_kind": question_kind,
            "has_or_alternative": has_or_alternative,
        },
        "question": {"content": q_blocks},
        "answer": {"content": a_blocks},
        "needs_review": needs_review,
        "review_reason": review_reason.strip("; ") if review_reason else None,
    }
    return record
