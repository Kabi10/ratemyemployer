# Rate My Employer - Project Guide

## Project Status

### Testing Progress
- Current Coverage: 7%
- Target Coverage: 70%
- Test Files Consolidated: ✅
- Core Tests Implemented: ✅
- Feature Tests Implemented: ✅
- UI Tests Implemented: ✅
- Integration Tests Implemented: ✅

### Next Steps
1. Improve test coverage:
   - Add more test cases to core tests
   - Expand feature test scenarios
   - Add UI component variations
   - Enhance integration test flows

2. Optimize test performance:
   - Improve mock implementations
   - Reduce test execution time
   - Enhance error handling
   - Streamline test utilities

## Project Structure

### Source Code
```
src/
├── __tests__/           # Test files
│   ├── core.test.ts              # Core business logic tests
│   ├── company-features.test.tsx # Company feature tests
│   ├── review-features.test.tsx  # Review feature tests
│   ├── ui.test.tsx              # UI component tests
│   ├── integration.test.tsx     # Integration tests
│   ├── setup.ts                 # Test setup and configuration
│   ├── mocks/                   # Mock data and utilities
│   └── utils/                   # Test utilities
├── app/                # Next.js app router
├── components/         # React components
├── contexts/          # React contexts
├── lib/               # Utilities
└── types/             # TypeScript types
```

### Test Categories

#### Core Tests (`core.test.ts`)
- Authentication flows
- Database operations
- API endpoints
- Error handling

#### Company Feature Tests (`company-features.test.tsx`)
- Company CRUD operations
- Company search and filtering
- Company reviews
- Company statistics

#### Review Feature Tests (`review-features.test.tsx`)
- Review submission
- Review filtering
- Review likes
- Review management

#### UI Tests (`ui.test.tsx`)
- Basic components
- Navigation components
- Form components
- Card components

#### Integration Tests (`integration.test.tsx`)
- End-to-end flows
- Cross-component interactions
- State management
- API integrations

## Development Setup

### Prerequisites
- Node.js v18+
- npm v9+
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/ratemyemployer.git

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test core.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Development Workflow

### 1. Feature Development
1. Create feature branch
2. Write tests first
3. Implement feature
4. Run tests
5. Update documentation

### 2. Testing
1. Write unit tests
2. Write integration tests
3. Test edge cases
4. Check coverage
5. Fix failing tests

### 3. Code Review
1. Self-review changes
2. Run all checks
3. Create pull request
4. Address feedback
5. Merge when approved

## Testing Guidelines

### 1. Test Organization
- Place tests in appropriate directories based on type
- Use consistent file naming: `ComponentName.test.tsx`
- Keep test utilities centralized in `utils/`
- Maintain mock data in `__mocks__/`
- Group related tests in describe blocks

### 2. Component Tests
- Test rendering and props
- Test user interactions
- Test loading states
- Test error states
- Test success states
- Use `test-utils.tsx` for common setup

### 3. Integration Tests
- Test complete features
- Test form submissions
- Test API interactions
- Test navigation flows
- Test data persistence
- Use MSW for API mocking

### 4. E2E Tests
- Test critical user flows
- Test authentication
- Test data creation
- Test error scenarios
- Test responsive behavior
- Use Playwright for automation

### 5. Mock Data
- Use centralized mock data
- Create factory functions
- Mock API responses
- Mock authentication
- Mock external services
- Keep mocks up to date

### 6. Test Coverage
- Aim for 85% coverage
- Focus on critical paths
- Test edge cases
- Test error handling
- Test async operations
- Monitor coverage trends

### 7. Best Practices
- Write tests first (TDD)
- Keep tests focused
- Use meaningful descriptions
- Follow AAA pattern
- Mock external dependencies
- Use data-testid for queries
- Avoid implementation details
- Test user behavior
- Maintain test documentation

## Deployment

### 1. Pre-deployment Checks
- Run all tests
- Check coverage
- Verify types
- Check linting
- Build locally

### 2. Deployment Process
- Merge to main
- Run CI/CD
- Deploy to staging
- Run smoke tests
- Deploy to production

## Documentation

### 1. Code Documentation
- Add JSDoc comments
- Document props
- Document hooks
- Document utilities
- Document types

### 2. Test Documentation
- Document test cases
- Document mocks
- Document utilities
- Document setup
- Document coverage

## Best Practices

### 1. Testing
- Write tests first
- Keep tests focused
- Mock external services
- Test edge cases
- Maintain coverage

### 2. Code Quality
- Use TypeScript
- Follow ESLint rules
- Format with Prettier
- Write clean code
- Document changes

### 3. Performance
- Optimize bundles
- Lazy load components
- Cache API calls
- Monitor metrics
- Test performance

## Resources

### Documentation
- [Next.js](https://nextjs.org/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Jest](https://jestjs.io/docs/getting-started)
- [Supabase](https://supabase.com/docs)

### Tools
- [TypeScript](https://www.typescriptlang.org/docs)
- [ESLint](https://eslint.org/docs/user-guide)
- [Prettier](https://prettier.io/docs/en)
- [Husky](https://typicode.github.io/husky)

## Support

### Getting Help
1. Check documentation
2. Search issues
3. Ask team members
4. Create issue
5. Update docs

### Contributing
1. Fork repository
2. Create branch
3. Make changes
4. Add tests
5. Create PR

## Security

### Authentication
- Use Supabase auth
- Secure routes
- Protect API
- Handle errors
- Test security

### Data Protection
- Use RLS policies
- Validate input
- Sanitize output
- Encrypt sensitive data
- Test security

## Monitoring

### Error Tracking
- Log errors
- Monitor trends
- Alert on issues
- Track resolution
- Update docs

### Performance
- Track metrics
- Monitor trends
- Set baselines
- Alert on issues
- Optimize code

## Maintenance

### Regular Tasks
- Update dependencies
- Run security audit
- Check coverage
- Review logs
- Update docs

### Code Health
- Review PRs
- Fix bugs
- Improve tests
- Refactor code
- Update types

## Testing Structure

### Directory Organization
All tests are now centralized in `src/__tests__/` with the following structure:
```
src/__tests__/
├── components/     # Component tests
├── hooks/         # Hook tests
├── lib/          # Library/utility tests
├── integration/  # Integration tests
├── e2e/         # End-to-end tests
├── utils/       # Test utilities
│   ├── renderUtils.tsx      # Common render utilities
│   ├── customMatchers.ts   # Custom test matchers
│   └── testHelpers.ts     # Test setup/cleanup helpers
└── mocks/       # Mock data and handlers
    ├── mockData.ts        # Mock test data
    └── handlers.ts       # MSW API handlers
```

### Import Conventions
- Use relative imports for test files
- Example:
  ```typescript
  // Instead of @/components/Button
  import { Button } from '../../../components/Button'
  
  // Instead of @/utils/test-utils
  import { renderWithProviders } from '../utils/renderUtils'
  ```

### Test Setup
- All test configuration is in `src/__tests__/setup.ts`
- Uses Vitest as the test runner
- MSW for API mocking
- Custom test utilities and matchers

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run specific tests
npm test path/to/test

# Run e2e tests
npm run test:e2e
```