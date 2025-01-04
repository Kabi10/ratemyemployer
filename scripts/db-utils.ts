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

// Setup admin user
async function setupAdmin(email: string) {
  try {
    console.log('\nSetting up admin user...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const adminUser = users.find(u => u.email === email);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { user_metadata: { role: 'admin' } }
    );

    if (updateError) throw updateError;
    console.log('Successfully set up admin user!');
  } catch (error) {
    console.error('Error setting up admin:', error);
  }
}

// Audit database
async function auditDatabase() {
  try {
    console.log('\nAuditing database...');
    
    // Check users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.log('Note: Could not fetch users');
    } else {
      console.log('\nUsers:', users.length);
      console.log('Admins:', users.filter(u => u.user_metadata?.role === 'admin').length);
    }

    // Check companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.log('Note: Could not fetch companies');
    } else {
      console.log('\nCompanies:', companies.length);
      console.log('Verified:', companies.filter(c => c.verified).length);
    }

    // Check reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*');

    if (reviewsError) {
      console.log('Note: Could not fetch reviews');
    } else {
      console.log('\nReviews:', reviews.length);
      console.log('Average rating:', reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length);
    }
  } catch (error) {
    console.error('Error auditing database:', error);
  }
}

// Get schema info
async function getSchema() {
  try {
    console.log('\nFetching schema information...');
    
    // Get companies schema
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select()
      .limit(1);

    if (companiesError) {
      console.log('Note: Could not fetch companies schema');
    } else if (companies && companies[0]) {
      console.log('\nCompanies Table Schema:');
      Object.entries(companies[0]).forEach(([key, value]) => {
        console.log(`  ${key}: ${typeof value}`);
      });
    }

    // Get reviews schema
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select()
      .limit(1);

    if (reviewsError) {
      console.log('Note: Could not fetch reviews schema');
    } else if (reviews && reviews[0]) {
      console.log('\nReviews Table Schema:');
      Object.entries(reviews[0]).forEach(([key, value]) => {
        console.log(`  ${key}: ${typeof value}`);
      });
    }
  } catch (error) {
    console.error('Error getting schema:', error);
  }
}

// Export functions for CLI use
export {
  setupAdmin,
  auditDatabase,
  getSchema,
};

// CLI interface
const command = process.argv[2];
const email = process.argv[3];

switch (command) {
  case 'setup-admin':
    if (!email) {
      console.error('Please provide an email address');
      process.exit(1);
    }
    setupAdmin(email);
    break;
  case 'audit':
    auditDatabase();
    break;
  case 'schema':
    getSchema();
    break;
  default:
    console.log(`
Available commands:
  setup-admin <email>  - Set up an admin user
  audit               - Audit the database
  schema              - Get schema information
    `);
} 