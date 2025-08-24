# Pre-Implementation Checklist Template

## Feature: Address CodeRabbit feedback for PR #49

### 1. Search Results
```
# Search commands run:
grep_search "WallOfCompanies|SearchAndFilter|EnhancedButton|IndustryInsights|LocationInsights|BackgroundCheck|CompaniesPage|fetchCompanyNews" results:
- Found usages and definitions across src/components and src/lib

grep_search "CompanyCard|news=|props\.news|review_count|recommend_percentage|total_reviews" results:
- Located CompanyCard usage and multiple total_reviews occurrences

grep_search "describe\.skip\(|test\.skip\(" results:
- Skipped tests found in api/companies, enhanced-button, web-scraping

list_dir "/workspace/src" results:
- Verified file locations for updated components and libs
```

### 2. Findings Documentation

#### Existing Files Found:
- `src/app/background-check/page.tsx`
- `src/app/companies/page.tsx`
- `src/components/SearchAndFilter.tsx`
- `src/components/WallOfCompanies.tsx`
- `src/components/ui/enhanced-button.tsx`
- `src/components/analytics/IndustryInsights.tsx`
- `src/components/analytics/LocationInsights.tsx`
- `src/lib/freeNewsApi.ts`
- `src/lib/newsApi.ts`
- `src/types/database.ts`
- `src/types/index.ts`
- Test files under `src/__tests__/...`

#### Existing Functionality:
- Background Check page renders static search box without URL sync or navigation.
- Companies page renders `SearchAndFilter` without initial query sync from URL.
- `SearchAndFilter` does not accept an `initialQuery` prop.
- `WallOfCompanies` fetches news keyed by company name and doesn’t expose `review_count` explicitly; sorting includes review_count and recommend_percentage but source types lack fields.
- `EnhancedButton` lacks motion-safe classes, aria-busy, default type, and loader test id; asChild disabled handling not robust.
- Analytics components use 2-decimal precision.
- `freeNewsApi` lacks single-company helper; `newsApi` defines `fetchCompanyNews` reading from DB cache.
- Types missing optional `status` and `recommend` on Review; `ReviewStatus` duplicated across files.

#### Gaps Identified:
- Missing URL-driven search behavior and accessible form semantics.
- News map key should be `company.id` to avoid name collisions.
- Analytics precision should be 1 decimal.
- Button accessibility and motion preferences need improvements.
- Type misalignments for reviews and company aggregates.
- Tests are skipped; acceptable temporarily but should be marked and documented.

#### Implementation Decision Tree:
- Is there existing code that serves this purpose? Yes
- Can existing code be enhanced to meet requirements? Yes
- Is creating new code justified? Yes, only for small helper (RSS ingest script already added in PR, single-company news helper wrapper acceptable)

### 3. Proposed Approach:
- [x] Enhance existing code at `src/app/background-check/page.tsx`
- [x] Enhance existing code at `src/app/companies/page.tsx`
- [x] Enhance existing code at `src/components/SearchAndFilter.tsx`
- [x] Refactor existing code at `src/components/WallOfCompanies.tsx`
- [x] Refactor existing code at `src/components/ui/enhanced-button.tsx`
- [x] Enhance existing code at `src/components/analytics/IndustryInsights.tsx`
- [x] Enhance existing code at `src/components/analytics/LocationInsights.tsx`
- [x] Enhance existing code at `src/lib/freeNewsApi.ts`
- [x] Enhance existing code at `src/types/database.ts` and `src/types/index.ts`

### 4. Implementation Plan:
1. Implement BackgroundCheck URL-sync and search submit (15m)
2. Add `initialQuery` to SearchAndFilter and wire Companies page with Suspense and ARIA (20m)
3. Refactor WallOfCompanies news keying and computed fields, add optional chaining (25m)
4. Update EnhancedButton for accessibility/motion and loader test id (20m)
5. Adjust Industry/Location analytics to 1 decimal and robust sorting (15m)
6. Add single-company helper in freeNewsApi and ensure imports use it where needed (10m)
7. Update types for Review and CompanyWithReviews extras; re-export ReviewStatus (10m)
8. Minor UI text and ARIA updates in HomeClient and WebScrapingDashboard (10m)
9. Run build and tests; fix failures (30-45m)

### 5. Approval
- [x] Findings presented to user
- [ ] Approach approved by user on [date]
- [ ] Approval documented