import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupAdmin() {
  try {
    // Update the user's role directly
    const { error: updateError, data } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('email', 'kabiedu@gmail.com')
      .select();

    if (updateError) {
      console.error('Error setting admin user:', updateError);
      return;
    }

    console.log('Successfully set up admin user!');
    console.log('Updated user:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

setupAdmin().catch(console.error);
