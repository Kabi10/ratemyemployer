import { createClient } from '../src/lib/supabase-client';

async function testSignup() {
  const supabase = createClient();
  const testEmail = 'user@test.com';
  const testPassword = 'Password123';

  try {
    console.log('Testing signup with:', { testEmail });
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'user',
          created_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      console.error('Signup failed:', error);
      process.exit(1);
    }

    console.log('Signup successful:', {
      id: data.user?.id,
      email: data.user?.email,
      role: data.user?.user_metadata.role,
    });

    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

testSignup(); 