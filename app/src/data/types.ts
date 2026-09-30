export interface Question {
  id: string;
  subject: string;
  paper_number: number;
  paper_name: string;
  attempt: string;
  exam_year: number;
  question_number: number;
  question_part: string | null;
  question_kind: "mcq" | "descriptive";
  has_or_alternative: boolean;
  question_text: string;
  suggested_answer: string;
  marks: string | null;
  source_id: string;
  source_filename: string;
  source_pdf: string;
  source_url: string;
  source_pages: { start: number; end: number } | null;
  parser_confidence: string | null;
  parser_warnings: string[];
  source?: string; // normalized source: "MTP" | "RTP" | "Suggested Answers"
  metadata?: {
    source?: string;
    source_name?: string;
    chapter?: string | null;
    topic?: string | null;
    [key: string]: unknown;
  };
}

export interface ExaminerRemark {
  id: string;
  attempt: string;
  exam_year: number;
  paper_number: number;
  subject: string | null;
  question_number: number;
  question_part: string | null;
  topic: string | null;
  remark_text: string;
}

export type Subject = "Cost and Management Accounting" | "Auditing and Ethics" | "Financial Management and Strategic Management";
export type Source = "RTP" | "MTP" | "Suggested Answers";
// preserved internally, not exposed in primary UI (ponytail: keep for future)
export type QuestionType = "All Types" | "MCQ" | "Descriptive" | "OR Alternative";

export interface FilterState {
  subject: Subject | null;
  attempt: string | null;
  chapter: string | null; // null = All Chapters
  source: Source | null; // null = All Sources
  searchQuery: string; // raw input
}

// back-compat alias used elsewhere if needed
export type SelectionState = FilterState & { questionType?: QuestionType | null; currentQuestionId?: string | null };
