import type { Question } from "../data/types";
import { QuestionCard } from "./QuestionCard";
import { EmptyState } from "./EmptyState";

export function ResultsSummary({ count, query }: { count: number; query: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <p className="text-[13px] font-medium text-ink-muted">
        <span className="font-semibold text-ink tabular-nums">{count}</span> {count === 1 ? "question" : "questions"} found{query ? <> for <span className="font-semibold text-ink">“{query}”</span></> : null}
      </p>
    </div>
  );
}

export function QuestionList({
  questions,
  onPractice,
  onClear,
}: {
  questions: Question[];
  query: string;
  onPractice: (q: Question) => void;
  onClear?: () => void;
}) {
  if (questions.length === 0) return <EmptyState onClear={onClear} />;
  return (
    <div className="flex flex-col gap-3">
      {questions.map((q, i) => (
        <QuestionCard key={q.id} q={q} index={i} onPractice={onPractice} />
      ))}
    </div>
  );
}
