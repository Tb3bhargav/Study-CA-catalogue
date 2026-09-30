# Study for CA — The private study catalogue

**Host-ready build** — 885 questions (MTP 119 + RTP 205 + SA 561) across Group II, search-first.

## What's inside FOR_GITHUB
- pp/ — Vite + React source (run \
pm install && npm run build\ to rebuild)
- pp/dist/ — **already built**, ready to host (upload this folder to Vercel/Netlify/GitHub Pages)
- Questions JSON files/ — 885 individual JSONs (source of truth, 0 empty, tables preserved)
- \Question-Answer main data/\ — original PDFs (read-only source)
- \scripts/schema.py\ + \ggregate_all.py\ — rebuild \questions.json\ from JSON files
- \pp/public/data/questions.json\ — aggregated 5.4MB, wired to \etch('/data/questions.json')\
- Images in \pp/public/\: \avicon.svg/png\, \pple-touch-icon.png\, \og-image.png\, \logo.png\ — already in \dist/\

## Host in 3 ways
### 1) Vercel / Netlify (recommended)
1. Push \FOR_GITHUB/app\ as repo root to GitHub
2. Import repo in Vercel ? Framework: Vite ? Build: \
pm run build\ ? Output: \dist\
3. Env: \VITE_NVIDIA_API_KEY\, \VITE_NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1\, \VITE_NVIDIA_MODEL=deepseek-ai/deepseek-v4-flash-0731\

### 2) GitHub Pages
- Option A: Push \FOR_GITHUB/dist\ (the copied root \index.html\ + \ssets/\) to \gh-pages\ branch
- Option B: Push \FOR_GITHUB\ and enable Pages with GitHub Actions (Vite)

### 3) Local preview
\\\ash
cd app
npm install
npm run dev   # http://localhost:5173
npm run build # rebuilds dist
\\\

## Search & Chatbot
- Search bar in \App.tsx\ ? \SearchBar.tsx\ (885 indexed, AND tokens)
- Chatbot ? NVIDIA Integrate \deepseek-ai/deepseek-v4-flash-0731\ via \VITE_NVIDIA_*\ (proxy \/nvidia-proxy\ in dev to avoid CORS)

## Clean
\pp/node_modules\ is ignored (.gitignore). Do not push it. \dist\ is built output — push only if hosting via Pages without build step.
