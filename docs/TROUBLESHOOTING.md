# Build & Runtime Issues

## Common Errors

```bash
# Supabase Connection Issues
1. Verify .env.local contains:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
2. Check network policies
3. Verify RLS policies

# Type Conflicts
npm run type:reset  # Regenerate all types
```

## Performance Optimization

```bash
# Analyze bundle size
npm run analyze

# Profile component renders
npm run profile
```

## Database Recovery

```sql
-- Safe rollback procedure
BEGIN;
SELECT plan(3);
-- Your migration reversal
SELECT * FROM perform_rollback();
ROLLBACK;
```
