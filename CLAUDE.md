# Preplio — AI-Powered Certification Coaching Platform

## What Is Preplio
AI-powered certification coaching web app. Transforms uploaded study materials into exam-realistic practice questions, provides an AI tutor with source citations, and generates adaptive study plans. Launching with PRMIA ORM Designation, architected for multi-cert expansion (CISA, CRISC, CISM, FRM).

**Domain:** preplio.app | **Repo:** github.com/arunprakashpj/preplio

---

## Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript, strict mode)
- **Styling:** Tailwind CSS + shadcn/ui (New York style)
- **Database:** Supabase (PostgreSQL + pgvector + Auth + Storage)
- **AI:** Anthropic Claude API (claude-sonnet-4-5-20250514)
- **Embeddings:** TBD (Voyage AI or OpenAI — provider abstraction in place)
- **Hosting:** Vercel (free tier) + async background jobs for heavy processing
- **Vector Index:** HNSW (not IVFFlat — works from zero rows)

## Theme
- **Style:** Clean & Minimal (Notion/Linear inspired)
- **Primary:** Teal (#0D9488 / teal-600)
- **Primary Light:** #CCFBF1 (teal-100)
- **Primary Dark:** #115E59 (teal-800)
- **Background:** #FAFAF9 (stone-50)
- **Card:** #FFFFFF
- **Text:** #1C1917 (stone-900)
- **Subtext:** #78716C (stone-500)
- **Border:** #E7E5E4 (stone-200)
- **Success:** #059669 (emerald-600)
- **Danger:** #DC2626 (red-600)
- **Warning:** #D97706 (amber-600)
- **Font:** Inter (Google Fonts)

---

## Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Data model | Multi-cert from day 1 | Avoid painful migration when expanding beyond ORM |
| Vector index | HNSW | Works from zero rows, better for small datasets |
| PDF processing | pdf-parse + cloud OCR | Study materials include scanned textbook pages |
| Embeddings | Provider abstraction | Swap Voyage/OpenAI without code changes |
| Hosting tier | Vercel free + background jobs | Keep costs down; split heavy ops into chained API calls |
| Spaced repetition | Built into quiz system | Resurface missed questions at 1, 3, 7 day intervals |
| Components | Fresh build with shadcn/ui | Mockups are reference only; need token-based theming for multi-cert |

---

## Build Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | COMPLETE | Pre-build setup (CLAUDE.md, git, GitHub, memories) |
| Phase 1 | COMPLETE | Project scaffolding, theme, layout, placeholder pages |
| Phase 2 | COMPLETE | Supabase database schema, auth, profile onboarding |
| Phase 3 | NOT STARTED | Admin upload, document processing, OCR, embeddings |
| Phase 4 | NOT STARTED | AI question generation, quiz interface, spaced repetition |
| Phase 5 | NOT STARTED | RAG-powered AI chat tutor with citations |
| Phase 6 | NOT STARTED | Adaptive study plan with calendar view |
| Phase 7 | NOT STARTED | Dashboard, landing page, polish, deploy to preplio.app |

---

## Coding Standards (ENFORCED)

### TypeScript
- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types — use proper typing or `unknown` with type guards
- Define shared types in `src/types/`

### React / Next.js
- Server Components by default
- `'use client'` only when component needs browser APIs, state, or effects
- Use Next.js App Router conventions (loading.tsx, error.tsx, layout.tsx)
- Prefer Server Actions for mutations where appropriate

### API Routes
- Validate all inputs at boundaries with zod
- Return consistent error response format: `{ error: string, details?: unknown }`
- Never expose internal error details to the client
- All heavy operations (PDF processing, AI generation, embeddings) must be async/background

### Database
- RLS enabled on every table — no exceptions
- All queries go through Supabase client (never raw SQL from the app)
- Use service role key ONLY in server-side API routes, never in client code

### Security
- No secrets in client-side code (only `NEXT_PUBLIC_` prefixed vars are client-safe)
- Sanitize user inputs before rendering
- CSRF protection via Supabase Auth tokens
- No `dangerouslySetInnerHTML` without sanitization

### Styling
- Tailwind utility classes — no custom CSS unless absolutely necessary
- Use shadcn/ui design tokens for colors (not hardcoded hex values in components)
- Mobile-first responsive design (test at 375px width)
- Semantic HTML elements (nav, main, section, article)
- ARIA attributes on interactive custom elements

### File & Naming Conventions
- Components: PascalCase (`QuizCard.tsx`)
- Utilities/hooks: camelCase (`useQuizSession.ts`)
- API routes: kebab-case folders (`generate-questions/route.ts`)
- One component per file (co-located small helpers are fine)

### Git & Deployment
- Every feature/phase ends with: build check -> test -> commit -> push
- Vercel auto-deploys from `main` branch
- Commit messages: descriptive, prefixed with phase context
- Never commit .env files or secrets

---

## Pre-Push Checklist (Run Before Every Push)
1. `npm run build` — must pass with zero errors
2. `npm run lint` — must pass
3. Run any existing tests
4. Verify key flows work on dev server
5. Generate pre-push report: what changed, build status, test results, known issues

---

## Key Files Reference
```
app/                        # Next.js App Router pages
├── (auth)/                 # Login, register (public)
├── (dashboard)/            # Protected pages (quiz, chat, study-plan, admin)
├── api/                    # API routes
├── layout.tsx              # Root layout
└── page.tsx                # Landing page
components/
├── ui/                     # shadcn/ui components
├── layout/                 # Sidebar, top-nav, mobile-nav
└── shared/                 # Reusable components
lib/
├── supabase/               # Client + server Supabase clients
├── prompts/                # AI prompt templates
└── utils.ts                # General utilities
types/
└── index.ts                # Shared TypeScript types
```
