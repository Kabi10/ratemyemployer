# Errors and Solutions Guide

## Testing Related Issues

### 1. Test File Organization
**Structure:**
The project uses 5 consolidated test files:
1. `core.test.ts` - Core business logic tests
2. `company-features.test.tsx` - Company-related feature tests
3. `review-features.test.tsx` - Review-related feature tests
4. `ui.test.tsx` - UI component tests
5. `integration.test.tsx` - Integration tests

### 2. Supabase Auth State Change Error
**Error:**
```
TypeError: Cannot read properties of undefined (reading 'onAuthStateChange')
```

**Solution:**
- Ensure proper mocking of Supabase client in tests
- Mock should include auth object with onAuthStateChange method
- Example mock in `src/__tests__/mocks/mockSupabase.ts`:
```typescript
const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn().mockImplementation((callback) => {
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    })
  }
};
```

### 3. React Testing Library Loading State
**Error:**
Component assertions failing due to loading state not being properly handled

**Solution:**
- Use `waitFor` or `findBy` queries instead of `getBy`
- Wait for loading state to complete before assertions
- Example in `ui.test.tsx`:
```typescript
await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

### 4. Test Coverage Configuration
**Issue:**
Test coverage reporting not including all files

**Solution:**
- Update Vitest configuration to include all relevant paths
- Add coverage thresholds
- Example in `vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/types/**/*'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      }
    }
  }
});
```

## Database Related Issues

### 1. RLS Policy Errors
**Error:**
```sql
new row violates row-level security policy
```

**Solution:**
- Check RLS policies in Supabase dashboard
- Ensure proper role permissions
- Verify user authentication
- Example policy:
```sql
CREATE POLICY "Users can insert their own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### 2. Type Generation Issues
**Error:**
Missing or incorrect types from Supabase

**Solution:**
- Run type generation command
- Update schema if needed
- Verify database structure
```bash
npx supabase gen types typescript --project-id "your-project-id" > src/types/supabase.ts
```

## Authentication Issues

### 1. Session Persistence
**Error:**
Session not persisting between page refreshes

**Solution:**
- Check localStorage access
- Verify Supabase client initialization
- Example fix:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  }
);
```

## Form Validation Issues

### 1. Zod Validation Errors
**Error:**
Unexpected validation failures

**Solution:**
- Check schema definitions
- Ensure types match database
- Example schema:
```typescript
const reviewSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  employment_status: z.enum(['CURRENT', 'FORMER'])
});
```

## Build and Deployment Issues

### 1. Next.js Build Failures
**Error:**
Type errors during build

**Solution:**
- Run type check command
- Fix type issues
- Update dependencies
```bash
npm run type-check
```

### 2. Environment Variables
**Error:**
Missing environment variables in production

**Solution:**
- Check .env.local file
- Verify deployment platform settings
- Example .env.local:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Common Solutions

1. Clear local storage and cookies
2. Restart development server
3. Update dependencies
4. Check console for errors
5. Verify environment variables
6. Run type generation
7. Check database policies

## Prevention Tips

1. Write comprehensive tests
2. Use TypeScript strictly
3. Document schema changes
4. Keep dependencies updated
5. Monitor error logs
6. Regular security audits
7. Backup database regularly

## Quick Fixes

1. Development server issues:
```bash
npm run dev -- --clear
```

2. Type generation:
```bash
npm run update-types
```

3. Clear Next.js cache:
```bash
rm -rf .next
```

4. Reset database:
```bash
npm run reset-db
```

## Support Resources

1. [Next.js Documentation](https://nextjs.org/docs)
2. [Supabase Documentation](https://supabase.io/docs)
3. [TypeScript Documentation](https://www.typescriptlang.org/docs)
4. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

# Type System and Null Handling

## Common Type Errors

### Nullable Fields in Database Types
**Error**: Type 'string | null' is not assignable to type 'string'
**Solution**: 
1. Use type guards to check for null values
2. Provide default values when setting state
3. Update interfaces to accurately reflect nullable fields

Example:
```typescript
// Before
interface Profile {
  updated_at: string;
}

// After
interface Profile {
  updated_at: string | null;
}
```

### State Management with Nullable Values
**Error**: Argument of type '{ ... }' is not assignable to parameter of type 'SetStateAction<T>'
**Solution**:
1. Transform data before setting state
2. Use default values for required fields
3. Update type definitions to match database schema

Example:
```typescript
// Before
setProfile(data);

// After
setProfile({
  ...data,
  updated_at: data.updated_at || new Date().toISOString(),
});
```

### Review Likes Type Safety
**Error**: Type 'string' is not assignable to type 'number' for review_id
**Solution**:
1. Parse string IDs to numbers before database operations
2. Update type definitions to match database schema
3. Add proper type assertions for database operations

Example:
```typescript
const reviewId = parseInt(id, 10);
await supabase.from('review_likes').upsert({
  review_id: reviewId,
  user_id: userId,
  liked: true,
});
```

### Analytics Data Processing
**Error**: 'curr.rating' is possibly 'null'
**Solution**:
1. Filter out null values before calculations
2. Use type guards to ensure type safety
3. Provide default values for calculations

Example:
```typescript
const validReviews = reviews.filter((review): review is Review & { rating: number } => 
  typeof review.rating === 'number'
);
const average = validReviews.reduce((acc, curr) => acc + curr.rating, 0) / validReviews.length;
```

# Prevention Tips

1. Always define explicit types for database operations
2. Use type guards to handle nullable fields
3. Transform data before setting state
4. Provide default values for required fields
5. Keep type definitions in sync with database schema
6. Use TypeScript's strict mode for better type safety
7. Document nullable fields and their handling

# Quick Fixes

1. Add null checks before accessing properties
2. Use the nullish coalescing operator (??) for default values
3. Use optional chaining (?.) for potentially null objects
4. Transform data at the boundaries (API/database layer)
5. Keep type definitions centralized and well-documented

# Support Resources

1. TypeScript Documentation: https://www.typescriptlang.org/docs/
2. Supabase Type System: https://supabase.com/docs/reference/typescript-support
3. React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/

# Common Errors and Solutions

## Test-Related Errors

### 1. Import Resolution Errors

#### Error:
```
Cannot find module '../mocks/mockData' or its corresponding type declarations.
```

#### Solution:
```bash
# Run the test fix script
npm run test:fix

# Or manually update imports to:
import { mockUser } from '../mocks/user.mock';
import { mockReview } from '../mocks/review.mock';
import { mockCompany } from '../mocks/company.mock';
```

### 2. Component Props Errors

#### Error:
```
Type '{ review: Review; }' is not assignable to type 'IntrinsicAttributes & ReviewCardProps'.
Property 'reviewId' does not exist on type 'IntrinsicAttributes & ReviewCardProps'.
```

#### Solution:
```bash
# Run the test fix script
npm run test:fix

# Or manually update component props:
<ReviewCard reviewId={review.id} initialLikes={review.likes_count || 0} />
```

### 3. Test Environment Errors

#### Error:
```
ReferenceError: vi is not defined
```

#### Solution:
```typescript
// Add vitest imports
import { describe, it, expect, vi } from 'vitest';

// Or run setup script
npm run test:setup
```

### 4. Missing Test Utilities

#### Error:
```
Cannot find module '../utils/test-utils' or its corresponding type declarations.
```

#### Solution:
```bash
# Run setup script to create missing utilities
npm run test:setup
```

### 5. Supabase Client Errors

#### Error:
```
Error: Supabase client not initialized
```

#### Solution:
```typescript
// Use mock client in tests
import { mockSupabaseClient } from '../mocks/supabase.mock';
import { renderWithProviders } from '../utils/test-utils';

// Use renderWithProviders instead of plain render
const { container } = renderWithProviders(<Component />);
```

### 6. Test Directory Structure Issues

#### Error:
```
Cannot find test files in expected location
```

#### Solution:
```bash
# Run setup script to organize test files
npm run test:setup
```

## Database-Related Errors

[Previous database-related errors content...]

## Build and Deployment Errors

[Previous build and deployment errors content...]

## Authentication Errors

[Previous authentication errors content...]

## Form Validation Errors

[Previous form validation errors content...]

## API Integration Errors

[Previous API integration errors content...]

## Performance Issues

[Previous performance issues content...]

## Getting Help

1. Check this document for common solutions
2. Run the appropriate fix script:
   ```bash
   npm run test:fix     # For test-related issues
   npm run test:setup   # For environment issues
   npm run test:all     # For comprehensive fixes
   ```
3. Review test logs in `src/__tests__/utils/test-setup.ts`
4. Check test configuration in `vitest.config.ts`
5. Review mock data in `src/__tests__/mocks/`

## Vercel Deployment Issues

### Environment Variable Reference Error

**Error:**
```
Error: Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "next_public_supabase_url", which does not exist.
```

**Solution:**
1. Go to Vercel Dashboard > Project Settings > Environment Variables
2. Add variables directly without using secret references
3. Make sure to add variables to all required environments (Production, Preview, Development)

### Build Cache Issues

**Error:**
- Deployments failing quickly (under 10 seconds)
- Old code being deployed despite new commits

**Solution:**
1. Clear build cache:
   - Uncheck "Use existing Build Cache" when redeploying
   - Or remove local cache:
   ```bash
   rm -rf .vercel
   npx vercel link
   ```

### Node.js Version Mismatch

**Error:**
- Build failures related to Node.js version compatibility
- Package dependency issues

**Solution:**
1. Specify Node.js version in `package.json`:
   ```json
   {
     "engines": {
       "node": ">=18.17.0"
     }
   }
   ```
2. Use LTS version (18.x or 20.x) for better compatibility

### CLI Deployment Issues

**Error:**
- CLI commands not working
- Permission issues

**Solution:**
1. Install CLI globally:
   ```bash
   npm i -g vercel
   ```
2. Use `npx` for one-time commands:
   ```bash
   npx vercel deploy --prod
   ```
3. Ensure you're logged in:
   ```bash
   npx vercel login
   ```

### Git Integration Issues

**Error:**
- Wrong commit being deployed
- Changes not reflecting in deployment

**Solution:**
1. Verify the connected repository in Vercel Dashboard
2. Check production branch settings
3. Try disconnecting and reconnecting repository
4. Ensure changes are pushed to the correct branch