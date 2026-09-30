export function Header({ onHome }: { onHome?: () => void }) {
  return (
    <header className="site-header">
      <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between gap-6 px-6 lg:px-8">
        <button
          onClick={onHome}
          className="group flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 rounded-xl px-2 -ml-2 py-1 hover:bg-white/60 transition"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-black/[0.06] overflow-hidden">
            <img src={`${(import.meta as unknown as { env: Record<string, string> }).env?.BASE_URL ?? "/"}logo.png`} alt="Study for CA" width={36} height={36} className="h-9 w-9 object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-[22px] font-normal tracking-[-0.02em] text-ink leading-none">Study for CA</span>
            <span className="hidden sm:inline text-[11px] font-medium tracking-[0.14em] text-ink-muted uppercase">The private study catalogue</span>
          </span>
        </button>
        <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-[rgba(20,20,20,0.06)] bg-white px-3 py-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
          <span className="text-[11px] font-medium tracking-wide text-ink-muted">Group II • 885 questions • Search-first</span>
        </div>
      </div>
    </header>
  );
}
