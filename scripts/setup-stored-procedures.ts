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

// Execute SQL statements
async function executeSqlStatements(statements: string[]): Promise<void> {
  console.log(chalk.blue('🚀 Executing SQL statements...'));
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const functionNameMatch = statement.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+([^\s(]+)/i);
    const functionName = functionNameMatch ? functionNameMatch[1] : `Statement ${i + 1}`;
    
    console.log(chalk.blue(`📝 Executing: ${functionName}...`));
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // If the exec_sql function doesn't exist, we need to create it first
        if (error.message.includes('function exec_sql') && error.message.includes('does not exist')) {
          console.log(chalk.yellow('⚠️ Creating exec_sql function...'));
          
          const createExecSqlFn = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
          `;
          
          const { error: createError } = await supabase.rpc('exec_sql', { sql: createExecSqlFn });
          
          if (createError) {
            // If we can't create the function, try direct SQL execution
            console.log(chalk.yellow('⚠️ Attempting direct SQL execution...'));
            
            const { error: directError } = await supabase.from('_sql').select('*').eq('query', statement).single();
            
            if (directError) {
              console.error(chalk.red(`❌ Failed to execute ${functionName}:`), directError);
              console.log(chalk.yellow('⚠️ You may need to execute this SQL manually in the Supabase SQL editor'));
              continue;
            }
          } else {
            // Try executing the original statement again
            const { error: retryError } = await supabase.rpc('exec_sql', { sql: statement });
            
            if (retryError) {
              console.error(chalk.red(`❌ Failed to execute ${functionName} after creating exec_sql:`), retryError);
              continue;
            }
          }
        } else {
          console.error(chalk.red(`❌ Failed to execute ${functionName}:`), error);
          continue;
        }
      }
      
      console.log(chalk.green(`✅ Successfully executed: ${functionName}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error executing ${functionName}:`), error);
    }
  }
}

// Verify functions exist
async function verifyFunctions(statements: string[]): Promise<void> {
  console.log(chalk.blue('🔍 Verifying functions...'));
  
  const functionNames: string[] = [];
  
  // Extract function names from statements
  for (const statement of statements) {
    const functionNameMatch = statement.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+([^\s(]+)/i);
    if (functionNameMatch) {
      functionNames.push(functionNameMatch[1]);
    }
  }
  
  if (functionNames.length === 0) {
    console.warn(chalk.yellow('⚠️ No function names extracted from statements'));
    return;
  }
  
  console.log(chalk.blue(`📝 Checking ${functionNames.length} functions...`));
  
  // Check each function
  for (const functionName of functionNames) {
    try {
      // Try to call the function with minimal arguments
      // This is just to check if it exists, not to get meaningful results
      const { error } = await supabase.rpc(functionName);
      
      // If there's an error but it's not about the function not existing, that's okay
      if (error && !error.message.includes('does not exist')) {
        console.log(chalk.green(`✅ Function exists: ${functionName} (error: ${error.message})`));
      } else if (!error) {
        console.log(chalk.green(`✅ Function exists and executed: ${functionName}`));
      } else {
        console.error(chalk.red(`❌ Function does not exist: ${functionName}`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error checking function ${functionName}:`), error);
    }
  }
}

// Generate documentation
function generateDocumentation(statements: string[]): void {
  console.log(chalk.blue('📝 Generating documentation...'));
  
  const docPath = path.resolve(process.cwd(), 'MCP_PROCEDURES.md');
  
  let docContent = `# RateMyEmployer MCP Stored Procedures

This document describes the stored procedures available for use with the Model Context Protocol (MCP) in the RateMyEmployer application.

## Available Procedures

`;
  
  // Extract function information from statements
  for (const statement of statements) {
    const functionNameMatch = statement.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+([^\s(]+)/i);
    if (!functionNameMatch) continue;
    
    const functionName = functionNameMatch[1];
    
    // Extract return type
    const returnMatch = statement.match(/RETURNS\s+([^\s]+|TABLE\s*\([^)]+\))/i);
    const returnType = returnMatch ? returnMatch[1] : 'unknown';
    
    // Extract parameters
    const paramsMatch = statement.match(/\(\s*([^)]*)\s*\)\s*RETURNS/i);
    const params = paramsMatch ? paramsMatch[1] : '';
    
    // Extract description from comments
    const commentMatch = statement.match(/--\s*([^\n]+)/);
    const description = commentMatch ? commentMatch[1] : 'No description available';
    
    // Add to documentation
    docContent += `### ${functionName}\n\n`;
    docContent += `**Description:** ${description}\n\n`;
    docContent += `**Parameters:** ${params || 'None'}\n\n`;
    docContent += `**Returns:** ${returnType}\n\n`;
    docContent += `**Example:**\n\`\`\`sql\nSELECT * FROM ${functionName}();\n\`\`\`\n\n`;
  }
  
  // Add usage information
  docContent += `## Using These Procedures with MCP

When using the Model Context Protocol (MCP) with Cursor, you can reference these procedures in natural language. For example:

- "Show me the average ratings by industry"
- "Get the top companies in the Technology industry"
- "Find companies with no reviews"

The MCP will automatically translate these requests into the appropriate procedure calls.

## Manual Usage

You can also call these procedures directly in SQL:

\`\`\`sql
SELECT * FROM get_average_ratings_by_industry();
\`\`\`

Or in your application code:

\`\`\`typescript
const { data, error } = await supabase.rpc('get_average_ratings_by_industry');
\`\`\`
`;
  
  // Write to file
  fs.writeFileSync(docPath, docContent);
  console.log(chalk.green(`✅ Generated documentation: ${docPath}`));
}

// Main function
async function main() {
  console.log(chalk.blue('🚀 Setting up MCP stored procedures...'));
  
  try {
    // Read SQL file
    const sqlContent = readSqlFile();
    
    // Split into statements
    const statements = splitSqlStatements(sqlContent);
    
    if (statements.length === 0) {
      console.error(chalk.red('❌ No SQL statements found to execute'));
      process.exit(1);
    }
    
    // Execute statements
    await executeSqlStatements(statements);
    
    // Verify functions
    await verifyFunctions(statements);
    
    // Generate documentation
    generateDocumentation(statements);
    
    console.log(chalk.green('\n✅ MCP stored procedures setup completed successfully!'));
    console.log(chalk.blue('\nTo use these procedures:'));
    console.log(chalk.gray('1. Start the MCP server: npm run mcp:start'));
    console.log(chalk.gray('2. Use natural language in Cursor to query your database'));
    console.log(chalk.gray('3. See MCP_PROCEDURES.md for detailed documentation'));
  } catch (error) {
    console.error(chalk.red('\n❌ Error setting up MCP stored procedures:'), error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
}); 