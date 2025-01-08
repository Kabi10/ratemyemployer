# Documentation Hub

## 🚀 New Developer Onboarding

Welcome to RateMyEmployer! Here's your step-by-step guide to get up to speed:

### 1. Project Overview
- **What**: A platform for employees to rate and review employers
- **Tech Stack**: Next.js, TypeScript, Supabase, Tailwind CSS
- **Architecture**: Server-side rendering with client-side features

### 2. Setup Steps (In Order)
1. **Environment Setup**
   ```bash
   git clone [repository-url]
   npm install
   cp .env.example .env.local  # Set up environment variables
   ```

2. **Database Connection**
   - Set up Supabase account
   - Copy project URL and anon key to .env.local
   - Run `npx supabase gen types typescript` to generate types

3. **Local Development**
   ```bash
   npm run dev     # Start development server
   npm run test    # Run tests
   npm run build   # Test production build
   ```

### 3. Essential Documentation (Read in Order)
1. [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) - Project structure & conventions
2. [FORM_VALIDATION.md](./FORM_VALIDATION.md) - Data validation patterns
3. [SYSTEM_CHECKS.md](./SYSTEM_CHECKS.md) - Health checks & monitoring
4. [ERRORS_AND_SOLUTIONS.md](./ERRORS_AND_SOLUTIONS.md) - Common issues & fixes

### 4. Key Features to Understand
1. **Authentication Flow**
   - Supabase Auth integration
   - Protected routes & RLS policies

2. **Review System**
   - Creating/editing reviews
   - Rating calculation
   - Moderation workflow

3. **Company Management**
   - Company profiles
   - Industry categorization
   - Search & filtering

### 5. Development Workflow
1. **Code Organization**
   ```
   src/
   ├── app/          # Next.js 13 app router
   ├── components/   # React components
   ├── lib/          # Utilities & helpers
   ├── hooks/        # Custom React hooks
   └── types/        # TypeScript definitions
   ```

2. **Testing Strategy**
   - Unit tests in `src/__tests__/`
   - Integration tests for key flows
   - Run `npm test` before commits

3. **Deployment Process**
   - Vercel for hosting
   - Automatic deployments from main branch
   - Environment variable management

### 6. Common Tasks
1. **Adding a New Feature**
   - Create feature branch
   - Update types if needed
   - Add tests
   - Update documentation

2. **Database Changes**
   - Update Supabase schema
   - Generate new types
   - Update affected components

3. **Debugging Issues**
   - Check console logs
   - Review [ERRORS_AND_SOLUTIONS.md](./ERRORS_AND_SOLUTIONS.md)
   - Run system checks

### 7. Getting Help
- Review documentation in `/resources`
- Check commit history for context
- Run diagnostic commands
- Reach out to team leads

## Quick Links

### Testing
- [Test Automation Guide](./AUTOMATION_GUIDE.md) - Complete guide to test automation
- [Test Error Solutions](./ERRORS_AND_SOLUTIONS.md#test-related-errors) - Common test errors and fixes
- [Project Guide](./PROJECT_GUIDE.md#testing) - Testing setup and organization

### Test Structure
```
src/__tests__/
├── core.test.ts              # Core business logic tests
├── company-features.test.tsx # Company feature tests
├── review-features.test.tsx  # Review feature tests
├── ui.test.tsx              # UI component tests
├── integration.test.tsx     # Integration tests
├── setup.ts                 # Test setup and configuration
├── mocks/                   # Mock data and utilities
└── utils/                   # Test utilities
```

### Development
- [Project Guide](./PROJECT_GUIDE.md) - Project overview and setup
- [Form Validation](./FORM_VALIDATION.md) - Form validation patterns
- [System Checks](./SYSTEM_CHECKS.md) - System health checks

### Automation
- [CI/CD](./.github/workflows/) - Continuous Integration/Deployment
- [Build Process](./BUILD_PROCESS.md) - Build and deployment
- [Database](./DATABASE.md) - Database management

## Deployment Guide

### Vercel CLI Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   # or use npx for one-time use
   ```

2. **Link Your Project**
   ```bash
   npx vercel link
   # Follow prompts to:
   # - Set up project directory
   # - Select your scope
   # - Link to existing project
   ```

3. **Environment Variables**
   - Set up in Vercel Dashboard first
   - Or pull existing ones:
   ```bash
   npx vercel env pull .env.local
   ```

4. **Configuration File**
   Create `vercel.json` in project root:
   ```json
   {
     "version": 2,
     "buildCommand": "next build",
     "devCommand": "next dev",
     "installCommand": "npm install",
     "framework": "nextjs",
     "outputDirectory": ".next"
   }
   ```

5. **Deploy to Production**
   ```bash
   npx vercel deploy --prod
   ```

### Troubleshooting Deployment

1. **Environment Variable Issues**
   - Ensure all required env variables are set in Vercel Dashboard
   - Check for any secret references in env variables

2. **Build Cache Issues**
   - Clear build cache by unchecking "Use existing Build Cache"
   - Or remove `.vercel` directory and relink:
   ```bash
   rm -rf .vercel
   npx vercel link
   ```

3. **Node.js Version**
   - Specify Node.js version in `package.json`:
   ```json
   {
     "engines": {
       "node": ">=18.17.0"
     }
   }
   ```

### Automatic Deployments

- Pushes to main branch trigger automatic deployments
- Monitor deployments in Vercel Dashboard
- Production URL format: `https://[project-name]-[hash]-[team].vercel.app`

## Related Documentation
- [Project Guide](./PROJECT_GUIDE.md)
- [System Checks](./SYSTEM_CHECKS.md)
- [Errors and Solutions](./ERRORS_AND_SOLUTIONS.md)

## Recent Updates

### Test Framework
- ✨ Consolidated test files into 5 main categories
- 🔧 Improved test organization
- 📝 Updated test documentation
- 🧪 Enhanced mock implementations

### Documentation
- 📚 Updated test automation guide
- 🔍 Added common error solutions
- 📖 Improved test examples
- 🛠️ New troubleshooting guides

## Getting Started

1. **Running Tests**
   ```bash
   # Run all tests
   npm test

   # Run specific test file
   npm test core.test.ts

   # Run tests with coverage
   npm test -- --coverage
   ```

2. **Test Categories**
   - Core Business Logic (`core.test.ts`)
   - Company Features (`company-features.test.tsx`)
   - Review Features (`review-features.test.tsx`)
   - UI Components (`ui.test.tsx`)
   - Integration Tests (`integration.test.tsx`)

## Contributing

1. Follow the test organization structure
2. Use provided test utilities and templates
3. Update documentation for significant changes
4. Run test coverage before committing

## Need Help?

- Check [ERRORS_AND_SOLUTIONS.md](./ERRORS_AND_SOLUTIONS.md)
- Review [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md)
- Run test diagnostics: `npm test` 