import { supabase } from '../src/lib/supabaseClient';

async function testSignup() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (error) {
      console.error('Signup error:', error.message);
      return;
    }

    console.log('Signup successful:', data);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testSignup(); 