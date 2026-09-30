import type { Question, Subject, Source } from "../data/types";
import { useEffect, useRef, useCallback, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const NVIDIA_API_KEY = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_NVIDIA_API_KEY || "";
const NVIDIA_BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_NVIDIA_MODEL || "deepseek-ai/deepseek-v4-flash-0731";

function buildSystemPrompt(props: {
  searchQuery: string;
  subject: Subject | null;
  attempt: string | null;
  chapter: string | null;
  source: Source | null;
  filteredCount: number;
  totalCount: number;
  currentQuestion: Question | null;
  filteredPreview: Question[];
}): string {
  const { searchQuery, subject, attempt, chapter, source, filteredCount, totalCount, currentQuestion, filteredPreview } = props;
  const preview = filteredPreview.slice(0, 5).map((q, i) => `${i + 1}. [${q.metadata?.source || q.source}] ${q.subject} · ${q.attempt} · Q${q.question_number} — ${q.question_text.slice(0, 220).replace(/\n/g, " ")}`).join("\n");
  const current = currentQuestion ? `Current question in practice view:\nID: ${currentQuestion.id}\nSubject: ${currentQuestion.subject} · Paper ${currentQuestion.paper_number}\nAttempt: ${currentQuestion.attempt} · Kind: ${currentQuestion.question_kind}\nQuestion: ${currentQuestion.question_text.slice(0, 800)}\nAnswer: ${currentQuestion.suggested_answer.slice(0, 800)}` : "No question open in practice view.";
  return `You are Study Assistant for CA Intermediate Group II — The private study catalogue.
You help with Cost and Management Accounting, Auditing and Ethics, and Financial Management & Strategic Management.
You are context-aware: the user is currently viewing filtered results from a question bank of ${totalCount} questions.

Current view context:
- Search: ${searchQuery || "(none)"}
- Subject: ${subject ?? "All Subjects"}
- Attempt: ${attempt ?? "All Attempts"}
- Chapter: ${chapter ?? "All Chapters"}
- Source: ${source ?? "All Sources"}
- Results: ${filteredCount} / ${totalCount} questions

Top 5 questions in current filtered view:
${preview || "(no results)"}

${current}

Instructions:
- Be concise, exam-focused, and accurate. Use ICAI terminology.
- When asked to summarise, summarise the filtered set by subject/chapter/source.
- When asked to explain a chapter, explain with exam weightage and key concepts.
- When asked for a practice plan, propose a timed plan using the filtered count.
- For doubt solving, explain step-by-step, preserve tables as plain text, and cite question ID when relevant.
- Never hallucinate question IDs. If user asks beyond the bank, answer with general CA knowledge but flag it.
- Keep tone supportive, like a senior.
- Format with markdown, short paragraphs, and bullet points.`;
}

async function callNemotron(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  if (!NVIDIA_API_KEY) {
    throw new Error("Missing VITE_NVIDIA_API_KEY. Add it to app/.env (see .env.example) and restart vite.");
  }
  const isDev = (import.meta as unknown as { env: Record<string, string | boolean> }).env?.DEV;
  const base = isDev ? "/nvidia-proxy/v1" : NVIDIA_BASE_URL.replace(/\/+$/, "");
  const url = `${base}/chat/completions`;
  const modelsToTry = [NVIDIA_MODEL, "nvidia/nemotron-3-nano-30b-a3b"].filter((m, i, a) => a.indexOf(m) === i);
  let lastErr = "";
  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1200,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        lastErr = `DeepSeek ${model} ${res.status}: ${text.slice(0, 500) || res.statusText}`;
        if (res.status === 404 && model !== modelsToTry[modelsToTry.length - 1]) continue;
        throw new Error(lastErr);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string; reasoning?: string; reasoning_content?: string } }[];
        error?: { message?: string };
      };
      if (data.error?.message) throw new Error(data.error.message);
      const msg = data.choices?.[0]?.message;
      const reasoning = (msg as unknown as { reasoning?: string })?.reasoning || (msg as unknown as { reasoning_content?: string })?.reasoning_content;
      const content = msg?.content || "";
      if (!content && !reasoning) throw new Error("Empty response from DeepSeek");
      if (reasoning && content) return `${reasoning}\n\n${content}`;
      return reasoning || content;
    } catch (e) {
      clearTimeout(timeout);
      if (e instanceof DOMException && e.name === "AbortError") {
        lastErr = `DeepSeek ${model} timeout after 45s — your extra_body thinking:high + 16384 tokens is slow. Try again or the fallback nano will be used.`;
        if (model !== modelsToTry[modelsToTry.length - 1]) continue;
        throw new Error(lastErr);
      }
      if (e instanceof TypeError && String(e.message).includes("Failed to fetch")) {
        lastErr = `Network/CORS: Browser blocked direct fetch to NVIDIA (no CORS). In dev, use Vite proxy /nvidia-proxy (already configured). For static hosting, add a serverless proxy at /api/chat and set VITE_NVIDIA_BASE_URL to it.`;
        if (model !== modelsToTry[modelsToTry.length - 1]) continue;
        throw new Error(lastErr);
      }
      // rethrow if last model, else continue
      if (model === modelsToTry[modelsToTry.length - 1]) throw e;
      lastErr = e instanceof Error ? e.message : String(e);
      continue;
    }
  }
  throw new Error(lastErr || "All models failed");
}

export function ChatbotDrawer({
  open,
  searchQuery,
  subject,
  attempt,
  chapter,
  source,
  filteredCount,
  totalCount,
  currentQuestion,
  filteredPreview,
}: {
  open: boolean;
  searchQuery: string;
  subject: Subject | null;
  attempt: string | null;
  chapter: string | null;
  source: Source | null;
  filteredCount: number;
  totalCount: number;
  currentQuestion: Question | null;
  filteredPreview: Question[];
}) {
  const drawerRef = useRef<HTMLElement>(null);
  const inputId = "chatbot-input";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && open) e.preventDefault();
  }, [open]);

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const systemPrompt = buildSystemPrompt({ searchQuery, subject, attempt, chapter, source, filteredCount, totalCount, currentQuestion, filteredPreview });

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await callNemotron(nextMessages, systemPrompt);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      // keep user message, don't add assistant
    } finally {
      setLoading(false);
    }
  }, [messages, loading, systemPrompt]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  }, [input, send]);

  const quickPrompts = [
    "Summarise the current filtered results",
    "Explain the chapter for the current question",
    "Create a practice plan from these filters",
  ];

  return (
    <aside
      id="chatbot-drawer"
      ref={drawerRef}
      role="dialog"
      aria-modal={open ? true : undefined}
      aria-label="Study Assistant"
      aria-hidden={!open}
      {...(!open ? ({ inert: "" } as unknown as React.HTMLAttributes<HTMLElement>) : {})}
      className={`fixed bottom-0 right-0 top-0 z-40 flex w-[390px] max-w-[92vw] flex-col border-l border-[rgba(20,20,20,0.08)] bg-white shadow-[-16px_0_40px_rgba(0,0,0,0.08)] transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="border-b border-[rgba(20,20,20,0.06)] px-5 py-4 bg-[#fdfcfa]">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">Study Assistant</div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-semibold text-sky-800">● DeepSeek V4 Flash</span>
        </div>
        <div className="font-display text-[20px] font-normal text-ink leading-tight">Ask about this view</div>
        <div className="mt-1 text-[12px] text-ink-muted">Context-aware · {filteredCount} of {totalCount} · {NVIDIA_MODEL.split("/").pop()}</div>
      </div>

      <div className="border-b border-[rgba(20,20,20,0.06)] bg-[#fdfcfa] px-4 py-3.5">
        <div className="mb-2 text-[10.5px] font-semibold tracking-[0.12em] text-ink-muted uppercase">Screen context</div>
        <div className="flex flex-wrap gap-1.5">
          <Pill label="Search" value={searchQuery || "—"} />
          <Pill label="Subject" value={subject ?? "All Subjects"} />
          <Pill label="Attempt" value={attempt ?? "All Attempts"} />
          <Pill label="Chapter" value={chapter ?? "All Chapters"} />
          <Pill label="Source" value={source ?? "All Sources"} />
          <Pill label="Results" value={`${filteredCount} / ${totalCount}`} />
        </div>
        {currentQuestion && (
          <div className="mt-3 rounded-[14px] border border-[rgba(20,20,20,0.08)] bg-white p-3.5 shadow-sm">
            <div className="text-[11px] font-semibold text-accent uppercase tracking-[0.08em]">Current question</div>
            <div className="mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-ink">{currentQuestion.question_text.slice(0, 280)}…</div>
            <div className="mt-2 flex gap-1.5 font-mono">
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white uppercase">{currentQuestion.question_kind}</span>
              <span className="rounded-full border border-[rgba(20,20,20,0.08)] bg-[#fdfcfa] px-2 py-0.5 text-[10px] text-ink-muted">{currentQuestion.attempt}</span>
            </div>
          </div>
        )}
        {!currentQuestion && filteredPreview.length > 0 && (
          <div className="mt-3 rounded-[14px] border border-[rgba(20,20,20,0.08)] bg-white p-3 shadow-sm">
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.08em]">{filteredCount} questions in view</div>
            <div className="mt-2 flex flex-col gap-1.5">
              {filteredPreview.slice(0, 3).map((q, i) => (
                <div key={q.id} className="line-clamp-1 text-[12px] leading-relaxed text-ink-muted">
                  <span className="font-mono text-[11px] font-semibold text-ink">{i + 1}.</span> {q.question_text.split("\n")[0].slice(0, 90)}
                </div>
              ))}
              {filteredCount > 3 && <div className="text-[11px] text-ink-faint">+ {filteredCount - 3} more</div>}
            </div>
          </div>
        )}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4 bg-white">
        {messages.length === 0 ? (
          <>
            <div className="rounded-[16px] border border-[rgba(20,20,20,0.08)] bg-white p-4 shadow-sm">
              <div className="text-[13.5px] font-semibold text-ink">How can I help?</div>
              <div className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                I see your filters and the current question. Ask me to summarise, explain a chapter, or make a timed plan.
              </div>
              <div className="mt-3 grid gap-2">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => void send(p)}
                    className="rounded-xl border border-[rgba(20,20,20,0.08)] bg-[#fdfcfa] px-3.5 py-2.5 text-left text-[12.5px] font-medium text-ink-soft hover:bg-white hover:border-accent/20 hover:text-ink transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[16px] bg-ink px-4 py-3.5 text-white shadow-md">
              <div className="flex items-center justify-between text-[12px] font-semibold text-white/90">
                <span>Context payload</span>
                <span className="font-mono text-[10px] text-white/50">for DeepSeek</span>
              </div>
              <pre className="mt-2.5 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-white/[0.08] p-3 text-[11px] font-mono leading-relaxed text-white/85 border border-white/10">{JSON.stringify({ searchQuery: searchQuery || null, subject: subject ?? null, attempt: attempt ?? null, chapter: chapter ?? "All Chapters", source: source ?? "All Sources", filteredCount, totalCount, currentQuestion: currentQuestion ? { id: currentQuestion.id, paper_number: currentQuestion.paper_number, question_number: currentQuestion.question_number, attempt: currentQuestion.attempt } : null }, null, 2)}</pre>
            </div>
          </>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`rounded-[16px] px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${m.role === "user" ? "bg-accent text-white ml-6" : "bg-[#f8f4ee] border border-[rgba(20,20,20,0.06)] text-ink mr-2"}`}>
              <div className={`mb-1 text-[10px] font-semibold tracking-[0.08em] uppercase ${m.role === "user" ? "text-white/70" : "text-accent"}`}>{m.role === "user" ? "You" : "Assistant"}</div>
              <div className="whitespace-pre-wrap break-words">{m.content}</div>
            </div>
          ))
        )}
        {loading && <div className="rounded-[16px] bg-[#f8f4ee] border border-[rgba(20,20,20,0.06)] px-4 py-3 text-[13px] text-ink-muted animate-pulse">Thinking with DeepSeek…</div>}
        {error && <div className="rounded-[14px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] leading-relaxed text-red-800">{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[rgba(20,20,20,0.06)] bg-[#fdfcfa] p-3.5">
        <div className="flex gap-2">
          <label htmlFor={inputId} className="sr-only">AI chat input</label>
          <input
            id={inputId}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Ask about this filter or question…"
            className="flex-1 rounded-full border border-[rgba(20,20,20,0.10)] bg-white px-4 py-2.5 text-[13px] placeholder:text-ink-muted/70 shadow-sm focus:outline-none focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
            disabled={loading}
            autoComplete="off"
          />
          <button type="submit" disabled={loading || !input.trim()} className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-accent-soft disabled:opacity-40 disabled:cursor-not-allowed transition">Send</button>
        </div>
        <div className="mt-2 text-center text-[11px] text-ink-faint">DeepSeek V4 Flash · {NVIDIA_MODEL} · via NVIDIA Integrate</div>
      </form>
    </aside>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex max-w-[170px] items-center gap-1.5 rounded-full border border-[rgba(20,20,20,0.08)] bg-white px-2.5 py-1 text-ink shadow-sm">
      <span className="text-[9.5px] font-semibold tracking-[0.08em] text-accent uppercase shrink-0">{label}</span>
      <span className="truncate text-[11px] font-medium text-ink">{value}</span>
    </span>
  );
}

export function ChatbotFab({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label={open ? "Close assistant" : "Open assistant"}
      aria-expanded={open}
      aria-controls="chatbot-drawer"
      onClick={onToggle}
      className={`fixed bottom-5 z-50 grid h-[52px] w-[52px] place-items-center rounded-full border shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 ${open ? "bg-white text-ink border-[rgba(20,20,20,0.12)] right-[406px]" : "bg-accent text-white border-accent hover:bg-accent-soft right-5"}`}
    >
      {open ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6L6 18M6 6l12 12" /></svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z" /><path d="M8 12h8M12 8v8" /></svg>
      )}
    </button>
  );
}
