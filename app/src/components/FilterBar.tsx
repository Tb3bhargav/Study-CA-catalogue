import { getChaptersForSubject } from "../data/chapters";
import type { Subject, Source } from "../data/types";
import { SUBJECTS, SOURCES, SUBJECT_SHORT } from "../data/questions";

export function FilterBar({
  subject,
  attempt,
  chapter,
  source,
  attempts,
  onSubject,
  onAttempt,
  onChapter,
  onSource,
}: {
  subject: Subject | null;
  attempt: string | null;
  chapter: string | null;
  source: Source | null;
  attempts: string[];
  onSubject: (v: Subject | null) => void;
  onAttempt: (v: string | null) => void;
  onChapter: (v: string | null) => void;
  onSource: (v: Source | null) => void;
}) {
  const chapterOptions = getChaptersForSubject(subject);
  const subjectOptions: { label: string; value: string }[] = [
    { label: "All Subjects", value: "All Subjects" },
    ...Array.from(SUBJECTS).map((s) => ({ label: SUBJECT_SHORT[s] ?? s, value: s })),
  ];
  const attemptOptions: { label: string; value: string }[] = [
    { label: "All Attempts", value: "All Attempts" },
    ...attempts.map((a) => ({ label: a, value: a })),
  ];
  const sourceOptions: { label: string; value: string }[] = [
    { label: "All Sources", value: "All Sources" },
    ...Array.from(SOURCES).map((s) => ({ label: s, value: s })),
  ];
  const chapterLabels = chapterOptions.map((c) => ({ label: c, value: c }));

  const sVal = subject ?? "All Subjects";
  const aVal = attempt ?? "All Attempts";
  const cVal = chapter ?? "All Chapters";
  const srcVal = source ?? "All Sources";

  const Sel = ({
    label,
    id,
    value,
    opts,
    onChange,
  }: {
    label: string;
    id: string;
    value: string;
    opts: { label: string; value: string }[];
    onChange: (v: string) => void;
  }) => (
    <div className="flex flex-1 min-w-[170px] flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-semibold tracking-[0.12em] text-ink-muted uppercase">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="filter-select w-full py-2.5 pl-3 pr-8 text-[13.5px] font-medium leading-none text-ink focus:outline-none"
        >
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </div>
    </div>
  );

  return (
    <div className="filter-bar flex flex-wrap gap-3 p-3 sm:gap-4 sm:p-4">
      <Sel label="Subject" id="filter-subject" value={sVal} opts={subjectOptions} onChange={(v) => onSubject(v === "All Subjects" ? null : (v as Subject))} />
      <Sel label="Attempt" id="filter-attempt" value={aVal} opts={attemptOptions} onChange={(v) => onAttempt(v === "All Attempts" ? null : v)} />
      <Sel label="Chapter" id="filter-chapter" value={cVal} opts={chapterLabels} onChange={(v) => onChapter(v === "All Chapters" ? null : v)} />
      <Sel label="Source" id="filter-source" value={srcVal} opts={sourceOptions} onChange={(v) => onSource(v === "All Sources" ? null : (v as Source))} />
    </div>
  );
}
