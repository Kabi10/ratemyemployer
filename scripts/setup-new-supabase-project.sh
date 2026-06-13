#!/usr/bin/env bash
# Run this after creating a new Supabase project.
# Usage: bash scripts/setup-new-supabase-project.sh
#
# Before running, set these environment variables:
#   export NEW_PROJECT_REF=your_project_ref          # e.g. abcdefghijklmnop
#   export NEW_SUPABASE_URL=https://xxx.supabase.co
#   export NEW_SUPABASE_ANON_KEY=eyJ...
#   export NEW_SUPABASE_SERVICE_ROLE_KEY=eyJ...
#   export SUPABASE_ACCESS_TOKEN=your_supabase_pat   # from supabase.com/dashboard/account/tokens

set -e

if [ -z "$NEW_PROJECT_REF" ]; then
  echo "ERROR: Set NEW_PROJECT_REF before running."
  exit 1
fi

echo "=== 1. Linking Supabase CLI to new project ==="
supabase link --project-ref "$NEW_PROJECT_REF"

echo "=== 2. Pushing all migrations ==="
supabase db push

echo "=== 3. Updating .env.local ==="
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$NEW_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEW_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$NEW_SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://rate-my-employer.vercel.app
EOF
echo ".env.local updated"

echo "=== 4. Updating GitHub secrets ==="
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "$NEW_SUPABASE_URL"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "$NEW_SUPABASE_ANON_KEY"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$NEW_SUPABASE_SERVICE_ROLE_KEY"
gh secret set SUPABASE_PROJECT_ID --body "$NEW_PROJECT_REF"
gh secret set SUPABASE_ACCESS_TOKEN --body "$SUPABASE_ACCESS_TOKEN"
echo "GitHub secrets updated"

echo "=== 5. Updating Vercel env vars ==="
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes 2>/dev/null || true
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes 2>/dev/null || true
echo "$NEW_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$NEW_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "$NEW_SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "Vercel env vars updated"

echo ""
echo "=== DONE ==="
echo "Now run the data restore:"
echo "  1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/$NEW_PROJECT_REF/sql"
echo "  2. Paste contents of: supabase/seed/restore_data.sql"
echo "  3. Run it"
echo ""
echo "Then redeploy:"
echo "  vercel --prod"
