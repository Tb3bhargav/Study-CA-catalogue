import type { Subject } from "./types";

// Curated from ICAI Inter Group-II syllabus — see MASTER_SPEC §3.1
export const CHAPTERS: Record<Subject, string[]> = {
  "Cost and Management Accounting": [
    "All Chapters",
    "Introduction to Cost and Management Accounting",
    "Material Cost",
    "Employee Cost",
    "Overheads",
    "Activity Based Costing",
    "Cost Sheet",
    "Cost Accounting System",
    "Unit & Batch Costing",
    "Job Costing",
    "Process & Operation Costing",
    "Joint Products and By Products",
    "Service Costing",
    "Standard Costing",
    "Marginal Costing",
    "Budget and Budgetary Control",
  ],
  "Auditing and Ethics": [
    "All Chapters",
    "Nature, Objective and Scope of Audit",
    "Audit Strategy, Planning and Programme",
    "Audit Documentation & Evidence",
    "Risk Assessment and Internal Control",
    "Fraud and Responsibilities",
    "Audit in Automated Environment",
    "Audit Sampling",
    "Analytical Procedures",
    "Audit of Items of Financial Statements",
    "Company Audit",
    "Audit Reports",
    "Audit of Banks",
    "Audit of Different Entities",
    "Ethics",
  ],
  "Financial Management and Strategic Management": [
    "All Chapters",
    "Scope and Objectives of Financial Management",
    "Types of Financing",
    "Financial Analysis and Planning — Ratio Analysis",
    "Cost of Capital",
    "Financing Decisions — Capital Structure",
    "Financing Decisions — Leverages",
    "Investment Decisions",
    "Dividend Decisions",
    "Management of Working Capital",
    "Introduction to Strategic Management",
    "Dynamics of Competitive Strategy",
    "Strategic Management Process",
    "Corporate Level Strategies",
    "Business Level Strategies",
    "Functional Level Strategies",
    "Organisation and Strategic Management",
    "Strategic Management Implementation and Control",
  ],
};

// Keyword hints per chapter for heuristic matching against question_text
const KEYWORDS: Record<string, string[]> = {
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
  // Auditing
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
  // FM & SM
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
};

export function getChaptersForSubject(subject: Subject | null): string[] {
  if (!subject) return ["All Chapters"];
  return CHAPTERS[subject] ?? ["All Chapters"];
}

export function getKeywordsForChapter(chapter: string): string[] {
  return KEYWORDS[chapter] ?? [chapter.toLowerCase()];
}

export function questionMatchesChapter(questionText: string, chapter: string | null): boolean {
  if (!chapter || chapter === "All Chapters") return true;
  const hay = questionText.toLowerCase();
  const kws = getKeywordsForChapter(chapter);
  return kws.some(kw => hay.includes(kw.toLowerCase()));
}
