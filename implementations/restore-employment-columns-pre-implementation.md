# Restore Employment Columns Migration - Pre-Implementation

## What
Adding `supabase/migrations/20251001_restore_employment_columns.sql` to restore
`employment_status` and `is_current_employee` columns dropped by the MVP schema
simplification migration.

## Why
`20250910_simplify_mvp_schema.sql` dropped these columns, but the following UI
components still actively reference them:
- `ReviewForm.tsx` — form fields for users to fill in
- `ReviewCard.tsx` — displays employment status in review cards
- `EnhancedReviewListContainer.tsx` — filters reviews by employment status

## Existing State
- Columns dropped in DB via migration
- App code still writes/queries these columns causing runtime errors

## Implementation
- New migration: `ADD COLUMN IF NOT EXISTS` (idempotent, safe to run twice)
- TypeScript type updated: `employment_status` marked nullable to handle rows
  created while the column was absent
