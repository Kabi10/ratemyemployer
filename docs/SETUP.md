# 🚀 Developer Setup Guide

## Environment Requirements
- Node.js v20+ (recommended)
- npm v10+ (recommended)
- TypeScript v5.3+
- Next.js v15.1+

## Quick Start

### 1. Clone & Install
```bash
git clone [repository-url]
cd ratemyemployer
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Database Setup
1. Create Supabase account
2. Set up new project
3. Generate types:
```bash
npx supabase gen types typescript --project-id "your-project-id" > src/types/supabase.ts
```

### 4. Development Scripts
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint checks
```

## 🧪 Testing Setup

### Running Tests
```bash
# E2E Tests with Playwright
npx playwright test

# Run specific test file
npx playwright test company.spec.ts

# Show report
npx playwright show-report
```

### Test Structure
```
tests/
├── e2e/              # End-to-end tests
│   ├── auth/         # Authentication tests
│   ├── company/      # Company feature tests
│   └── review/       # Review feature tests
├── fixtures/         # Test data
└── utils/           # Test utilities
```

## 📦 Key Dependencies

### Production Dependencies
- Next.js v15.1
- React v18.2
- Supabase Auth Helpers
- React Hook Form
- Zod (Form Validation)
- Tailwind CSS
- Radix UI Components
- Framer Motion

### Development Tools
- TypeScript v5.3
- ESLint v8.56
- Playwright v1.50
- PostCSS
- Tailwind CSS

## 🔄 Deployment Process

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Link Project**
```bash
vercel link
```

3. **Environment Setup**
```bash
vercel env pull .env.local
```

4. **Deploy**
```bash
vercel deploy --prod
```

## 🔍 System Checks

### Pre-commit Checklist
- [ ] ESLint checks (`npm run lint`)
- [ ] TypeScript compilation (`npm run build`)
- [ ] E2E tests passing
- [ ] No console errors
- [ ] Responsive design verified

### Regular Maintenance
- Daily: Run lint and type checks
- Weekly: Update dependencies
- Monthly: Full system audit

## 🆘 Need Help?
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)
3. Run system diagnostics
4. Contact team leads 