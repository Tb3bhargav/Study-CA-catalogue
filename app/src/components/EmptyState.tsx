export function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <div className="card p-10 text-center bg-gradient-to-b from-white to-[#fdfcfa]/50">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white border border-black/5 shadow-sm text-accent" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /><path d="M8 11h6" strokeLinecap="round" opacity="0.6" /></svg>
      </div>
      <h3 className="mt-4 font-display text-[20px] font-normal tracking-[-0.01em] text-ink">No questions found</h3>
      <p className="mx-auto mt-1.5 max-w-[520px] text-[13.5px] leading-relaxed text-ink-muted">Try adjusting your filters — the bank has 885 questions across all papers.</p>
      <div className="mx-auto mt-3 flex flex-wrap justify-center gap-2 text-[12px]">
        <span className="rounded-full bg-white border border-black/5 px-3 py-1 text-ink-muted">Remove a filter</span>
        <span className="rounded-full bg-white border border-black/5 px-3 py-1 text-ink-muted">Broader topic</span>
        <span className="rounded-full bg-white border border-black/5 px-3 py-1 text-ink-muted">Another source</span>
      </div>
      {onClear && (
        <button onClick={onClear} className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(27,58,46,0.18)] hover:bg-accent-soft hover:gap-2 active:scale-[0.98] transition-all">
          Clear filters <span>→</span>
        </button>
      )}
    </div>
  );
}
