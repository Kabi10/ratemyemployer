# Pre-Implementation Checklist Template

## Feature: Project Stabilization (Build + Tests + PR Triage)

### 1. Search Results
```
# Search commands run:
list_dir "/workspace" (root) -> discovered Next.js app, scripts, supabase, tests
list_dir "/workspace/src" -> found app/, components/, lib/, __tests__/
read_file "/workspace/package.json" -> scripts and deps
read_file "/workspace/.git/config" -> remote origin set to `Kabi10/ratemyemployer`
read_file "/workspace/RME_DAMAGE_ASSESSMENT.md" -> known critical areas
grep "asChild|Slot" in components -> risky Radix Slot usage in buttons/navbar
Build run: `npm run build` -> React.Children.only errors across routes
After fix, build succeeded; warnings remain in realtime-js
```

### 2. Findings Documentation

#### Existing Files Found:
- `src/app/layout.tsx`, `src/app/providers.tsx`, `src/components/RootLayoutClient.tsx`
- `src/components/ui/enhanced-button.tsx`, `src/components/ui/enhanced-navbar.tsx`
- `src/lib/freeNewsApi.ts`, `src/lib/webScraping/scrapers/newsScraper.ts`
- `src/lib/webScraping/scrapingEngine.ts`, `src/components/WebScrapingDashboard.tsx`
- `src/app/api/companies/route.ts`, `src/lib/supabaseServer.ts`

#### Existing Functionality:
- Next.js 14 app with Supabase SSR, auth context, design system, scraping engine
- UI uses Radix Slot via `asChild` in buttons and navbar
- News scraping migrated to free RSS helpers (`freeNewsApi.ts`)
- API routes query Supabase via SSR client created with next/headers cookies

#### Gaps Identified:
- Build failure due to `React.Children.only` from `asChild` composition
- Import mismatch in news scraper (`fetchCompanyNews` not exported)
- Tests failing:
  - API route tests: need absolute Request URLs and mocking of cookies scope
  - Scraping engine tests expect public methods (processJob, setMaxConcurrentJobs, storeScrapedData, calculateRetryDelay)
  - EnhancedButton tests expect aria-disabled, keyboard activation, icon size, loading testid

#### Implementation Decision Tree:
- Is there existing code that serves this purpose? Yes
- Can existing code be enhanced to meet requirements? Yes
- Is creating new code justified? No; adjust existing components/APIs

### 3. Proposed Approach:
- [x] Enhance existing code at `src/components/ui/enhanced-button.tsx` (asChild fix, a11y)
- [x] Refactor existing code at `src/lib/webScraping/scrapers/newsScraper.ts` (import fix)
- [ ] Enhance `src/app/api/companies/route.ts` for test context compatibility
- [ ] Expose test-facing methods on `src/lib/webScraping/scrapingEngine.ts`

### 4. Implementation Plan:
1. Fix build-breaking Slot usage in buttons (0.5h) — DONE
2. Fix news scraper import to free RSS helper (0.25h) — DONE
3. Add a11y and keyboard support to EnhancedButton to satisfy tests (0.25h) — DONE
4. Make API route testable: allow URL base fallback and mockable cookies (0.5h)
5. Add public wrappers in scrapingEngine for tests: processJob, setMaxConcurrentJobs, storeScrapedData, calculateRetryDelay (1h)
6. Rerun tests, iterate on failing expectations (1-2h)

### 5. Approval
- [ ] Findings presented to user
- [ ] Approach approved by user on [date]
- [ ] Approval documented