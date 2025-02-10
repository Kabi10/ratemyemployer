# Build Troubleshooting Guide

This guide helps you resolve common build issues in the Rate My Employer project.

## Quick Fixes

1. **Clear Dependencies**

   ```bash
   # Remove dependencies
   rm -rf node_modules
   rm package-lock.json

   # Clean cache
   npm cache clean --force

   # Reinstall
   npm install
   ```

2. **Clear Next.js Cache**

   ```bash
   # Remove Next.js cache
   rm -rf .next

   # Rebuild
   npm run build
   ```

## Common Issues and Solutions

### 1. TypeScript Errors

#### Symptoms

- Build fails with type errors
- Red squiggly lines in IDE
- "Type ... is not assignable to type ..."

#### Solutions

1. Run type checking:
   ```bash
   npm run type-check
   ```
2. Update type definitions:
   ```bash
   npm run update-types
   ```
3. Check `tsconfig.json` settings
4. Verify all required type definitions are installed

### 2. Environment Variables

#### Symptoms

- Build fails with missing environment variable errors
- API calls fail
- Supabase connection issues

#### Solutions

1. Check `.env.local` exists and contains:

   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

2. Verify environment variables are properly loaded:
   ```bash
   npm run verify
   ```

### 3. Dependency Issues

#### Symptoms

- Package version conflicts
- Missing peer dependencies
- Incompatible versions

#### Solutions

1. Check for outdated packages:

   ```bash
   npm outdated
   ```

2. Update dependencies:

   ```bash
   npm update
   ```

3. Fix peer dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### 4. Build Performance Issues

#### Symptoms

- Slow build times
- Memory issues
- Build hanging

#### Solutions

1. Increase Node.js memory limit:

   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. Optimize build configuration:
   - Check `next.config.js`
   - Review webpack configuration
   - Analyze bundle size

### 5. Testing Issues

#### Symptoms

- Tests failing
- Coverage thresholds not met
- Test timeouts

#### Solutions

1. Run tests in watch mode:

   ```bash
   npm test -- --watch
   ```

2. Update test configuration:
   - Check `jest.config.js`
   - Verify test setup files
   - Update test timeouts

## Prevention Tips

1. **Regular Maintenance**

   - Keep dependencies updated
   - Run type checking regularly
   - Maintain test coverage

2. **Pre-commit Checks**

   - Use husky hooks
   - Run linting before commits
   - Verify types before pushing

3. **CI/CD Best Practices**
   - Use build verification workflow
   - Monitor build times
   - Track error patterns

## Getting Help

1. Check the build verification report:

   ```bash
   npm run verify
   ```

2. Review error logs:

   - Check `npm-debug.log`
   - Review GitHub Actions logs
   - Check browser console

3. Contact Support
   - Open a GitHub issue
   - Tag with appropriate labels
   - Provide build verification report

## Additional Resources

- [Next.js Build Documentation](https://nextjs.org/docs/deployment)
- [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [Supabase Setup Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Testing Best Practices](https://testing-library.com/docs/react-testing-library/intro/)

3. Check `src/components/companies/CompanyList.tsx` settings
