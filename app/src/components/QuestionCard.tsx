import type { Question } from "../data/types";
import { SUBJECT_SHORT } from "../data/questions";

function firstLine(q: Question): string {
  const line = q.question_text.split("\n")[0]?.trim() || q.question_text.slice(0, 120);
  return line.length > 140 ? line.slice(0, 137) + "…" : line;
}
function prettySubject(s: string): string {
  return SUBJECT_SHORT[s] ?? s;
}

export function QuestionCard({ q, index, onPractice }: { q: Question; index: number; onPractice: (q: Question) => void }) {
  const title = firstLine(q);
  const isMTP = (q.metadata?.source || q.source) === "MTP";
  const isRTP = (q.metadata?.source || q.source) === "RTP";
  return (
    <div className="card card-hover group flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-white tabular-nums shadow-sm">Q{index + 1}</span>
          {q.marks && <span className="rounded-full border border-[rgba(20,20,20,0.08)] bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-ink-muted tabular-nums">{q.marks}</span>}
          <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide ${q.question_kind === "mcq" ? "bg-accent-light text-accent border border-accent/10" : "bg-[#f3f0eb] text-ink-muted border border-black/5"}`}>{q.question_kind.toUpperCase()}</span>
          <span className="faint font-mono text-[11px]">·</span>
          <span className="font-mono text-[11px] tracking-wide text-ink-muted">{prettySubject(q.subject)} · Q{q.question_number}{q.question_part ? `(${q.question_part})` : ""}</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-[15.5px] font-semibold leading-[1.5] text-ink group-hover:text-ink-soft transition">{title}</h3>
        <div className="mt-2 line-clamp-2 text-[13.5px] leading-[1.6] text-ink-muted">
          {q.question_text.slice(title.length, title.length + 180).trim() ? q.question_text.slice(title.length, title.length + 180).trim().slice(0, 160) : q.question_text.slice(0, 160)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono tracking-wide text-ink-faint">
          <span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${isMTP ? "bg-amber-500" : isRTP ? "bg-sky-500" : "bg-accent"}`} />{q.attempt} · {q.paper_name.replace("Paper-","Paper ")}</span>
          <span aria-hidden="true">·</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${isMTP ? "bg-amber-50 text-amber-800 border-amber-200" : isRTP ? "bg-sky-50 text-sky-800 border-sky-200" : "bg-white text-ink-muted border-black/5"}`}>{q.metadata?.source || q.source || "Suggested Answers"}</span>
          {q.has_or_alternative && <span className="rounded-full bg-[#f3f0eb] px-2 py-0.5 text-[10px] font-semibold text-ink-muted border border-black/5">OR</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center sm:ml-4">
        <button
          onClick={() => onPractice(q)}
          className="group/btn inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(27,58,46,0.18)] hover:bg-accent-soft hover:shadow-[0_4px_12px_rgba(27,58,46,0.22)] hover:gap-2 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          Practice <span className="transition-transform group-hover/btn:translate-x-0.5">→</span>
        </button>
      </div>
    </div>
  );
}
