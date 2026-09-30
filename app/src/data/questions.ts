import type { Question, FilterState } from "./types";
import { CHAPTERS, questionMatchesChapter } from "./chapters";

let cached: Question[] | null = null;
// ponytail: precomputed searchable strings for O(1) per-question search
let searchIndex: Map<string, string> | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (cached) return cached;
  // ponytail: base-relative so file://, subpath hosting, and HTA launch all work
  const base = (import.meta as unknown as { env: Record<string, string> }).env?.BASE_URL ?? "/";
  const candidates = [
    `${base.replace(/\/?$/, "/")}data/questions.json`,
    "data/questions.json",
    "./data/questions.json",
    "/data/questions.json",
  ].filter((u, i, a) => a.indexOf(u) === i);
  let lastErr = "";
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastErr = `${url}: HTTP ${res.status}`;
        continue;
      }
      cached = (await res.json()) as Question[];
      buildSearchIndex(cached);
      return cached;
    } catch (e) {
      lastErr = `${url}: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  throw new Error(`Failed to load questions.json (${lastErr})`);
}

export function getCachedQuestions(): Question[] | null {
  return cached;
}

function buildSearchIndex(questions: Question[]) {
  searchIndex = new Map();
  for (const q of questions) {
    // derive chapter labels matched heuristically — makes "Marginal Costing" searchable even if question_text uses "contribution"
    const matchedChapters: string[] = [];
    for (const list of Object.values(CHAPTERS)) {
      for (const ch of list) {
        if (ch === "All Chapters") continue;
        if (questionMatchesChapter(q.question_text, ch)) matchedChapters.push(ch);
      }
    }
    const text = [
      q.subject,
      q.paper_name,
      q.attempt,
      String(q.exam_year),
      q.question_text,
      q.question_kind,
      q.has_or_alternative ? "or alternative" : "",
      q.marks ?? "",
      matchedChapters.join(" "),
      // Include source fields for search
      q.source || q.metadata?.source || "",
      q.metadata?.source_name || "",
    ]
      .join(" ")
      .toLowerCase();
    searchIndex.set(q.id, text);
  }
}

// exported for testing — also used to build index on demand for tests
export function ensureSearchIndex(questions: Question[]) {
  if (!searchIndex || searchIndex.size === 0) buildSearchIndex(questions);
}
export function questionMatchesSearch(q: Question, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  let hay = searchIndex?.get(q.id);
  if (hay == null) {
    // fallback for tests / SSR — include derived chapters
    const matched: string[] = [];
    for (const list of Object.values(CHAPTERS)) {
      for (const ch of list) {
        if (ch === "All Chapters") continue;
        if (questionMatchesChapter(q.question_text, ch)) matched.push(ch);
      }
    }
    hay = [q.subject, q.paper_name, q.attempt, String(q.exam_year), q.question_text, matched.join(" ")].join(" ").toLowerCase();
  }
  // AND semantics: every token must appear
  return tokens.every((t) => hay.includes(t));
}

export function filterQuestions(questions: Question[], sel: FilterState): Question[] {
  let out = questions;

  if (sel.subject) {
    const paperMap: Record<string, number> = {
      "Cost and Management Accounting": 4,
      "Auditing and Ethics": 5,
      "Financial Management and Strategic Management": 6,
    };
    const pn = paperMap[sel.subject];
    if (pn) out = out.filter((q) => q.paper_number === pn);
  }

  if (sel.attempt) out = out.filter((q) => q.attempt === sel.attempt);

  // Source filtering: match against metadata.source or legacy source field
  if (sel.source) {
    out = out.filter((q) => {
      const src = q.metadata?.source || q.source || "";
      return src === sel.source;
    });
  }

  if (sel.chapter && sel.chapter !== "All Chapters") {
    out = out.filter((q) => questionMatchesChapter(q.question_text, sel.chapter));
  }

  const sq = sel.searchQuery?.trim();
  if (sq) {
    out = out.filter((q) => questionMatchesSearch(q, sq));
  }

  return out;
}

export const SUBJECTS = [
  "Cost and Management Accounting",
  "Auditing and Ethics",
  "Financial Management and Strategic Management",
] as const;

export const SOURCES = ["RTP", "MTP", "Suggested Answers"] as const;
export const QUESTION_TYPES = ["All Types", "MCQ", "Descriptive", "OR Alternative"] as const;

// For FilterBar display — short labels but full value preserved
export const SUBJECT_SHORT: Record<string, string> = {
  "Cost and Management Accounting": "Cost & Mgmt Acct.",
  "Auditing and Ethics": "Auditing & Ethics",
  "Financial Management and Strategic Management": "FM & SM",
};
