# Study for CA — MASTER SPEC (V1 Source of Truth)

> This is the canonical product + architecture spec. Later agents MUST read this before coding.
> Last updated: 2026-08-26 · Status: V1 build in progress.

---

## 1. Product Identity

**Name:** Study for CA

**Positioning:** Desktop-first CA Intermediate Group-II question-practice website. Feels like an elegant physical academic book — premium, rich, calm, sophisticated, modern. NOT a generic SaaS dashboard, NOT glassmorphism-heavy, NOT a rounded startup template.

**Scope V1:** Desktop only (≥1280px canonical). Architecture must stay extendable to mobile later, but no mobile responsiveness as a major V1 feature. Every layout uses desktop-first CSS with a single 1280 breakpoint note for future work.

---

## 2. Book Video Asset

**File:** `Background Base video.mp4` (1920×1080, h264, 12.966s, 30fps) — at `C:/.../Background Base video.mp4`. Copied to `public/book.mp4` for serving.

**Canonical timestamps (seconds):**
```ts
export const BOOK_TIMESTAMPS = {
  P1: 3.46,
  P2: 5.12,
  P3: 6.77,
  P4: 8.43,
  P5: 10.08,
  END: 12.96, // final zoom complete
} as const;
```

**Segments (no holds — continuous timeline, paused by app):**
| Segment | Range | Meaning |
|---------|-------|---------|
| open → P1 | 0.00 → 3.46 | Book opens to Page 1 |
| P1 → P2 | 3.46 → 5.12 | Page turn 1→2 |
| P2 → P3 | 5.12 → 6.77 | 2→3 |
| P3 → P4 | 6.77 → 8.43 | 3→4 |
| P4 → P5 | 8.43 → 10.08 | 4→5 |
| P5 → END | 10.08 → 12.96 | Zoom into RIGHT page |

**Playback rules:**
- First click/touch OR scroll anywhere triggers `0 → P1`. Any one of those events qualifies; only the first fires.
- On reaching `P1` → pause, show Page 1 UI, **lock scrolling** (body `overflow:hidden`).
- Scrolling does NOT control later turns. Only UI submission drives `P1→P2`, `P2→P3`, etc.
- Each transition pauses at the target timestamp until user submits the selector for that page.
- After P5 "Begin Practice" → play `P5 → END`. On `END` → freeze video (pause) and keep last frame as locked background for question practice.
- Use threshold/crossing logic (`currentTime >= target - epsilon`), never `===`.
- Centralize timestamps in `src/config/video.ts`.
- Prevent duplicate transitions: video engine exposes `isTransitioning` guard + promise.

---

## 3. Five Book Pages (Selection Flow)

| Page | Selector | Options source |
|------|----------|---------------|
| P1 | Choose Subject | Paper 4/5/6 → mapped to subject names (Cost & Mgmt Accounting, Auditing & Ethics, FM & SM). Single select. |
| P2 | Choose Attempt | From `metadata.json` attempts: May 2024, Sep 2024, Jan 2025, May 2025, Sep 2025, Jan 2026, May 2026. |
| P3 | Choose Chapter | Syllabus-curated chapters per subject (see §3.1). "All Chapters" is default inclusive option. |
| P4 | Choose Source | Fixed: `RTP`, `MTP`, `Suggested Answers`. All map to dataset (V1 dataset is suggested_answers authoritative). |
| P5 | Choose Question Type | Derived from dataset `question_kind` + `has_or_alternative`: `All Types`, `MCQ`, `Descriptive`, `OR Alternative`. |

**Submit behavior per page:** Selecting an option does NOT auto-advance. User clicks the page's primary action (labeled per page, P5 = "Begin Practice"). That click triggers the video page-turn and reveals next page's UI after pause.

### 3.1 Chapter Taxonomy (curated from ICAI syllabus — not invented categories)

> Chapters are real ICAI Inter Group-II syllabus chapters. Filtering is heuristic keyword matching on `question_text` + `topic` (remarks). "All Chapters" always returns full filtered set; specific chapter filters to keyword hits. This keeps V1 honest ("Do not invent unsupported categories") while providing the required selector.

**P4 — Cost and Management Accounting (16 incl. All):**
All Chapters, Introduction to Cost and Management Accounting, Material Cost, Employee Cost, Overheads, Activity Based Costing, Cost Sheet, Cost Accounting System, Unit & Batch Costing, Job Costing, Process & Operation Costing, Joint Products and By Products, Service Costing, Standard Costing, Marginal Costing, Budget and Budgetary Control

**P5 — Auditing and Ethics (15 incl. All):**
All Chapters, Nature Objective and Scope of Audit, Audit Strategy Planning and Programme, Audit Documentation & Evidence, Risk Assessment and Internal Control, Fraud and Responsibilities, Audit in Automated Environment, Audit Sampling, Analytical Procedures, Audit of Items of Financial Statements, Company Audit, Audit Reports, Audit of Banks, Audit of Different Entities, Ethics

**P6 — FM & SM (18 incl. All):**
All Chapters, Scope and Objectives of FM, Types of Financing, Ratio Analysis, Cost of Capital, Capital Structure, Leverages, Investment Decisions, Dividend Decisions, Working Capital Management, Introduction to Strategic Management, Dynamics of Competitive Strategy, Strategic Management Process, Corporate Level Strategies, Business Level Strategies, Functional Level Strategies, Organisation and SM, SM Implementation and Control

### 3.2 Question Type Options

Derived from actual `question_kind` and `has_or_alternative` fields:
- All Types (no filter)
- MCQ (`question_kind === 'mcq'`)
- Descriptive (`question_kind === 'descriptive'`)
- OR Alternative (`has_or_alternative === true`, orthogonal to mcq/descriptive — combinable via filter pipeline)

### 3.3 Source Options

Fixed: `RTP`, `MTP`, `Suggested Answers`. V1 dataset is 100% Suggested Answers, so RTP/MTP filters yield 0 results with an empty-state message ("No RTP questions in current dataset — showing Suggested Answers"). This satisfies the visual requirement without fabricating data.

---

## 4. Selection State — Single Source of Truth

**Store:** `src/store/selection.ts` — single Zustand-like lightweight store (implemented as React context + reducer to avoid extra dependency — ponytail: zero deps).

**Shape:**
```ts
type Subject = 'Cost and Management Accounting' | 'Auditing and Ethics' | 'Financial Management and Strategic Management';
type Source = 'RTP' | 'MTP' | 'Suggested Answers';
type QuestionType = 'All Types' | 'MCQ' | 'Descriptive' | 'OR Alternative';

interface SelectionState {
  subject: Subject | null;
  attempt: string | null;        // e.g. "May 2024"
  chapter: string | null;        // chapter label; "All Chapters" means null filter
  source: Source | null;
  questionType: QuestionType | null;
  currentQuestionId: string | null;
  // derived
  filteredQuestions: Question[]; // computed selector, not stored
}
```

**Revalidation rules (preserve valid downstream):**
- On change of `subject`:
  - Validate `chapter` belongs to new subject's chapter list → else clear to "All Chapters" (null).
  - `attempt`, `source`, `questionType` preserved (attempts are shared across subjects).
- On change of `attempt` / `source` / `questionType`:
  - Filter pipeline re-runs; if `currentQuestionId` no longer in filtered set → clear to first question or null.
- On change of `chapter`:
  - Same filter revalidation for currentQuestionId.
- Never blindly reset all downstream.
- Sidebar, book selectors, question interface, chatbot context all read the SAME store.

**Filter pipeline (pure function `src/data/filter.ts`):**
1. by subject (maps subject → paper_number)
2. by attempt (exact match on `attempt` field)
3. by source (V1: Suggested Answers passes all; RTP/MTP → 0 with message)
4. by chapter (heuristic keyword matching — see `src/data/chapters.ts`)
5. by questionType

---

## 5. Navigation

### Top-left brand
- "Study for CA" — elegant serif (Cormorant Garamond / Cormorant) + tight tracking, premium weight.
- Below it: Home icon (house outline, stroke 1.5).

### Sidebar (hover-reveal)
- Trigger: hover on Home icon → open after **180ms** intentional delay (prevents accidental).
- Stays open while pointer is inside sidebar bounds; closes 220ms after pointer leaves both icon and sidebar (grace period).
- Contains destinations: Subject, Attempt, Chapter, Source, Question Type.
- Clicking a destination jumps DIRECTLY to that book page (seeks video to that page's timestamp and shows its UI) WITHOUT forcing sequential traversal. Preserves existing selections.
- After END (practice phase), sidebar still works — jumps back to book phase (re-enters book UI at that page; video seeks accordingly).

---

## 6. Video Engine

**Central config:** `src/config/video.ts`

**State machine:** `src/hooks/useBookVideo.ts` — exposes:
```ts
{
  ref: RefObject<HTMLVideoElement>,
  phase: 'idle' | 'opening' | 'paused-at-page' | 'turning' | 'zooming' | 'practice',
  currentPage: 0|1|2|3|4|5,
  isTransitioning: boolean,
  hasStarted: boolean,
  playTo(target: number): Promise<void>, // threshold-crossing guarded
  seekToPage(page: 1|2|3|4|5): void,
  pauseAt(ts: number): void,
}
```

**Implementation notes:**
- Uses `timeupdate` + `requestAnimationFrame` double-guard with `EPSILON = 0.08` threshold (`if currentTime >= target - 0.05` → clamp, pause, resolve).
- Sets `video.currentTime` smoothly via `play()` not `currentTime` jumps, except for sidebar jump seeks.
- Guards: `isTransitioning` blocks double clicks; `hasStarted` blocks second initial trigger; scroll listener removed after first trigger.
- All timestamps single-sourced from `BOOK_TIMESTAMPS`.
- Poster/fallback: first frame as `poster` + background color `#0f0e0c` so no flash.

---

## 7. Question Practice Interface

**Trigger:** After P5 submit → play `10.08 → 12.96` → on `END` → `phase = 'practice'`.

**Layout over locked video background:**
- Video stays as `position:fixed` background, `object-fit: cover`, `filter: brightness(0.72)` + warm overlay `rgba(28,20,12,0.18)` + subtle paper-grain CSS.
- Practice shell: `max-width: 1160px`, centered, with card styling that belongs to book palette (see §9).

**Structure:**
- **Left navigator (280px):** vertical list of filtered questions (number + type badge + truncated preview). Active state highlighted. Clickable to jump. Shows empty-state when 0 results.
- **Main area (flex:1):** current question card: question_number/part, marks, `question_text` (preserved whitespace via `white-space: pre-wrap`), `has_or_alternative` badge, source provenance footer (attempt · paper · source PDF link).
- **Card actions:** "Show Suggested Answer" toggle (reveals `suggested_answer` with same pre-wrap), source link.
- **Bottom-right:** "Next →" button immediately LEFT of chatbot FAB. Disabled at end. Also handles keyboard → (right arrow).

**Data layer:**
- `src/data/questions.ts` — loads `public/data/questions.json` + `examiner_remarks.json` + `metadata.json` at build (copied) and exposes `getFilteredQuestions(selection)`, `getQuestionById()`, `getAttempts()`, `getSubjects()`.
- Mock layer is the real dataset (561 records) — no guessed schema. Interface is `Question` type derived from actual JSON keys. `src/data/types.ts`.
- Marks may be null → UI renders without marks badge.

---

## 8. Chatbot

**Button:** Always visible bottom-right FAB (circular, 52px, paper-toned). Labeled with chat icon.

**Drawer:** Slides from right, **~390px** width (spec target). Is NOT an overlay — layout reflows.

**Layout reflow:**
- Practice shell is inside `<div class="app-layout" data-chatbot-open={open}>`.
- CSS: `.app-layout { display:flex; } .practice-main { flex:1; transition: margin-right 280ms ease } [data-chatbot-open="true"] .practice-main { margin-right: 390px; }` — content moves left.
- Chatbot drawer: `position:fixed; right:0; top:0; bottom:0; width:390px; transform: translateX(100%) → 0` with same transition.
- Toggle again closes and restores width.

**Context interface (V1 shell):** `src/context/chatbot.ts`
```ts
interface ChatbotContextPayload {
  subject: Subject | null;
  attempt: string | null;
  chapter: string | null;
  source: Source | null;
  questionType: QuestionType | null;
  currentQuestion: Question | null;
}
```
Drawer displays these as read-only pills + placeholder thread ("AI assistance coming soon — context is wired"). No backend invented.

---

## 9. Visual Identity

**Palette — academic book:**
- Page warm: `#faf6ef`, `#f1e8d6`, `#e8ddd0`
- Ink: `#1a1a18`, `#2c2a26`, `#6b6560`
- Accent (muted brass/gold for active states): `#b8985b`, `#8c7340`
- Book leather/wood backdrop: via video; fallback `#0f0e0c`
- Borders: `rgba(44,42,38,0.10)` — hairline, NOT heavy.

**Typography:**
- Display/brand: `Cormorant Garamond` (Google Fonts) — elegant, high-contrast serif.
- Body: `Inter` or `IBM Plex Sans` — neutral, readable.
- Mono for metadata: `IBM Plex Mono` or `JetBrains Mono` at 11px for source provenance.

**Do NOT use:**
- Glassmorphism excess, heavy blur, neon, large rounded 24px cards, generic SaaS gradients.

**Components:**
- Book selectors: large, calm, bordered cards (radius 14px, not pill), hover → subtle brass border, selected → filled brass-ink.
- Buttons: solid ink `#1a1a18` with brass hover, or ghost with hairline border.
- Cards: warm paper background with subtle shadow `0 8px 32px rgba(16,14,10,0.10)` + hairline border.

---

## 10. Project Structure (actual)

```
/public
  book.mp4
  poster.jpg (fallback, optional)
  data/
    questions.json
    examiner_remarks.json
    metadata.json
/src
  config/
    video.ts          # BOOK_TIMESTAMPS + EPSILON
  data/
    types.ts          # Question, Remark, Selection types
    chapters.ts       # chapter lists + keyword map + heuristic filter
    questions.ts      # loader + filter pipeline + helpers
  store/
    selection.tsx     # single context+reducer, provider + hooks
  hooks/
    useBookVideo.ts   # video state machine
  components/
    BookStage.tsx     # video element + overlays + page UIs
    BookPage.tsx      # generic page shell + selector grid
    TopNav.tsx        # brand + home icon + sidebar
    Sidebar.tsx       # hover sidebar
    QuestionPractice.tsx
    QuestionNavigator.tsx
    QuestionCard.tsx
    Chatbot.tsx       # FAB + drawer + context display
    ui/               # Button, Card, Badge primitives
  styles/
    globals.css       # Tailwind + custom tokens + book palette
  App.tsx
  main.tsx
```

**Tech stack (existing + chosen):**
- Vite + React 18 + TypeScript (keeps existing pattern, no unneeded deps).
- Tailwind CSS for styling (utility + tokens).
- No Zustand/Redux — React context+reducer is sufficient for single store and avoids extra dep (ponytail).
- No video library — native `<video>` with threshold logic.
- No router — single-page state machine (V1 desktop).

**Build:** `npm run dev` (vite), `npm run build` (vite build), `npm run preview`.

---

## 11. State Model (summary)

Single `SelectionState` (see §4) drives everything. Video phase is separate (`VideoPhase`) — kept orthogonal so video/UI cannot desync via derived state. Only `currentQuestionId` bridges them.

Flow:
```
idle → (first click/scroll) → opening → paused-at-page(1)
→ [P1 submit] → turning(1→2) → paused-at-page(2)
→ ... → paused-at-page(5) → [Begin Practice] → zooming(5→END) → practice
↔ sidebar jumps seekToPage() at any time (preserves selections)
```

---

## 12. Remaining Limitations (V1 explicit)

- Chapters filtering is heuristic (keyword match on question_text); no per-question manual chapter tags exist in source data. Future: curator could add `chapter` field to questions.json.
- RTP/MTP source options have no matching records (dataset is Suggested Answers only) — empty-state handled, future pipeline can ingest RTP/MTP PDFs.
- No auth, no persistence (no localStorage yet — optional next).
- No mobile layout (desktop-first, responsive within desktop only).
- No real AI chatbot backend — shell + context only.
- No search bar within practice (filter via selectors; search can be added as 6th filter).

---

## 13. How Next Agent Should Work

1. Read this spec first. Do not rewrite state or video engine unless bug-proven.
2. Data files are at `public/data/` (copy of `Data from ICAI- contains the questions, answers, and everything/processed/`). Do not modify scraper/parser unless integration bug proves it.
3. Keep selection store single — never create a second competing state.
4. Timestamps live only in `src/config/video.ts`. Never hardcode elsewhere.
5. Premium academic styling is intentional — do not regress to generic dashboard.
6. To extend: add `chapter` field to questions.json → update `chapters.ts` keyword map → UI auto-reranks. Add RTP/MTP ingestion → update `questions.ts` source filter.
7. Test full journey: first click → P1→…→P5 → Begin Practice → zoom → practice → navigator → Next → chatbot reflow → sidebar jumps.
8. Run `npm run build` and check console for video sync warnings before PR.

