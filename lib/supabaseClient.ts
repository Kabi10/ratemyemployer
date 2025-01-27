export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // Verify matches dashboard URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Verify matches anon key
); 