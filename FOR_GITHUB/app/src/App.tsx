import { useEffect, useMemo, useState, useCallback } from "react";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { FilterBar } from "./components/FilterBar";
import { ResultsSummary, QuestionList } from "./components/QuestionList";
import { QuestionPractice } from "./components/QuestionPractice";
import { ChatbotDrawer, ChatbotFab } from "./components/Chatbot";
import { loadQuestions, filterQuestions } from "./data/questions";
import { getChaptersForSubject } from "./data/chapters";
import type { Question, Subject, Source } from "./data/types";

const MONTH_ORDER: Record<string, number> = { January: 1, May: 5, September: 9 };

function sortAttempts(attempts: string[]): string[] {
  return [...attempts].sort((a, b) => {
    // MTP attempts sort after regular attempts
    const aIsMTP = a.startsWith("MTP");
    const bIsMTP = b.startsWith("MTP");
    if (aIsMTP && !bIsMTP) return 1;
    if (!aIsMTP && bIsMTP) return -1;
    if (aIsMTP && bIsMTP) {
      // Sort MTP by number: MTP 1, MTP 2, ...
      const na = parseInt(a.replace("MTP ", "")) || 0;
      const nb = parseInt(b.replace("MTP ", "")) || 0;
      return na - nb;
    }
    const [ma, ya] = a.split(" ");
    const [mb, yb] = b.split(" ");
    const da = parseInt(ya) * 12 + (MONTH_ORDER[ma] ?? 0);
    const db = parseInt(yb) * 12 + (MONTH_ORDER[mb] ?? 0);
    return da - db;
  });
}

export default function App() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubjectRaw] = useState<Subject | null>(null);
  const [attempt, setAttempt] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [source, setSource] = useState<Source | null>(null);

  const [view, setView] = useState<"list" | "practice">("list");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    loadQuestions().then(setQuestions).catch((e) => setErr(String(e)));
  }, []);

  const attempts = useMemo(() => {
    if (!questions) return [];
    return sortAttempts([...new Set(questions.map((q) => q.attempt))]);
  }, [questions]);

  const setSubject = useCallback(
    (v: Subject | null) => {
      setSubjectRaw(v);
      if (chapter) {
        const allowed = getChaptersForSubject(v);
        if (!allowed.includes(chapter)) setChapter(null);
      }
    },
    [chapter],
  );

  const filtered = useMemo(() => {
    if (!questions) return [];
    return filterQuestions(questions, { subject, attempt, chapter, source, searchQuery });
  }, [questions, subject, attempt, chapter, source, searchQuery]);

  const currentQuestion = useMemo(() => {
    if (!filtered.length) return null;
    if (currentId) return filtered.find((q) => q.id === currentId) ?? filtered[0] ?? null;
    return filtered[0] ?? null;
  }, [filtered, currentId]);

  useEffect(() => {
    if (view !== "practice") return;
    if (filtered.length === 0) setCurrentId(null);
    else if (!currentId || !filtered.find((q) => q.id === currentId)) setCurrentId(filtered[0].id);
  }, [filtered, currentId, view]);

  const handlePractice = useCallback((q: Question) => {
    setCurrentId(q.id);
    setView("practice");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const handleSelectInPractice = useCallback((id: string) => setCurrentId(id), []);
  const handleBack = useCallback(() => setView("list"), []);
  const handleClear = useCallback(() => {
    setSearchQuery("");
    setSubjectRaw(null);
    setAttempt(null);
    setChapter(null);
    setSource(null);
  }, []);

  if (err) return <div className="grid min-h-screen place-items-center bg-[#fdfcfa] p-8 text-ink">Failed to load data: {err}</div>;
  if (!questions) return <div className="grid min-h-screen place-items-center bg-[#fdfcfa] p-8 text-ink-muted">Loading question bank…</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfa] text-ink">
      <Header onHome={handleBack} />

      {/* reflow wrapper — when chatbot open, content shifts left */}
      <div className={`transition-[margin] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${chatbotOpen ? "mr-[390px]" : "mr-0"}`}>
        {view === "practice" ? (
          <QuestionPractice questions={filtered} currentId={currentId} onSelect={handleSelectInPractice} onBack={handleBack} />
        ) : (
          <main className="mx-auto max-w-[1600px] px-6 pb-16 pt-6 lg:px-8">
            <div className="mb-7 rounded-[20px] border border-[rgba(20,20,20,0.06)] bg-gradient-to-br from-white via-white to-[#f8f4ee] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-[30px] font-normal tracking-[-0.025em] text-ink leading-none">Practice questions</h1>
                  <p className="mt-2.5 max-w-[640px] text-[13.5px] leading-relaxed text-ink-muted">Search 885 questions by topic, chapter or text — Cost & Management, Auditing, FM & SM — across May/Sep/Jan attempts and MTP/RTP/Suggested Answers in one place.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-black/5 px-3 py-1.5 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[11px] font-medium tracking-wide text-ink-muted">{questions.length} in bank • updated May 2026</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <FilterBar
                subject={subject}
                attempt={attempt}
                chapter={chapter}
                source={source}
                attempts={attempts}
                onSubject={setSubject}
                onAttempt={setAttempt}
                onChapter={setChapter}
                onSource={setSource}
              />
            </div>

            <div className="mt-6">
              <ResultsSummary count={filtered.length} query={searchQuery} />
            </div>

            <div className="mt-4">
              <QuestionList questions={filtered} query={searchQuery} onPractice={handlePractice} onClear={handleClear} />
            </div>

            <div className="mt-8 border-t border-[rgba(20,20,20,0.06)] pt-4 text-center text-[11.5px] leading-relaxed text-ink-faint">
              {filtered.length > 0 ? `${filtered.length} questions · ${attempts.length} attempts · ${questions.length} total` : `${questions.length} total questions in bank`}
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Study for CA · Group II</span>
            </div>
          </main>
        )}
      </div>

      <ChatbotDrawer
        open={chatbotOpen}
        searchQuery={searchQuery}
        subject={subject}
        attempt={attempt}
        chapter={chapter}
        source={source}
        filteredCount={filtered.length}
        totalCount={questions.length}
        currentQuestion={view === "practice" ? currentQuestion : null}
        filteredPreview={filtered}
      />
      <ChatbotFab open={chatbotOpen} onToggle={() => setChatbotOpen((v) => !v)} />
    </div>
  );
}
