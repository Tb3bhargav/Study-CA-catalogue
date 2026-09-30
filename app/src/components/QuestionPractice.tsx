import { useEffect, useState, useMemo, useRef } from "react";
import type { Question } from "../data/types";
import { SUBJECT_SHORT } from "../data/questions";

export function QuestionPractice({
  questions,
  currentId,
  onSelect,
  onBack,
}: {
  questions: Question[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const current = useMemo(() => {
    if (!currentId) return questions[0] ?? null;
    return questions.find((q) => q.id === currentId) ?? questions[0] ?? null;
  }, [questions, currentId]);

  useEffect(() => setShowAnswer(false), [current?.id]);

  const idx = useMemo(() => (current ? questions.findIndex((q) => q.id === current.id) : -1), [questions, current]);
  const total = questions.length;

  const qRef = useRef(questions);
  const idxRef = useRef(idx);
  qRef.current = questions;
  idxRef.current = idx;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const list = qRef.current;
      const i = idxRef.current;
      if (list.length === 0 || i < 0 || i >= list.length - 1) return;
      e.preventDefault();
      const nxt = list[i + 1];
      if (nxt) onSelect(nxt.id);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onSelect]);

  if (!current) return null;

  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < total - 1;

  return (
    <div className="mx-auto max-w-[1600px] px-6 lg:px-8 py-6">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(20,20,20,0.10)] bg-white px-3.5 py-2 text-[13px] font-medium text-ink-muted hover:bg-[#fdfcfa] hover:text-ink transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6" /></svg> Back to results
      </button>

      <div className="flex gap-6">
        {/* left navigator */}
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <div className="card sticky top-[80px] overflow-hidden">
            <div className="border-b border-[rgba(20,20,20,0.06)] bg-[#fdfcfa] px-4 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-accent uppercase">Questions · {total}</span>
                <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-white tabular-nums">{total}</span>
              </div>
              <div className="mt-1 text-[11px] leading-snug text-ink-muted truncate">{idx + 1} of {total} · {SUBJECT_SHORT[current.subject] ?? current.subject}</div>
            </div>
            <div className="max-h-[62vh] overflow-y-auto p-2">
              {questions.map((qq, i) => {
                const active = qq.id === current.id;
                return (
                  <button
                    key={qq.id}
                    onClick={() => onSelect(qq.id)}
                    aria-current={active ? "true" : undefined}
                    className={`mb-1.5 flex w-full items-start gap-2.5 rounded-xl px-3 py-3 text-left transition ${active ? "nav-active" : "nav-idle border border-transparent"}`}
                  >
                    <span className={`grid h-6 min-w-6 place-items-center rounded-full border font-mono text-[11px] font-semibold tabular-nums ${active ? "border-white/20 bg-white/15 text-white" : "border-[rgba(20,20,20,0.08)] bg-white text-ink-muted"}`}>{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`line-clamp-2 text-[12.5px] font-[500] leading-[1.5] ${active ? "text-white" : "text-ink"}`}>{qq.question_text.split("\n")[0].slice(0, 110)}</span>
                      <span className={`mt-1.5 inline-flex gap-1 ${active ? "opacity-90" : ""}`}>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] leading-none ${active ? "bg-white/15 text-white" : "bg-accent-light text-accent border border-[rgba(27,58,46,0.08)]"}`}>{qq.question_kind}</span>
                        {qq.marks && <span className={`rounded-full border bg-white px-2 py-0.5 font-mono text-[10px] leading-none ${active ? "border-white/20 bg-white/10 text-white" : "text-ink-muted"}`}>{qq.marks}</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* main */}
        <div className="min-w-0 flex-1">
          <div className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded-full border border-[rgba(20,20,20,0.08)] bg-white px-3 py-1 font-mono text-[11px] font-semibold tabular-nums text-ink-soft">Q{idx + 1} · {current.question_number}{current.question_part ? `(${current.question_part})` : ""}</span>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide font-mono uppercase ${current.question_kind === "mcq" ? "bg-accent-light text-accent border-[rgba(27,58,46,0.12)]" : "bg-white text-ink-muted"}`}>{current.question_kind}</span>
              {current.has_or_alternative && <span className="rounded-full bg-[#f3f0eb] px-2.5 py-1 text-[11px] font-semibold font-mono text-ink-muted">OR alternative</span>}
              {current.marks && <span className="rounded-full border bg-white px-2.5 py-1 font-mono text-[11px] tabular-nums text-ink-muted">{current.marks}</span>}
              <span className="ml-auto hidden items-center gap-1.5 font-mono text-[11px] text-ink-faint sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-accent/50" aria-hidden="true" /> {current.metadata?.source || current.source || "Suggested Answers"} · {current.attempt} · {SUBJECT_SHORT[current.subject] ?? current.subject}
              </span>
            </div>

            <h2 id="q-heading" className="sr-only">Question {idx + 1}</h2>
            <div data-testid="current-question" className="q-text mt-6 max-w-[70ch] whitespace-pre-wrap break-words text-[15.5px] text-ink" aria-labelledby="q-heading">
              {current.question_text}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowAnswer((v) => !v)}
                className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 ${showAnswer ? "border border-[rgba(20,20,20,0.12)] bg-white text-ink hover:bg-[#fdfcfa]" : "bg-accent text-white hover:bg-accent-soft shadow-[0_2px_8px_rgba(27,58,46,0.18)]"}`}
              >
                {showAnswer ? "Hide answer" : "Show Answer"}
              </button>
              <a href={current.source_url || "#"} target="_blank" rel="noreferrer" className={`rounded-full border border-[rgba(20,20,20,0.10)] bg-white px-5 py-2.5 text-[13px] font-medium text-ink-muted hover:text-ink hover:bg-[#fdfcfa] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/15 ${!current.source_url ? "opacity-50 cursor-not-allowed" : ""}`}>
                Source PDF ↗
              </a>
            </div>

            {showAnswer && (
              <div className="mt-6 overflow-hidden rounded-[14px] border border-[rgba(27,58,46,0.14)] border-l-4 border-l-accent bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <div className="p-6">
                  <div className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">{current.metadata?.source === "MTP" ? "MTP Answer" : current.metadata?.source === "RTP" ? "RTP Solution" : "Suggested Answer"}</div>
                  <div className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.78] text-ink-soft">{current.suggested_answer}</div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[rgba(20,20,20,0.06)] pt-4 font-mono text-[11px] text-ink-faint">
                    <span>{current.source_filename || current.metadata?.source_name || "—"}</span>
                    {current.source_pages && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Pages {current.source_pages.start}–{current.source_pages.end}</span>
                      </>
                    )}
                    {current.source_url && (
                      <>
                        <span aria-hidden="true">·</span>
                        <a href={current.source_url} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-4 hover:text-ink hover:decoration-accent/40">Open PDF</a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-[rgba(20,20,20,0.06)] pt-4">
              <span className="font-mono text-[12px] tabular-nums text-ink-muted">{idx + 1} of {total}</span>
              <div className="flex gap-3">
                <button
                  disabled={!hasPrev}
                  onClick={() => {
                    const p = questions[idx - 1];
                    if (p) onSelect(p.id);
                  }}
                  className="rounded-full border border-[rgba(20,20,20,0.10)] bg-white px-5 py-2.5 text-[13px] font-medium text-ink hover:bg-[#fdfcfa] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>
                <button
                  disabled={!hasNext}
                  onClick={() => {
                    const n = questions[idx + 1];
                    if (n) onSelect(n.id);
                  }}
                  className="rounded-full bg-accent px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(27,58,46,0.16)] hover:bg-accent-soft disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-[#f3f0eb] px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
            Tip: Use the left navigator or press <span className="font-mono font-semibold text-ink">→</span> to jump quickly · Filters stay active
          </div>
        </div>
      </div>
    </div>
  );
}
