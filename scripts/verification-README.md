# Core Feature Verification System

A comprehensive testing framework for verifying all core features of the RateMyEmployer platform.

## Overview

The Core Feature Verification System provides automated testing for:

- **Authentication** - Email/password and Google OAuth
- **Company Management** - CRUD operations, search, filtering
- **Review System** - Submission, display, rating calculations
- **Search & Filter** - Global search and multi-criteria filtering
- **Wall Sections** - Wall of Fame/Shame functionality
- **Financial Distress** - Distress monitoring features
- **Rising Startups** - Growth tracking features
- **Database Integration** - Data integrity and API operations
- **UI/UX** - Responsive design and accessibility
- **Performance & Security** - Load times and security measures

## Quick Start

### Run All Verification Tests
```bash
npm run verify:core
```

### Run Specific Modules
```bash
# Authentication only
npm run verify:auth

# Company management only  
npm run verify:companies

# Review system only
npm run verify:reviews

# Multiple modules
tsx scripts/run-verification.ts authentication company-management review-system
```

### View Available Modules
```bash
tsx scripts/run-verification.ts --list
```

### Get Help
```bash
tsx scripts/run-verification.ts --help
```

## Configuration

The verification system uses `scripts/verification-config.json` for configuration:

```json
{
  "verification": {
    "environment": "development",
    "timeout": 30000,
    "retries": 3,
    "saveResults": true
  },
  "modules": {
    "authentication": {
      "enabled": true,
      "priority": 1,
      "dependencies": []
    }
  }
}
```

### Module Configuration

Each module can be configured with:
- `enabled`: Whether to run the module
- `priority`: Execution order
- `dependencies`: Required modules that must pass first
- `tests`: Individual test configuration

## Test Results

### Console Output
Results are displayed in the console with:
- ✅ Passed tests
- ❌ Failed tests  
- ⚠️ Warning tests
- ⏭️ Skipped tests

### Saved Reports
Detailed results are saved to `reports/verification-{session-id}.json` containing:
- Test execution details
- Performance metrics
- Error messages
- Metadata for each test

### Example Output
```
🔍 Starting Core Feature Verification Framework

🧪 Running authentication verification...
✅ Database Connection (45ms)
   Successfully connected to Supabase database
✅ Auth Configuration (12ms)
   All authentication methods are properly configured
✅ Email/Password Auth (8ms)
   Email/password authentication system is functional

📊 Verification Results Summary:
✅ Passed: 8/10 (80%)
❌ Failed: 1/10
⚠️ Warnings: 1/10
⏭️ Skipped: 0/10
```

## Module Details

### Authentication Module
Tests core authentication functionality:
- Database connectivity
- Auth method availability
- Session management
- Protected route access
- OAuth configuration

### Company Management Module  
Tests company-related features:
- Company listing and profiles
- Search functionality
- Industry/location filtering
- Statistics calculation

### Review System Module
Tests review functionality:
- Review listing with relationships
- Filtering by rating/status
- Sorting by date/rating
- Rating calculation accuracy

## Integration with Existing Tests

The verification system complements existing test scripts:
- `validate-core-functionality.ts` - Basic functionality checks
- `test-form-validation.ts` - Form validation testing
- `test-form-submissions.ts` - Form submission testing

## Development

### Adding New Tests
1. Add test method to appropriate module in `core-feature-verification.ts`
2. Update configuration in `verification-config.json`
3. Add module to `AVAILABLE_MODULES` in `run-verification.ts`

### Test Structure
```typescript
private async testNewFeature(): Promise<void> {
  const startTime = Date.now();
  try {
    // Test implementation
    const result = await someOperation();
    
    this.addResult('module-name', 'Test Name', 'passed',
      'Test description', Date.now() - startTime, 
      undefined, { metadata: 'value' });
  } catch (error) {
    this.addResult('module-name', 'Test Name', 'failed',
      'Test failed', Date.now() - startTime, `${error}`);
  }
}
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check Supabase environment variables
- Verify network connectivity
- Ensure Supabase project is active

**Authentication Tests Failed**
- Verify Supabase auth configuration
- Check OAuth provider setup
- Ensure RLS policies are configured

**No Data Found Warnings**
- Run database population scripts
- Check data seeding in test environment
- Verify table permissions

### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG=verification npm run verify:core
```

## CI/CD Integration

Add to GitHub Actions workflow:
```yaml
- name: Run Core Feature Verification
  run: npm run verify:core
  
- name: Upload Verification Results
  uses: actions/upload-artifact@v3
  with:
    name: verification-results
    path: reports/
```

## Performance Considerations

- Tests run sequentially by default for reliability
- Each test has a 30-second timeout
- Failed tests are retried up to 3 times
- Results are cached to avoid redundant operations

## Security Notes

- Tests use read-only operations where possible
- No sensitive data is logged in results
- Test data is isolated and cleaned up
- OAuth tests don't perform actual authentication flows