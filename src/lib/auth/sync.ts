import { getAuth } from 'firebase/auth';
import { supabase } from '@/lib/supabaseClient';

export const syncUserToSupabase = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) return;

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.uid,
      email: user.email,
      full_name: user.displayName,
      avatar_url: user.photoURL
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase sync error:', error);
    throw error;
  }

  return data;
}; 