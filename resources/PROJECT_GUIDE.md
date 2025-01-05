# Rate My Employer - Project Guide

## Overview
Rate My Employer is a platform for employees to share their experiences and rate their employers. Built with Next.js, TypeScript, and Supabase.

## Table of Contents
1. [Development Principles](#development-principles)
2. [Project Setup](#project-setup)
3. [Architecture](#architecture)
4. [Key Features](#key-features)
5. [Development Workflow](#development-workflow)
6. [Testing Strategy](#testing-strategy)
7. [Deployment](#deployment)

## 🚧 Work In Progress (WIP)

### System Analysis (as of 2024-01-04)

#### 🧪 Testing Infrastructure
- [ ] **Test Coverage Issues**
  - Current: 7% / Target: 70%
  - Component tests mismatched with implementation
  - Supabase client mocking needs improvement
  - Jest configuration needs review

#### 🏗️ Build System
- [ ] **Build Issues**
  - Webpack Cache Strategy Failing:
    - Error: "Unable to snapshot resolve dependencies"
    - Cache optimization needed
  - Deprecation Warnings:
    - Punycode module deprecated
    - Needs userland alternative
  - Environment Setup:
    - .env.local detected
    - Need to verify all required variables
  - Action Items:
    - [ ] Investigate webpack caching issues
    - [ ] Replace deprecated punycode module
    - [ ] Review environment variable setup
    - [ ] Optimize build configuration

#### 📦 Version Control
- [ ] **Git Status**
  - Uncommitted Changes:
    - Configuration files (.husky, jest.config.js)
    - Package management files
    - Test and component files
    - Middleware updates
  - Untracked Files:
    - New automation scripts
    - Documentation resources
    - Deployment configurations
  - Action Items:
    - [ ] Review and commit configuration changes
    - [ ] Set up proper gitignore for node_modules
    - [ ] Integrate new automation scripts
    - [ ] Document deployment process

#### 📦 Dependencies
- [ ] **Package Management**
  - Security Issues:
    - 2 low severity vulnerabilities in `@supabase/ssr`
    - Cookie package vulnerability needs updating
  - Major Version Updates Needed:
    - React 18 → 19
    - @headlessui/react 1.7 → 2.2
    - @types/react 17 → 19
    - @types/react-dom 17 → 19
    - eslint 8 → 9
    - lucide-react 0.321 → 0.469
  - Version Conflicts:
    - Next.js related packages mismatched
    - TypeScript tooling versions need alignment
  - Action Items:
    - [ ] Assess React 19 upgrade impact
    - [ ] Plan TypeScript types update
    - [ ] Review breaking changes in major updates
    - [ ] Create dependency update strategy

#### 🔐 Supabase Integration
- [ ] **Configuration Status**
  - Environment Setup:
    - Supabase URL configured
    - Anonymous key present
    - Service role key available
    - Google Maps API integration
  - Security Concerns:
    - API keys exposed in version control
    - Need to rotate compromised keys
    - Review key permissions
  - Integration Points:
    - Authentication system
    - Database access
    - API endpoints
  - Action Items:
    - [ ] Rotate exposed API keys
    - [ ] Set up key rotation policy
    - [ ] Review security best practices
    - [ ] Document API integration points

#### 🔄 CI/CD Pipeline
- [ ] **GitHub Actions Setup**
  - Existing Workflows:
    - CI pipeline for testing
    - Auto-merge configuration
    - Coverage reporting
    - Deployment automation
    - Lighthouse performance checks
    - Performance monitoring
    - Release management
  - Integration Points:
    - Vercel deployment
    - Test automation
    - Quality checks
    - Performance metrics
  - Areas for Review:
    - Coverage thresholds in CI
    - Auto-merge criteria
    - Performance benchmarks
    - Release process
  - Action Items:
    - [ ] Align coverage thresholds with current state
    - [ ] Review auto-merge safety checks
    - [ ] Validate deployment configurations
    - [ ] Set up monitoring alerts

#### 📝 Deployment Configuration
- [ ] **Vercel Setup**
  - Current Configuration:
    - Using Next.js framework
    - Region: iad1 (US East)
    - Legacy peer deps enabled
    - Environment variables mapped
  - Build Process:
    - Using `npm ci` for clean installs
    - Legacy peer deps flag needed
    - Next.js build configuration
  - Concerns:
    - Legacy peer dependencies usage
    - Environment variable security
    - Build optimization needed
  - Action Items:
    - [ ] Review legacy peer deps necessity
    - [ ] Audit environment variables
    - [ ] Optimize build command
    - [ ] Document deployment process

#### 📝 Documentation Gaps
- [ ] **Technical Documentation**
  - API documentation incomplete
  - Component documentation needed
  - Test patterns undocumented
  - Migration guides missing

### Recently Completed
1. ✅ Added missing test dependencies
2. ✅ Fixed initial test setup
3. ✅ Documented error solutions
4. ✅ Set up basic test infrastructure
5. ✅ Created WIP tracking system

### Immediate Focus
1. 🎯 Complete system analysis
2. 🎯 Document all found issues
3. 🎯 Prioritize fixes based on impact
4. 🎯 Create action plan for each area

### Next Steps
1. 📋 Run full system diagnostics
2. 📋 Create comprehensive test suite
3. 📋 Set up monitoring systems
4. 📋 Implement automated checks

### Known Issues
1. ❌ Test coverage below threshold
2. ❌ Component/test mismatches
3. ❌ Incomplete documentation
4. ❌ Build optimization needed

## Development Principles

### 1. Code Organization & Clarity
- Include file path comments at the top of each file (e.g., `// src/components/CreateReview.tsx`)
- Document complex logic and business rules with clear comments
- Maintain consistent code style using ESLint and Prettier
- Implement comprehensive error handling for all operations

### 2. Development Approach
- Begin by understanding existing codebase and architecture
- Make incremental improvements rather than large rewrites
- Test changes in isolation to prevent regressions
- Consider performance implications of all changes
- Use feature flags for major changes

### 3. Database Safety Protocol
Before making ANY database changes:
- Review and understand current database structure
- Map out dependencies and relationships
- Verify existing security measures
- Implement code-level fixes first
- Never disable or remove security features
- Get explicit approval for destructive operations
- Maintain rollback plans for all changes

### 4. Communication Guidelines
- Keep explanations concise but thorough
- Provide clear, actionable next steps
- Document rationale behind technical decisions
- Flag potential risks or concerns early
- Use conventional commits for clear change history

### 5. Continuous Optimization
- Actively identify optimization opportunities
- Reduce code redundancy through patterns
- Propose creative solutions when appropriate
- Present innovative approaches for team review
- Balance innovation with stability
- Prioritize long-term maintainability
- Suggest refactoring when beneficial

## Project Setup
1. Clone the repository
2. Install dependencies
3. Set up environment variables
4. Initialize database
5. Start development server

## Architecture
- Next.js 13+ with App Router
- TypeScript for type safety
- Supabase for backend and authentication
- Tailwind CSS for styling
- React Query for data fetching
- Zod for schema validation

## Key Features
- Company reviews and ratings
- User authentication
- Role-based access control
- Review moderation
- Company profiles
- Search and filtering
- Analytics dashboard

## Development Workflow
1. Feature planning
2. Development
3. Testing
4. Code review
5. Deployment

## Testing Strategy
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright
- Performance testing
- Security testing

## Deployment
- Vercel for frontend
- Supabase for backend
- CI/CD with GitHub Actions
- Staging and production environments

---

*This guide is automatically maintained and updated with project changes.* 