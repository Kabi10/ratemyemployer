# Lighthouse CI Configuration - Pre-Implementation

## What
Adding `.lighthouserc.js` to configure Lighthouse CI for the existing `lighthouse` GitHub Actions workflow.

## Why
The existing workflow runs `lhci autorun` without a config file, causing it to fail immediately with "Unable to automatically determine the location of static site files." Next.js apps are not static — they need a running server.

## Existing State
- `.github/workflows/lighthouse.yml` exists but has always failed
- No `.lighthouserc.js` config existed

## Implementation
- `.lighthouserc.js`: configures `lhci` to start `npm start`, wait for the server, then run against `http://localhost:3000`
- Assertions set to `warn` (not `error`) to avoid blocking CI on performance regressions during development
