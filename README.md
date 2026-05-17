# goukaku.dev (web)

Public Web version of ExamQuiz. Built with Next.js (App Router) + Tailwind v4.
Deployed to Vercel at https://goukaku.dev.

## Setup

```bash
cp .env.local.example .env.local   # fill in API_KEY
npm install
npm run dev
```

Reads from `api.goukaku.dev`. See `pipeline/docs/superpowers/specs/2026-05-17-goukaku-web-design.md` for the design.

## MVP status (2026-05-17)

Implementation complete for the home / exam detail / sequential play loop.
TypeScript, ESLint, and unit tests all pass. Live build requires the
`API_KEY` env var for `api.goukaku.dev`; without it the static-page
generation step will fail at fetch time. Deploy to Vercel with the env
vars set in the dashboard.

### What's in (MVP):
- `/` home with exam list (Server Component, ISR 1h)
- `/exam/[examId]` exam detail with mode selection (SSG)
- `/play/[examId]?mode=sequential|random` interactive play loop with localStorage

### What's deferred:
- ExplanationCard, per_choice, tags
- /api/answers, /api/feedback Route Handlers
- WrongOnly, Exam-timer mode
- /play/random (across all exams)
- /tag/[tag], /exam/[examId]/q/[qNumber] SEO pages
- PWA / Service Worker
- Math (KaTeX) rendering
- Lighthouse / SEO polish
