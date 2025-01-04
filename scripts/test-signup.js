const { createClient } = require('@supabase/supabase-js');

async function testSignup() {
  const supabase = createClient(
    'https://xgzjwbxvuqjkqxfmgzld.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnemp3Ynh2dXFqa3F4Zm1nemxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ4MjQxNDgsImV4cCI6MjAyMDQwMDE0OH0.GYq1v7uky9yMHYJXqQ1RrHVUxdgGQQpLWjEOKJ4xpHo'
  );
  
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