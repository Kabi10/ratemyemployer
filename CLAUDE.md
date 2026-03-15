# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RateMyEmployer is a Next.js 14 platform for exposing unethical hiring practices (ghosting, fake job postings, wage baiting). It uses Supabase as the backend with Row Level Security, and is deployed on Vercel.

## Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # ESLint

# Testing
npm test                       # Run all Vitest tests (single run)
npm run test:watch             # Vitest in watch mode
# Run a single test file:
npx vitest run src/__tests__/path/to/file.test.ts

# Verification scripts (require env vars)
npm run verify:core            # All core features
npm run verify:auth            # Auth flows only
npm run verify:companies       # Company management only
npm run verify:reviews         # Review system only
npm run test:auth-flows        # Auth flow tester
npm run verify:all             # Supabase data + form validation

# Database
npm run migrations:run         # Run pending migrations
npm run populate:auto          # Auto-populate database
npm run supabase:monitor       # Check Supabase usage/costs

# Pre-implementation check
npm run check:pre-implementation  # Verify new files have documentation
```

## Architecture

### Stack
- **Next.js 14** App Router with Server Components + Client Components
- **Supabase** (PostgreSQL + Auth + Real-time) — no Prisma, direct client usage
- **Tailwind CSS** + **Radix UI** + **Framer Motion**
- **Zod** + **React Hook Form** for validation
- **Vitest** (unit/component) + **Playwright** (E2E) + **Testing Library**

### Path Alias
`@/*` maps to `./src/*` — use this for all internal imports.

### Key Directories
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React UI components
- `src/lib/` — Core business logic, Supabase clients, utilities
- `src/hooks/` — Custom React hooks (useAuth, useCompany, useReviews, useLikes)
- `src/contexts/AuthContext.tsx` — Global auth state
- `src/types/` — TypeScript types; `supabase.ts` is auto-generated
- `src/__tests__/` — All test files (api/, components/, integration/, mocks/)
- `scripts/` — Standalone tsx scripts for verification, DB population, scraping
- `migrations/` — Database migration files

### Supabase Client Pattern
- `src/lib/supabaseClient.ts` — Browser client (uses `NEXT_PUBLIC_*` vars), exports `supabase`, `dbQuery`
- `src/lib/supabaseServer.ts` — Server-side client for RSC/API routes
- `src/lib/database.ts` — Higher-level DB helper functions
- All tables have RLS enabled; auth is handled via `@supabase/auth-helpers-nextjs`

### API Routes
Located at `src/app/api/` — standard Next.js route handlers:
- `/api/companies` — company CRUD
- `/api/companies/[id]` — individual company + nested `/reviews`

### Feature Sections ("Wall Sections")
Dynamic company classification sections (Fame, Shame, Background Check, Financial Distress, Rising Startups) are managed via `src/lib/companySectionsApi.ts` and `src/lib/automatedDetection.ts`. These power the `/fame`, `/shame`, `/background-check`, `/financial-distress`, and `/rising-startups` routes.

### Testing Notes
- Vitest runs with `maxConcurrency: 1` and `maxWorkers: 1` — tests are sequential by design
- Tests use jsdom environment with setup at `src/__tests__/setup.ts`
- Mocks are in `src/__tests__/mocks/`

## Pre-Implementation Requirement

**Before adding any new file**, the `.cursorrules` enforces a documentation requirement:
1. Search for existing functionality first
2. Document findings in `implementations/[feature-name]-pre-implementation.md`
3. A git pre-commit hook and GitHub Actions workflow verify compliance

Run `npm run check:pre-implementation` to validate before committing new files.

## Environment Variables

Required in `.env.local` (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `DATABASE_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- News API keys: `GNEWS_API_KEY`, `NEWS_API_KEY`, `SERP_API_KEY`
