export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative group">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint group-focus-within:text-accent transition" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20L16.5 16.5" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search 885 questions — e.g. Depreciation, Audit Report, NPV..."
        aria-label="Search questions, chapters, topics"
        className="search-input w-full rounded-[16px] border border-[rgba(20,20,20,0.08)] bg-white py-[16px] pl-11 pr-[88px] text-[15px] font-[450] leading-none text-ink placeholder:font-normal placeholder:text-ink-faint shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] focus:outline-none"
        autoComplete="off"
        spellCheck={false}
      />
      <span className="pointer-events-none hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-[rgba(20,20,20,0.06)] bg-[#fdfcfa] px-2 py-1 font-mono text-[10px] font-medium tracking-wide text-ink-faint">
        <span className="grid h-4 w-4 place-items-center rounded bg-white border border-black/5 text-[10px]">⌘</span>K
      </span>
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-[52px] top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white border border-black/5 text-ink-muted hover:bg-[#f3f0eb] hover:text-ink hover:border-black/10 transition shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
