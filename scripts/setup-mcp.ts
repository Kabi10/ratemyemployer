import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { execSync } from 'child_process';

/**
 * MCP Setup Script for RateMyEmployer
 * 
 * This script sets up the Model Context Protocol (MCP) for Supabase integration,
 * allowing AI tools like Cursor to interact with your database using natural language.
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

// Generate MCP configuration
function generateMcpConfig(supabaseDir: string) {
  console.log(chalk.blue('📝 Generating MCP configuration...'));
  
  const configPath = path.resolve(supabaseDir, 'config.json');
  const config = {
    name: 'RateMyEmployer Supabase',
    description: 'Supabase database for the RateMyEmployer application',
    version: '1.0.0',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    schema: './schema.json'
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green(`✅ Created MCP config: ${configPath}`));
}

// Generate schema file
async function generateSchema(supabaseDir: string) {
  console.log(chalk.blue('🔍 Generating database schema...'));
  
  try {
    // Get table definitions
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'like', 'pg_%')
      .not('table_name', 'like', '_prisma_%');
    
    if (tablesError) {
      console.error(chalk.red('❌ Error fetching tables:'), tablesError);
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.error(chalk.red('❌ No tables found in the database'));
      return;
    }
    
    console.log(chalk.green(`✅ Found ${tables.length} tables`));
    
    // Create schema object
    const schema: Record<string, any> = {};
    
    // Process each table
    for (const table of tables) {
      const tableName = table.table_name;
      
      // Get columns for this table
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      if (columnsError) {
        console.error(chalk.red(`❌ Error fetching columns for table ${tableName}:`), columnsError);
        continue;
      }
      
      if (!columns || columns.length === 0) {
        console.warn(chalk.yellow(`⚠️ No columns found for table ${tableName}`));
        continue;
      }
      
      // Create table schema
      schema[tableName] = {
        name: tableName,
        description: `${tableName} table in the RateMyEmployer database`,
        fields: {}
      };
      
      // Add columns to table schema
      columns.forEach(column => {
        schema[tableName].fields[column.column_name] = {
          type: mapDataType(column.data_type),
          nullable: column.is_nullable === 'YES',
          description: `${column.column_name} field in the ${tableName} table`
        };
        
        if (column.column_default) {
          schema[tableName].fields[column.column_name].default = column.column_default;
        }
      });
      
      console.log(chalk.green(`✅ Processed schema for table: ${tableName} (${columns.length} columns)`));
    }
    
    // Write schema to file
    const schemaPath = path.resolve(supabaseDir, 'schema.json');
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
    console.log(chalk.green(`✅ Created schema file: ${schemaPath}`));
    
    return schema;
  } catch (error) {
    console.error(chalk.red('❌ Error generating schema:'), error);
  }
}

// Map Postgres data types to simpler types for MCP
function mapDataType(pgType: string): string {
  const typeMap: Record<string, string> = {
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'character varying': 'string',
    'character': 'string',
    'text': 'string',
    'boolean': 'boolean',
    'json': 'object',
    'jsonb': 'object',
    'timestamp with time zone': 'datetime',
    'timestamp without time zone': 'datetime',
    'date': 'date',
    'time': 'time',
    'uuid': 'string',
    'bytea': 'binary'
  };
  
  return typeMap[pgType] || 'string';
}

// Install dependencies if needed
function installDependencies() {
  console.log(chalk.blue('📦 Checking for required dependencies...'));
  
  try {
    // Check if cursor CLI is installed
    try {
      execSync('cursor --version', { stdio: 'ignore' });
      console.log(chalk.green('✅ Cursor CLI is already installed'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Cursor CLI not found, installing...'));
      execSync('npm install -g @cursor/cli', { stdio: 'inherit' });
      console.log(chalk.green('✅ Cursor CLI installed successfully'));
    }
    
    // Check for local dependencies
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const requiredDeps = ['chalk', 'dotenv'];
    const missingDeps: string[] = [];
    
    requiredDeps.forEach(dep => {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    });
    
    if (missingDeps.length > 0) {
      console.log(chalk.yellow(`⚠️ Installing missing dependencies: ${missingDeps.join(', ')}...`));
      execSync(`npm install --save-dev ${missingDeps.join(' ')}`, { stdio: 'inherit' });
      console.log(chalk.green('✅ Dependencies installed successfully'));
    } else {
      console.log(chalk.green('✅ All required dependencies are installed'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error installing dependencies:'), error);
  }
}

// Update package.json with MCP scripts
function updatePackageJson() {
  console.log(chalk.blue('📝 Updating package.json with MCP scripts...'));
  
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add MCP scripts
    packageJson.scripts = packageJson.scripts || {};
    
    const mcpScripts = {
      'mcp:setup': 'tsx scripts/setup-mcp.ts',
      'mcp:start': 'cursor mcp start supabase',
      'mcp:sample-queries': 'tsx scripts/mcp-sample-queries.ts',
      'mcp:setup-procedures': 'tsx scripts/setup-stored-procedures.ts'
    };
    
    let scriptsAdded = 0;
    
    Object.entries(mcpScripts).forEach(([key, value]) => {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        scriptsAdded++;
      }
    });
    
    if (scriptsAdded > 0) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(chalk.green(`✅ Added ${scriptsAdded} MCP scripts to package.json`));
    } else {
      console.log(chalk.yellow('⚠️ All MCP scripts already exist in package.json'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error updating package.json:'), error);
  }
}

// Copy SQL procedures file
function copySqlProcedures() {
  console.log(chalk.blue('📄 Setting up SQL stored procedures...'));
  
  const sourcePath = path.resolve(process.cwd(), 'scripts/mcp-stored-procedures.sql');
  const targetDir = path.resolve(process.cwd(), '.mcp/supabase');
  const targetPath = path.resolve(targetDir, 'procedures.sql');
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(chalk.green(`✅ Copied SQL procedures to: ${targetPath}`));
  } else {
    console.warn(chalk.yellow(`⚠️ SQL procedures file not found: ${sourcePath}`));
    
    // Create a basic template
    const template = `-- RateMyEmployer Stored Procedures for MCP
-- These procedures can be used with the Model Context Protocol to enhance database queries

-- Get average ratings by industry
CREATE OR REPLACE FUNCTION get_average_ratings_by_industry()
RETURNS TABLE (
  industry TEXT,
  avg_industry_rating NUMERIC,
  company_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.industry,
    AVG(c.average_rating) as avg_industry_rating,
    COUNT(*) as company_count
  FROM 
    companies c
  WHERE 
    c.industry IS NOT NULL AND
    c.average_rating IS NOT NULL
  GROUP BY 
    c.industry
  ORDER BY 
    avg_industry_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Add more procedures as needed
`;
    
    fs.writeFileSync(targetPath, template);
    console.log(chalk.green(`✅ Created template SQL procedures file: ${targetPath}`));
  }
}

// Main function
async function main() {
  console.log(chalk.blue('🚀 Setting up MCP for RateMyEmployer...'));
  
  try {
    // Create directories
    const { mcpDir, supabaseDir } = createDirectories();
    
    // Install dependencies
    installDependencies();
    
    // Generate MCP configuration
    generateMcpConfig(supabaseDir);
    
    // Generate schema
    await generateSchema(supabaseDir);
    
    // Copy SQL procedures
    copySqlProcedures();
    
    // Update package.json
    updatePackageJson();
    
    console.log(chalk.green('\n✅ MCP setup completed successfully!'));
    console.log(chalk.blue('\nTo start using MCP:'));
    console.log(chalk.gray('1. Run: npm run mcp:start'));
    console.log(chalk.gray('2. Open Cursor and use natural language to query your database'));
    console.log(chalk.gray('3. Try sample queries with: npm run mcp:sample-queries'));
    console.log(chalk.blue('\nFor more information, see the MCP_README.md file.'));
  } catch (error) {
    console.error(chalk.red('\n❌ Error setting up MCP:'), error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
}); 