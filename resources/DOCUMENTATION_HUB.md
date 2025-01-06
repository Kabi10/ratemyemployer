# Documentation Hub

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