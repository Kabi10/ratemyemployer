# Rate My Employer - Project Reference Guide

## Overview
Rate My Employer is a platform for employees to share their experiences and rate their employers. Built with Next.js, TypeScript, and Supabase, it provides a secure and user-friendly interface for workplace reviews.

## 🔄 Auto-Update Information
This guide is part of an automated documentation system. For details on how the automation works, see [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md).

This guide automatically updates when:
1. New dependencies are added to `package.json`
2. Schema changes in `src/lib/schemas.ts`
3. New components are added to `src/components`
4. API routes are modified in `src/app/api`
5. Database structure changes in Supabase

## Table of Contents
- [Overview](#overview)
- [Auto-Update Information](#-auto-update-information)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Development Guidelines](#development-guidelines)
- [Key Features](#key-features)
- [Database & Security](#database--security)
- [Testing](#testing)
- [System Health Checks](#system-health-checks)
- [Deployment](#deployment)
- [Resources](#resources)
- [Related Guides](#related-guides)

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Auth, Database)
- **State Management**: React Context, SWR
- **Form Handling**: React Hook Form, Zod
- **Testing**: Jest, React Testing Library

## Project Structure
```
src/
├── app/                 # Next.js app router pages and API routes
│   ├── api/            # Backend API endpoints
│   ├── (auth)/         # Authentication related pages
│   └── companies/      # Company related pages
├── components/          # Reusable UI components
│   ├── layouts/        # Layout components
│   └── ui/             # UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configs
│   ├── schemas.ts      # Zod validation schemas
│   └── supabase-*.ts   # Supabase client/server
├── middleware.ts       # Request middleware
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── __tests__/         # Test files
```

## Setup Instructions
1. **Prerequisites**
   - Node.js 18+ 
   - npm/yarn
   - Supabase account

2. **Environment Setup**
   ```bash
   # Clone repository
   git clone https://github.com/Kabi10/ratemyemployer.git
   cd ratemyemployer
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env.local
   ```

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Development**
   ```bash
   # Start development server
   npm run dev
   
   # Run tests
   npm test
   
   # Type checking
   npm run type-check
   ```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error handling
- Write unit tests for components

### Git Workflow
1. Create feature branch from main
2. Follow conventional commits
   ```
   feat: add company rating feature
   fix: resolve auth redirect issue
   docs: update setup instructions
   ```
3. Submit PR with description
4. Ensure tests pass
5. Get code review
6. Merge after approval

## Key Features
1. **Authentication**
   - Email/password login
   - Social auth providers
   - Protected routes
   - Role-based access control

2. **Company Reviews**
   - Rating system (1-5 stars)
   - Detailed reviews with pros/cons
   - Employment status tracking
   - Anonymous reviews
   - Moderation system

3. **Admin Dashboard**
   - Review management
   - User management
   - Analytics
   - Content moderation

## Database & Security

### Data Models
```typescript
// Company Schema
{
  name: string;          // 2-100 chars
  description: string;   // 10-1000 chars
  industry: enum;        // From predefined list
  location: string;      // 2-100 chars
  website?: string;      // Optional URL
  size?: enum;          // Small/Medium/Large/Enterprise
  logo_url?: string;    // Optional URL
}

// Review Schema
{
  content: string;       // 10-2000 chars
  rating: number;        // 1-5
  pros?: string;        // 0-500 chars
  cons?: string;        // 0-500 chars
  position: string;      // 2-100 chars
  employment_status: enum; // FULL_TIME/PART_TIME/CONTRACT/INTERN
}
```

### Security Measures
- **Supabase RLS Policies**
  - Row-level security
  - User role-based access
  - Data validation
- **API Security**
  - Rate limiting
  - Request validation
  - CORS configuration

## Testing
- Unit tests with Jest
- Component testing with React Testing Library
- Integration tests
- E2E tests (planned)
- Test coverage reporting

## System Health Checks
For maintaining and optimizing the project, we have a comprehensive suite of automated system checks. 
See [SYSTEM_CHECKS.md](./SYSTEM_CHECKS.md) for detailed documentation.

Quick reference:
```bash
npm run check            # Run all checks
npm run check:deps      # Check dependencies
npm run check:types     # Check TypeScript
npm run check:build     # Check build performance
npm run check:quality   # Check code quality
npm run check:tests     # Check test coverage
npm run check:memory    # Check memory usage
npm run check:env       # Check environment
```

## Deployment
- Vercel for frontend
  - Production: [URL]
  - Staging: [URL]
- Supabase for backend
  - Database backups
  - Migration scripts
- Automated CI/CD pipeline
  - GitHub Actions workflows
  - Automated testing
  - Preview deployments

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Project Repository](https://github.com/Kabi10/ratemyemployer)

## Related Guides
- [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md) - How the project maintains itself
- [SYSTEM_CHECKS.md](./SYSTEM_CHECKS.md) - System health and optimization
- [ERRORS_AND_SOLUTIONS.md](./ERRORS_AND_SOLUTIONS.md) - Error tracking and solutions

---

*Note: This guide is automatically updated based on project changes. Last updated: [Current Date]* 