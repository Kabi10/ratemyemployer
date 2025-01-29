# Rate My Employer - Unified Project Guide

## 🚀 Project Structure
```
src/
├── app/                # Next.js app router
├── components/         # React components
├── contexts/          # React contexts
├── lib/               # Utilities
│   └── supabaseClient.ts  # Supabase client configuration
├── types/             # TypeScript types
└── __tests__/         # All test files
    ├── components/    # Component tests
    ├── hooks/         # Hook tests
    ├── lib/           # Utility tests
    ├── integration/   # Integration tests
    └── e2e/           # End-to-end tests
```

## 🔐 Security Architecture
```typescript
// Supabase RLS Policies (from migrations)
// Companies:
- Public read access
- Authenticated users can create companies
- Only creators/admins can update

// Reviews:
- Public read access
- Authenticated users can create
- Only owners can update/delete
```

## 🛠️ Core Systems
```typescript
// src/lib/supabaseClient.ts
export const dbQuery = {
  companies: {
    create: async (data, userId) => { /* ... */ },  // Auto-sets timestamps
    update: async (id, data) => { /* ... */ }       // Auto-updates timestamp
  },
  reviews: {
    create: async (data) => { /* ... */ },
    update: async (id, data, userId) => { /* ... */ } // Owner validation
  }
};
```

## ✅ Testing Strategy
```
Test Coverage Target: 85%
Current Coverage: 7% (needs improvement)

Testing Hierarchy:
1. Unit Tests (Components/Utils)
2. Integration Tests (API Flows)
3. E2E Tests (Critical User Journeys)
4. Performance Tests
5. Security Tests
```

## 📦 Package Management
```markdown
# Strict Version Control
- @types/react: 18.2.0
- @types/react-dom: 18.2.0
- Supabase JS: ^2.39.8
- Next.js: 14.x
```

## 🔄 CI/CD Pipeline
```
1. Pre-commit Hooks:
   - Type checking
   - Linting
   - Test coverage check

2. PR Checks:
   - Build verification
   - Security audit
   - Dependency review

3. Production Deployment:
   - Zero-downtime deployment
   - Health checks
   - Rollback automation
```

## 🗑️ Removed Redundant Content
1. Merged 4 separate test guides into unified testing strategy
2. Consolidated 3 different environment setup instructions
3. Removed duplicate security policies (now in Architecture section)
4. Eliminated overlapping contribution guidelines
5. Removed deprecated verification_status references 