import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

/**
 * MCP Stored Procedures Setup Script
 * 
 * This script sets up the stored procedures for the MCP integration,
 * allowing for more complex queries and operations on the Supabase database.
 */

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Create necessary directories
function createDirectories() {
  console.log(chalk.blue('📁 Creating MCP directories...'));
  
  const mcpDir = path.resolve(process.cwd(), '.mcp');
  const supabaseDir = path.resolve(mcpDir, 'supabase');
  
  if (!fs.existsSync(mcpDir)) {
    fs.mkdirSync(mcpDir);
    console.log(chalk.green(`✅ Created directory: ${mcpDir}`));
  } else {
    console.log(chalk.yellow(`⚠️ Directory already exists: ${mcpDir}`));
  }
  
  if (!fs.existsSync(supabaseDir)) {
    fs.mkdirSync(supabaseDir);
    console.log(chalk.green(`✅ Created directory: ${supabaseDir}`));
  } else {
    console.log(chalk.yellow(`⚠️ Directory already exists: ${supabaseDir}`));
  }
  
  return { mcpDir, supabaseDir };
}

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error(chalk.red('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable'));
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(chalk.red('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable'));
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Read SQL file
function readSqlFile(): string {
  console.log(chalk.blue('📄 Reading SQL procedures file...'));
  
  const sqlFilePath = path.resolve(process.cwd(), 'scripts/mcp-stored-procedures.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error(chalk.red(`❌ SQL file not found: ${sqlFilePath}`));
    console.log(chalk.yellow('⚠️ Please run the MCP setup script first: npm run mcp:setup'));
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(chalk.green(`✅ Read SQL file: ${sqlFilePath} (${sqlContent.length} bytes)`));
  
  return sqlContent;
}

// Split SQL into individual statements
function splitSqlStatements(sql: string): string[] {
  console.log(chalk.blue('🔍 Parsing SQL statements...'));
  
  // Split on function definitions
  const functionRegex = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+([^\s(]+)/gi;
  const functionMatches = [...sql.matchAll(functionRegex)];
  
  if (functionMatches.length === 0) {
    console.warn(chalk.yellow('⚠️ No function definitions found in SQL file'));
    return [];
  }
  
  console.log(chalk.green(`✅ Found ${functionMatches.length} function definitions`));
  
  // Extract each function definition
  const statements: string[] = [];
  let lastIndex = 0;
  
  for (let i = 0; i < functionMatches.length; i++) {
    const match = functionMatches[i];
    const startIndex = match.index!;
    
    // If this is not the first match, extract the previous function
    if (i > 0) {
      const endIndex = startIndex;
      const statement = sql.substring(lastIndex, endIndex).trim();
      statements.push(statement);
    }
    
    // Update lastIndex for the next iteration
    lastIndex = startIndex;
    
    // If this is the last match, extract until the end of the file
    if (i === functionMatches.length - 1) {
      const statement = sql.substring(lastIndex).trim();
      statements.push(statement);
    }
  }
  
  return statements;
}

// Parse SQL file
async function parseSqlFile(): Promise<string[]> {
  console.log(chalk.blue('📝 Reading SQL file...'));
  
  const sqlPath = path.resolve(process.cwd(), '.mcp/supabase/procedures.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error(chalk.red(`❌ SQL file not found: ${sqlPath}`));
    return [];
  }
  
  const content = fs.readFileSync(sqlPath, 'utf8');
  
  // Split into individual statements
  const statements = content
    .split(/;\s*$/m)  // Split on semicolon at end of line
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  console.log(chalk.green(`✅ Found ${statements.length} SQL statements`));
  
  return statements;
}

// Execute SQL statements
async function executeStatements(statements: { name: string; sql: string }[]) {
  console.log(chalk.blue('\n📝 Setting up stored procedures...'));
  
  // Output all SQL statements for manual execution
  console.log(chalk.yellow('\n⚠️ Please execute the following SQL statements in your Supabase dashboard:'));
  console.log(chalk.gray('\n-- Begin SQL statements --'));
  
  statements.forEach(({ name, sql }) => {
    console.log(chalk.blue(`\n-- Creating stored procedure: ${name}`));
    console.log(chalk.gray(sql));
  });
  
  console.log(chalk.gray('\n-- End SQL statements --'));
  console.log(chalk.yellow('\nAfter executing these statements, verify that they work as expected.'));
}

// Main function
async function main() {
  try {
    // Create directories
    const { mcpDir, supabaseDir } = createDirectories();
    
    // Parse SQL file
    const statements = await parseSqlFile();
    
    if (!statements || statements.length === 0) {
      console.error(chalk.red('❌ No SQL statements found to execute'));
      process.exit(1);
    }
    
    // Output statements for manual execution
    await executeStatements(statements.map(sql => {
      const functionNameMatch = sql.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+([^\s(]+)/i);
      const name = functionNameMatch ? functionNameMatch[1] : 'Unknown Function';
      return { name, sql };
    }));
    
    console.log(chalk.green('\n✅ Setup completed! Please execute the SQL statements in your Supabase dashboard.'));
  } catch (error) {
    console.error(chalk.red('\n❌ Error during setup:'), error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
}); 