import { supabase } from './supabaseClient';
import { ErrorLogInsert } from '@/types/database';

// Use our mock type instead of trying to access it from the Database type
type ErrorLog = ErrorLogInsert;

export const logError = async (details: ErrorLog) => {
  try {
    const { error } = await supabase.from('error_logs').insert([{
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