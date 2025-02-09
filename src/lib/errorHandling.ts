import { createClient } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type ErrorLog = Database['public']['Tables']['error_logs']['Insert'];

export const logError = async (details: ErrorLog) => {
  try {
    const { error } = await createClient.from('error_logs').insert([{
      ...details,
      created_at: new Date().toISOString()
    }]);
    
    if (error) {
      console.error('Error logging error:', error);
      // Add fallback logging if needed
    }
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}; 