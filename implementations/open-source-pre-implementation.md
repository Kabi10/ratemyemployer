# Pre-Implementation Checklist Template

## Feature: Open Source Readiness (Continue from PR #50)

### 1. Search Results
```
# Search commands run:
list_dir "/workspace/.github" results:
- ISSUE_TEMPLATE/, pull_request_template.md, dependabot.yml, labels.yml, workflows/

list_dir "/workspace/.github/workflows" results:
- auto-merge.yml, build-verify.yml, ci.yml, coverage.yml, deploy.yml, fetch-news.yml, lighthouse.yml, performance.yml, populate-database.yml, pre-implementation-check.yml, production-deploy.yml, release.yml, sync-labels.yml, wiki.yml

grep_search "yourusername" results:
- CONTRIBUTING.md: issue tracker links use https://github.com/yourusername/ratemyemployer

read_file "package.json" results:
- Currently "private": true, no license/author/homepage/repository/bugs fields

read_file ".gitignore" results:
- .env and .env*.local ignored; .env.example allowed

grep_search env usage results:
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, SERP_API_KEY referenced
```

### 2. Findings Documentation

#### Existing Files Found:
- .github configuration present: workflows, issue templates, labels, dependabot
- LICENSE: MIT
- README.md: comprehensive
- CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md present
- No OPEN_SOURCE_SETUP.md file
- No .env.example file
- package.json lacks OSS metadata and is marked private

#### Existing Functionality:
- CI workflows exist (build/test/deploy, coverage, release). `ci.yml` uses Node 18, runs lint/type-check/test/build, and deploys via Vercel. Additional workflows for quality, performance, and pre-implementation checks are present.
- Dependabot configured; labels and PR templates exist.

#### Gaps Identified:
- package.json should be open-source ready (private=false, license, author, repo URLs)
- Placeholder links in CONTRIBUTING.md use `yourusername`
- Missing `.env.example` consolidating required env vars
- Missing `OPEN_SOURCE_SETUP.md` as in PR #50 description
- Optional: dedicated security workflow aggregating CodeQL/npm audit/Snyk

#### Implementation Decision Tree:
- Is there existing code that serves this purpose? Yes, partial (workflows, docs exist).
- Can existing code be enhanced to meet requirements? Yes (update metadata, add missing docs/files).
- Is creating new code justified? Yes, for `.env.example`, `OPEN_SOURCE_SETUP.md`, and `security.yml` if not redundant.

### 3. Proposed Approach:
- [x] Enhance existing code at `/workspace/.github/workflows/ci.yml` only if necessary to match PR #50 intent (matrix, e2e step). Otherwise keep.
- [x] Create new files (requires detailed justification)
  - `.env.example`: enables contributors to run locally
  - `OPEN_SOURCE_SETUP.md`: onboarding and governance
  - `security.yml`: daily/code scanning centralization (complements existing workflows)
- [x] Refactor existing code at `/workspace/package.json`: add OSS metadata, add `type-check` script

### 4. Implementation Plan:
1. Update `package.json` metadata and add `type-check` script (low effort)
2. Replace `yourusername` placeholders in `CONTRIBUTING.md` (low effort)
3. Add `.env.example` covering Supabase, Google Maps, SERP, script keys (medium effort)
4. Add `OPEN_SOURCE_SETUP.md` (medium effort)
5. Add `.github/workflows/security.yml` (medium effort)
6. Verify CI locally: install, lint, type-check, build, test (low effort)

### 5. Approval
- [ ] Findings presented to user
- [ ] Approach approved by user on [date]
- [ ] Approval documented