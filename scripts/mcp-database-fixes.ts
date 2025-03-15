import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addMissingColumns() {
  console.log(chalk.blue('🔧 Adding missing columns to companies table...'));
  
  try {
    // Check if average_rating column exists
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'average_rating'
      `
    });
    
    if (columnsError) {
      // If exec_sql function doesn't exist, we need to create it first
      if (columnsError.message.includes('Could not find the function')) {
        console.log(chalk.yellow('⚠️ exec_sql function not found, creating it...'));
        await createExecSqlFunction();
        
        // Try again after creating the function
        return addMissingColumns();
      } else {
        throw columnsError;
      }
    }
    
    // If average_rating column doesn't exist, add it
    if (!columns || columns.length === 0) {
      console.log(chalk.yellow('⚠️ average_rating column not found, adding it...'));
      
      const { error: addColumnError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE companies 
          ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0,
          ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0
        `
      });
      
      if (addColumnError) throw addColumnError;
      console.log(chalk.green('✅ Added average_rating and total_reviews columns'));
    } else {
      console.log(chalk.green('✅ average_rating column already exists'));
    }
    
    // Update the average_rating and total_reviews columns with calculated values
    console.log(chalk.blue('🔄 Updating average_rating and total_reviews values...'));
    
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE companies c
        SET 
          average_rating = COALESCE(r.avg_rating, 0),
          total_reviews = COALESCE(r.review_count, 0)
        FROM (
          SELECT 
            company_id,
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM reviews
          GROUP BY company_id
        ) r
        WHERE c.id = r.company_id
      `
    });
    
    if (updateError) throw updateError;
    console.log(chalk.green('✅ Updated average_rating and total_reviews values'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error adding missing columns:'), error);
    throw error;
  }
}

async function createExecSqlFunction() {
  console.log(chalk.blue('🔧 Creating exec_sql function...'));
  
  try {
    // Create the exec_sql function directly using a raw query
    const { error } = await supabase.from('_exec_sql').select('*').limit(1);
    
    if (error && error.message.includes('relation "_exec_sql" does not exist')) {
      // Create the function using a raw query via the REST API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
        },
        body: JSON.stringify({
          sql: `
            CREATE OR REPLACE FUNCTION exec_sql(sql text)
            RETURNS SETOF json
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              RETURN QUERY EXECUTE sql;
            END;
            $$;
            
            -- Grant execute permission to authenticated users
            GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
            GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
            GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
          `
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create exec_sql function: ${JSON.stringify(errorData)}`);
      }
      
      console.log(chalk.green('✅ Created exec_sql function'));
    } else if (error) {
      throw error;
    } else {
      console.log(chalk.green('✅ exec_sql function already exists'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error creating exec_sql function:'), error);
    
    // Alternative approach: create the function using a direct SQL query
    console.log(chalk.yellow('⚠️ Trying alternative approach to create exec_sql function...'));
    
    try {
      // Create a temporary table to execute SQL
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS SETOF json
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            RETURN QUERY EXECUTE sql;
          END;
          $$;
          
          -- Grant execute permission to authenticated users
          GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
          GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
          GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
        `
      });
      
      if (createTableError) {
        console.error(chalk.red('❌ Alternative approach failed:'), createTableError);
        throw createTableError;
      }
      
      console.log(chalk.green('✅ Created exec_sql function using alternative approach'));
    } catch (altError) {
      console.error(chalk.red('❌ Both approaches failed to create exec_sql function'));
      throw altError;
    }
  }
}

async function fixStoredProcedures() {
  console.log(chalk.blue('🔧 Fixing stored procedures...'));
  
  try {
    // Create get_average_ratings_by_industry function
    const { error: avgRatingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_average_ratings_by_industry()
        RETURNS TABLE (
          industry TEXT,
          average_rating NUMERIC,
          company_count INTEGER
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            c.industry,
            ROUND(AVG(c.average_rating)::numeric, 2) as average_rating,
            COUNT(c.id) as company_count
          FROM companies c
          WHERE c.total_reviews > 0
          GROUP BY c.industry
          ORDER BY average_rating DESC;
        END;
        $$;
        
        -- Grant execute permission
        GRANT EXECUTE ON FUNCTION get_average_ratings_by_industry() TO authenticated;
        GRANT EXECUTE ON FUNCTION get_average_ratings_by_industry() TO anon;
        GRANT EXECUTE ON FUNCTION get_average_ratings_by_industry() TO service_role;
      `
    });
    
    if (avgRatingsError) throw avgRatingsError;
    console.log(chalk.green('✅ Created get_average_ratings_by_industry function'));
    
    // Create get_companies_with_no_reviews function
    const { error: noReviewsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_companies_with_no_reviews()
        RETURNS TABLE (
          id INTEGER,
          name TEXT,
          industry TEXT,
          location TEXT,
          created_at TIMESTAMP
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            c.id,
            c.name,
            c.industry,
            c.location,
            c.created_at
          FROM companies c
          WHERE c.total_reviews = 0
          ORDER BY c.created_at DESC;
        END;
        $$;
        
        -- Grant execute permission
        GRANT EXECUTE ON FUNCTION get_companies_with_no_reviews() TO authenticated;
        GRANT EXECUTE ON FUNCTION get_companies_with_no_reviews() TO anon;
        GRANT EXECUTE ON FUNCTION get_companies_with_no_reviews() TO service_role;
      `
    });
    
    if (noReviewsError) throw noReviewsError;
    console.log(chalk.green('✅ Created get_companies_with_no_reviews function'));
    
    // Create get_top_companies_by_industry function
    const { error: topCompaniesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_top_companies_by_industry(industry_name TEXT)
        RETURNS TABLE (
          id INTEGER,
          name TEXT,
          industry TEXT,
          average_rating NUMERIC,
          total_reviews INTEGER
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            c.id,
            c.name,
            c.industry,
            c.average_rating,
            c.total_reviews
          FROM companies c
          WHERE 
            c.industry = industry_name
            AND c.total_reviews > 0
          ORDER BY c.average_rating DESC, c.total_reviews DESC
          LIMIT 10;
        END;
        $$;
        
        -- Grant execute permission
        GRANT EXECUTE ON FUNCTION get_top_companies_by_industry(TEXT) TO authenticated;
        GRANT EXECUTE ON FUNCTION get_top_companies_by_industry(TEXT) TO anon;
        GRANT EXECUTE ON FUNCTION get_top_companies_by_industry(TEXT) TO service_role;
      `
    });
    
    if (topCompaniesError) throw topCompaniesError;
    console.log(chalk.green('✅ Created get_top_companies_by_industry function'));
    
    // Create get_recent_reviews_for_company function
    const { error: recentReviewsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_recent_reviews_for_company(company_id_param INTEGER)
        RETURNS TABLE (
          id INTEGER,
          title TEXT,
          rating NUMERIC,
          pros TEXT,
          cons TEXT,
          created_at TIMESTAMP
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            r.id,
            r.title,
            r.rating,
            r.pros,
            r.cons,
            r.created_at
          FROM reviews r
          WHERE r.company_id = company_id_param
          ORDER BY r.created_at DESC
          LIMIT 10;
        END;
        $$;
        
        -- Grant execute permission
        GRANT EXECUTE ON FUNCTION get_recent_reviews_for_company(INTEGER) TO authenticated;
        GRANT EXECUTE ON FUNCTION get_recent_reviews_for_company(INTEGER) TO anon;
        GRANT EXECUTE ON FUNCTION get_recent_reviews_for_company(INTEGER) TO service_role;
      `
    });
    
    if (recentReviewsError) throw recentReviewsError;
    console.log(chalk.green('✅ Created get_recent_reviews_for_company function'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error fixing stored procedures:'), error);
    throw error;
  }
}

async function main() {
  console.log(chalk.blue('🚀 Starting MCP database fixes...'));
  
  try {
    // Step 1: Create exec_sql function if it doesn't exist
    await createExecSqlFunction();
    
    // Step 2: Add missing columns to companies table
    await addMissingColumns();
    
    // Step 3: Fix stored procedures
    await fixStoredProcedures();
    
    console.log(chalk.green('✅ MCP database fixes completed successfully!'));
    console.log(chalk.blue('Next steps:'));
    console.log(chalk.blue('1. Run: npm run mcp:setup'));
    console.log(chalk.blue('2. Run: npm run mcp:setup-procedures'));
    console.log(chalk.blue('3. Run: npm run mcp:start'));
    console.log(chalk.blue('4. Test with: npm run mcp:sample-queries'));
  } catch (error) {
    console.error(chalk.red('❌ MCP database fixes failed:'), error);
    process.exit(1);
  }
}

main(); 