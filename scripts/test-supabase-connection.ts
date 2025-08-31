import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Variables Check:');
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '❌ Missing'}`);
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Set' : '❌ Missing'}`);
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? '✓ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables. Please check your .env file.');
    process.exit(1);
  }

  // Test with anon key (public client)
  console.log('🔓 Testing Anonymous Client Connection...');
  const anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await anonClient
      .from('companies')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Anonymous client connection failed:', error.message);
    } else {
      console.log('✅ Anonymous client connection successful');
      console.log('📊 Can access companies table');
    }
  } catch (err) {
    console.error('❌ Anonymous client connection error:', err);
  }

  // Test with service role key if available
  if (supabaseServiceRoleKey) {
    console.log('\n🔐 Testing Service Role Client Connection...');
    const serviceClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

    try {
      const { data, error } = await serviceClient
        .from('companies')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Service role client connection failed:', error.message);
      } else {
        console.log('✅ Service role client connection successful');
        console.log('📊 Can access companies table with admin privileges');
      }
    } catch (err) {
      console.error('❌ Service role client connection error:', err);
    }
  }

  // Test basic database queries
  console.log('\n📊 Testing Database Tables...');
  
  const tables = ['companies', 'reviews', 'company_sections', 'news_articles'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await anonClient
        .from(table as any)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': ${count} records`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Connection error`);
    }
  }

  // Test authentication
  console.log('\n🔐 Testing Authentication...');
  try {
    const { data: { user }, error } = await anonClient.auth.getUser();
    
    if (error) {
      console.log('ℹ️ No authenticated user (expected for anonymous connection)');
    } else if (user) {
      console.log(`✅ Authenticated as: ${user.email}`);
    } else {
      console.log('ℹ️ No authenticated user');
    }
  } catch (err) {
    console.log('❌ Authentication test failed:', err);
  }

  // Test real-time capabilities
  console.log('\n⚡ Testing Real-time Capabilities...');
  try {
    const channel = anonClient
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'companies' },
        (payload) => console.log('Received real-time update:', payload)
      );

    await new Promise((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription successful');
          resolve(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Real-time subscription failed');
          resolve(false);
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        console.log('⏱️ Real-time test timeout');
        resolve(false);
      }, 5000);
    });

    await channel.unsubscribe();
  } catch (err) {
    console.log('❌ Real-time test failed:', err);
  }

  console.log('\n🎉 Connection test completed!');
}

// Run the test
if (require.main === module) {
  testSupabaseConnection().catch(console.error);
}

export default testSupabaseConnection;