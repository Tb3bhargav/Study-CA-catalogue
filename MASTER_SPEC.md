Study for CA — MASTER SPECIFICATION
Version: V2
Product: Study for CA
Target: Desktop V1
Primary Objective: Fast, accurate, organized CA question practice
1. PRODUCT DIRECTION
Study for CA is a fast, focused CA question-practice website.
The previous book/video-based interaction has been completely abandoned.
There must be:
- no book animation
- no introductory video
- no page-turn interaction
- no video-controlled selectors
- no artificial multi-step onboarding
- no Question Type selector in the primary selection flow
The website should prioritize:
1. Speed
2. Accuracy
3. Organization
4. Ease of finding questions
5. Readability
6. Visual quality
Beauty is important, but it is secondary to usability.
The user should be able to go from:
"I want to practice depreciation."

to:
"Here are the depreciation questions."

with as few interactions as realistically possible.
2. CORE PRODUCT PRINCIPLE
The most important product principle is:
Minimize the time between the user's intention and the question they want to practice.

The interface should never force the user to understand how the underlying question bank is organized.
The user should not need to think:
"Which attempt contains this chapter?"

Instead, they should be able to think:
"I want questions from this chapter."

The system should handle the underlying attempts, years, and sources.
3. IMPORTANT CHANGE FROM V1
The previous product concept used a physical book video with five pages.
That entire interaction model is deprecated.
The following must NOT exist in the new V2 implementation:
- book video
- video assets for navigation
- video playback logic
- page-turn state machine
- timestamp-based UI
- video pause states
- book-page selectors
- animated zoom into the question interface
- Question Type as a required selector
If remnants of the old implementation exist in the repository, remove them where safe.
Do not preserve old video architecture merely for compatibility.
The new application should load directly into the usable study interface.
4. APPLICATION TYPE
V1 should be a static desktop-first website.
The frontend should be:
- fast
- deterministic
- lightweight
- easy to maintain
- easy to deploy
- easy to connect to the question dataset
Avoid unnecessary backend complexity.
Avoid unnecessary API requests.
Avoid heavy animations.
Avoid complex state machines.
Avoid client-side architecture that exists only to create visual effects.
The application should feel almost instantaneous.
5. DESKTOP V1
V1 targets desktop browsers.
Do not spend significant implementation time building mobile-specific layouts.
However:
- use sensible responsive CSS where it comes naturally
- avoid hard-coding dimensions unnecessarily
- keep the architecture extendable to a future mobile V2
Mobile optimization is explicitly out of scope for V1.
6. PRIMARY USER FLOW
The main experience should be:
Open Study for CA
        ↓
Search or select filters
        ↓
View matching questions
        ↓
Choose question(s)
        ↓
Practice
There should be no forced onboarding.
There should be no artificial introductory animation.
The user should immediately see useful controls.
7. GLOBAL LAYOUT
The recommended high-level structure is:
┌─────────────────────────────────────────────────────────────┐
│ Study for CA                                  Navigation    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              SEARCH / FILTER AREA                           │
│                                                             │
│                                                             │
│              QUESTION RESULTS                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
The exact visual implementation can evolve, but the information hierarchy must remain clear.
8. HEADER
The header should contain:
Website name
Study for CA
It should be visually distinctive but not oversized.
Use a high-quality font.
The website name should communicate an academic/product identity rather than looking like a generic SaaS logo.
Navigation
Keep navigation minimal.
Recommended initial navigation:
- Home
- Practice
- optionally Bookmarks/Progress if those features already exist
Do not clutter the header.
9. PRIMARY SEARCH
The search bar is one of the most important components of the entire website.
It should be prominent and immediately accessible.
Placeholder:
Search questions, chapters, topics...

The search should support searching across the question bank.
Search should not be limited to a single attempt or source.
For example:
Search:
Depreciation
should be capable of returning questions from:
- May 2026 RTP
- Nov 2025 MTP
- May 2025 Suggested Answers
- older attempts
- other relevant sources
The user should not need to select an attempt first.
10. SEARCH BEHAVIOR
Search should preferably support matching against:
- question text
- chapter
- topic
- subject
- relevant tags
- source metadata where useful
Search results should be ranked sensibly.
Exact or highly relevant topic matches should appear before weak textual matches.
Example:
Search: depreciation
should prioritize:
Depreciation
Depreciation of Assets
Accounting for Depreciation
before unrelated questions that merely contain the word somewhere deep in their text.
Search should tolerate reasonable capitalization differences.
If practical, search should tolerate minor spelling differences.
Do not implement an unnecessarily complex search engine if the dataset is small enough for efficient static client-side search.
Choose the simplest solution that provides fast results.
11. UNIFIED FILTER AREA
All primary selectors must exist in one place.
Do NOT make the user progress through separate pages.
Do NOT hide selectors behind a multi-step animation.
Recommended filters:
Subject
Examples:
- Accounts
- Law
- Taxation
- Costing
- Other available subjects
Attempt
Examples:
- May 2026
- Jan 2026
- Nov 2025
- etc.
The exact values must come from the actual dataset.
Chapter
Should contain chapters relevant to the available subject/data.
Source
Examples:
- RTP
- MTP
- Suggested Answers
Only include sources actually present in the dataset.
12. NO QUESTION TYPE SELECTOR
There must be no Question Type selector in the primary search/filter interface.
Question type may exist internally as metadata if the dataset contains it.
It may be used for future filtering or categorization.
But V2 must not force the user to choose a question type before practicing.
The user should be able to search/select a topic and immediately practice.
13. FILTER RELATIONSHIPS
Filters should work together.
Example:
Subject:
Accounts

Attempt:
All Attempts

Chapter:
Depreciation

Source:
All Sources
should return:
all available Depreciation questions in Accounts across all attempts and sources.

Another example:
Subject:
Accounts

Attempt:
May 2026

Chapter:
Depreciation

Source:
RTP
should return only questions matching all those criteria.
14. FILTER DEFAULTS
Defaults should minimize friction.
Recommended defaults:
Subject:
All / unset unless a subject is explicitly required

Attempt:
All Attempts

Chapter:
All Chapters

Source:
All Sources
Do not force unnecessary selections.
If the user searches for a specific chapter/topic, the system should not require them to manually specify every other dimension.
15. FILTER DEPENDENCIES
Filters should be intelligent.
For example:
If the user chooses:
Subject = Accounts
the Chapter selector should show relevant Accounts chapters.
If the user changes Subject:
- preserve selections that remain valid
- remove only invalid dependent values
- never leave impossible combinations silently selected
Do NOT blindly reset every selector whenever an earlier selector changes.
16. RESULTS AREA
The question results should update quickly after searching/filtering.
Show a clear result count.
Example:
42 questions found
Each result should expose enough information for the user to understand what they are about to practice.
Recommended metadata:
Question title/preview

Chapter / Topic

Attempt / Year

Source
Example:
Depreciation of machinery

Accounts · Depreciation
May 2026 · RTP

Practice →
Another:
Calculation of depreciation under...
Accounts · Depreciation
Nov 2025 · MTP

Practice →
17. RESULT ORDER
Results should be predictable.
When searching, prioritize:
1. exact topic/chapter match
2. exact title/question match
3. highly relevant text match
4. metadata match
5. weaker textual matches
Do not make results appear randomly.
If the dataset has an explicit chronological ordering, expose a sensible ordering control only if useful.
Do not add unnecessary sort controls in V1.
18. QUESTION SELECTION
The user should be able to:
- practice one question immediately
- optionally select multiple questions for a practice set if this can be implemented cleanly
If multi-selection complicates the initial V1, prioritize one-click practice first.
The primary action should always be obvious:
Practice

Do not force users through unnecessary confirmation screens.
19. QUESTION PRACTICE INTERFACE
The practice interface should be optimized for reading and answering.
Recommended structure:
┌────────────────────────────────────────────────────────────┐
│ ← Back                 Accounts / Depreciation       7/42 │
├───────────────┬────────────────────────────────────────────┤
│               │                                            │
│ QUESTIONS     │               QUESTION                     │
│               │                                            │
│ 1             │               Question content             │
│ 2             │                                            │
│ 3             │                                            │
│ 4 ●           │                                            │
│ 5             │                                            │
│ ...           │                                            │
│               │                                            │
│               │              Show Answer                   │
│               │                                            │
│               │     Previous             Next →            │
└───────────────┴────────────────────────────────────────────┘
The exact layout can be improved visually.
The information hierarchy must remain.
20. ONE QUESTION AT A TIME
Only one question should be the primary focus at a time.
Do not display an enormous continuous list of questions by default.
The user should be able to move through the practice set with:
- Next
- Previous
- direct question navigation
21. QUESTION NAVIGATOR
The question interface should include a left-side question navigator.
It should allow direct navigation.
Example:
1
2
3
4  ← current
5
6
7
...
The current question must be visually obvious.
The navigator should remain usable even when the question itself is long.
22. NEXT BUTTON
A clear Next button must exist.
Recommended position:
Bottom-right of the question area.
The user should be able to rapidly progress through questions without searching for controls.
If there is a chatbot button in the future, Next should sit immediately to its left.
23. ANSWER REVEAL
The answer should not automatically overwhelm the question.
Use a clear control such as:
Show Answer

After revealing the answer, the user should be able to continue.
If the actual dataset contains solutions/explanations, structure them clearly.
24. QUESTION METADATA
Display useful metadata without clutter.
Possible:
Accounts
Depreciation
May 2026
RTP
Question 7
The metadata should help the user understand the question's origin.
It should not dominate the question.
25. DATA MODEL
The question should be the fundamental unit of the application.
Do NOT make the primary application model:
Attempt
  → Source
    → Chapter
      → Questions
Instead, use a flat/searchable question model.
Recommended conceptual structure:
Question
├── id
├── subject
├── chapter
├── topic
├── attempt
├── year
├── source
├── question_number
├── question_text
├── answer
├── tags
└── metadata
The exact schema should adapt to the actual dataset.
Do not invent fields that the data does not support.
26. CROSS-ATTEMPT TOPIC PRACTICE
This is a core requirement.
Suppose the user wants:
Depreciation

The system must be capable of presenting:
May 2026 · RTP
Nov 2025 · MTP
May 2025 · Suggested Answers
Nov 2024 · RTP
...
as one practice collection.
The original source of a question must remain visible as metadata.
But source/attempt should not fragment the user's topic practice.
27. DATA NORMALIZATION
Before building advanced search, inspect the actual dataset.
Normalize where appropriate:
- subject names
- chapter names
- topic names
- attempt names
- year formats
- source names
For example, these should not accidentally become separate categories:
RTP
rtp
R.T.P.
if they represent the same source.
Do not destroy original source metadata.
Preserve original values where needed.
28. STATIC DATA STRATEGY
If the complete question bank is reasonably sized, prefer loading it efficiently as static data.
Possible approaches:
- JSON
- optimized static data files
- generated search index
- lightweight client-side search
Choose based on the actual dataset size.
Do not introduce a database/server merely because it is technically possible.
The V1 target is:
fast local/static question retrieval.

29. SPEED REQUIREMENT
Performance is a first-class requirement.
The user should feel:
click
→ result
not:
click
→ spinner
→ page transition
→ animation
→ request
→ another spinner
→ result
Avoid unnecessary loading states.
Avoid unnecessary animations.
Avoid unnecessary network requests.
30. VISUAL DESIGN
Beauty is secondary to usability.
However, the site must still look intentionally designed.
Target:
- excellent typography
- strong spacing
- restrained color palette
- excellent readability
- clear hierarchy
- professional academic appearance
Do not sacrifice speed for decoration.
31. COLOR DIRECTION
Recommended direction:
Primary text
Deep charcoal / near-black.
Main background
Warm off-white / very light parchment.
Secondary surfaces
Soft neutral gray/beige.
Primary accent
Choose ONE sophisticated accent such as:
- deep academic green
- deep navy
- muted brown
Secondary accent
A restrained muted gold may be used sparingly.
Do not use many competing accent colors.
Do not make the website visually noisy.
32. TYPOGRAPHY
Typography should be one of the strongest visual features.
Use:
- one high-quality heading/display font
- one highly readable UI/body font
Possible combinations:
DM Serif Display + Inter
Source Serif 4 + Inter
Playfair Display + Geist
Choose based on actual visual compatibility.
Do not use excessive font families.
Question content must prioritize readability over stylistic typography.
33. COMPONENT DESIGN
Prefer reusable components.
Potential components:
Header
SearchBar
FilterBar
Select
SubjectSelector
AttemptSelector
ChapterSelector
SourceSelector
ResultsSummary
QuestionCard
QuestionList
QuestionNavigator
QuestionViewer
AnswerPanel
PrimaryButton
SecondaryButton
EmptyState
LoadingState
Do not create five separate implementations of essentially the same selector.
34. SELECTOR DESIGN
Selectors should be:
- compact
- readable
- fast
- keyboard-friendly
- easy to scan
They should not consume enormous vertical space.
The four primary selectors should visually belong together.
Recommended:
Subject   [ Accounts ▼ ]
Attempt   [ All ▼ ]
Chapter   [ All ▼ ]
Source    [ All ▼ ]
A horizontal layout is preferred on desktop if it remains readable.
35. SEARCH + FILTER INTERACTION
Search and filters must work together.
Example:
Search = depreciation
Subject = Accounts
Attempt = All
Chapter = Depreciation
Source = All
Results should satisfy all active constraints.
Clearing a filter should immediately broaden the result set.
36. EMPTY STATES
If there are no results, do not show a broken-looking empty screen.
Show:
No questions found.

Try:
- removing a filter
- searching a broader topic
- selecting another source
Keep it concise.
37. ERROR HANDLING
Errors should be clear and actionable.
Avoid technical messages such as:
TypeError: Cannot read properties...
in the user interface.
Technical details belong in development logs.
38. LOADING STATES
Static/local data should ideally require minimal loading UI.
If loading is required:
- use a subtle skeleton
- avoid large spinners
- avoid unnecessary animation
39. NAVIGATION
Navigation should be simple.
Recommended:
Home
Practice
Additional navigation can be added later if justified.
Do not create navigation for features that do not exist.
40. CHATBOT
The chatbot from the previous specification is NOT a V1 priority.
Do not allow chatbot development to delay the core question-search experience.
If a chatbot shell already exists, it may remain architecturally isolated.
But the product's primary interface must work perfectly without it.
Future chatbot context may include:
subject
chapter
topic
attempt
source
currentQuestion
41. BOOK VIDEO
The old book video is NOT part of the V2 product.
Do not load it.
Do not build around it.
Do not preserve its state machine.
Do not use it as a background.
If the old assets are no longer needed, remove them from the active application.
42. ANIMATION
Use animation sparingly.
Good uses:
- dropdown opening
- hover feedback
- subtle result transitions
- sidebar if one exists
- button feedback
Bad uses:
- mandatory introductory animation
- page transitions that delay users
- decorative loading sequences
- animations that prevent immediate interaction
The user should always feel in control.
43. ACCESSIBILITY
The interface should support:
- keyboard navigation
- visible focus
- semantic buttons
- accessible selectors
- readable contrast
- sensible screen-reader labels
- logical tab order
Do not sacrifice accessibility for visual effects.
44. BROWSER TARGET
V1 primarily targets modern desktop browsers.
Optimize for:
- Chrome
- Edge
- Firefox
- Safari where practical
Do not spend major effort supporting obsolete browsers.
45. SECURITY
Do not expose secrets in frontend code.
Do not hard-code API keys.
If no backend/API is needed, do not introduce one.
46. CODE QUALITY
Prioritize:
- simple architecture
- readable code
- reusable components
- centralized data logic
- centralized filter logic
- minimal dependencies
- clear naming
Avoid abstraction for abstraction's sake.
The simplest architecture that satisfies the product should win.
47. PERFORMANCE BUDGET MINDSET
Before adding any library, ask:
Does this materially improve the product?

Avoid libraries that add significant bundle size for trivial functionality.
Prefer native browser capabilities when practical.
48. SEARCH PERFORMANCE
If the question dataset is large:
- build a lightweight search index
- avoid scanning huge datasets repeatedly on every keystroke
- debounce search input where necessary
- memoize derived results where appropriate
If the dataset is small:
- keep the implementation simpler
Do not prematurely optimize.
49. SEARCH INPUT BEHAVIOR
Search should feel immediate.
If live search is used:
- debounce appropriately
- avoid excessive computation
- show results quickly
A submit/search button may exist as an additional accessibility/usability mechanism.
Do not require the user to press Enter for every minor filter change.
50. FUTURE FEATURES
Possible future features:
- bookmarks
- progress tracking
- weak-topic identification
- timed practice
- random practice
- custom practice sets
- AI tutor
- notes
- answer evaluation
- mobile version
- user accounts
- cloud synchronization
These are NOT V1 requirements.
Do not build them unless they already exist and do not interfere with V1.
51. WHAT NOT TO BUILD
Do NOT build:
- book animation
- video-based navigation
- Question Type selector
- unnecessary onboarding
- excessive animations
- complicated dashboard
- unnecessary cards
- mobile-specific V1 UI
- unnecessary authentication
- unnecessary backend
- unnecessary AI features
- unnecessary gamification
52. PRIMARY SUCCESS CRITERIA
The new website succeeds if a user can:
Scenario 1
Open the website.
Immediately search:
Depreciation

See questions from multiple attempts and sources.
Start practicing.
Scenario 2
Choose:
Accounts
→ Depreciation
→ All Attempts
→ All Sources
and immediately get a unified question collection.
Scenario 3
Choose:
Accounts
→ May 2026
→ Depreciation
→ RTP
and get only matching questions.
Scenario 4
Change:
Attempt = May 2026
to:
Attempt = All Attempts
and immediately broaden the results.