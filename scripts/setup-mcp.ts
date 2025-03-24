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
    // Define the schema structure
    const schema: {
      tables: {
        [key: string]: {
          description: string;
          fields: {
            [key: string]: {
              description: string;
              type: string;
              nullable: boolean;
            };
          };
        };
      };
    } = {
      tables: {}
    };

    // Define known tables and their fields
    const tableDefinitions = {
      companies: {
        description: 'Companies that can be reviewed on the platform',
        fields: {
          id: { type: 'number', description: 'Unique identifier for the company', nullable: false },
          name: { type: 'string', description: 'Name of the company', nullable: false },
          industry: { type: 'string', description: 'Industry sector the company operates in', nullable: true },
          location: { type: 'string', description: 'Primary location of the company', nullable: true },
          website: { type: 'string', description: 'Official website URL', nullable: true },
          size: { type: 'string', description: 'Company size category', nullable: true },
          average_rating: { type: 'number', description: 'Average rating from all reviews', nullable: true },
          total_reviews: { type: 'number', description: 'Total number of reviews', nullable: true },
          created_at: { type: 'string', description: 'When the company was added', nullable: true },
          updated_at: { type: 'string', description: 'When the company was last updated', nullable: true }
        }
      },
      reviews: {
        description: 'User reviews of companies',
        fields: {
          id: { type: 'number', description: 'Unique identifier for the review', nullable: false },
          company_id: { type: 'number', description: 'Reference to the reviewed company', nullable: false },
          user_id: { type: 'string', description: 'User who wrote the review', nullable: false },
          title: { type: 'string', description: 'Review title', nullable: false },
          rating: { type: 'number', description: 'Rating from 1-5', nullable: false },
          pros: { type: 'string', description: 'Positive aspects mentioned', nullable: true },
          cons: { type: 'string', description: 'Negative aspects mentioned', nullable: true },
          status: { type: 'string', description: 'Review status (pending/approved/rejected)', nullable: false },
          created_at: { type: 'string', description: 'When the review was created', nullable: false }
        }
      },
      users: {
        description: 'User accounts',
        fields: {
          id: { type: 'string', description: 'Unique identifier for the user', nullable: false },
          email: { type: 'string', description: 'User email address', nullable: false },
          created_at: { type: 'string', description: 'When the user account was created', nullable: false }
        }
      },
      moderation_history: {
        description: 'History of moderation actions',
        fields: {
          id: { type: 'number', description: 'Unique identifier for the moderation action', nullable: false },
          entity_type: { type: 'string', description: 'Type of entity being moderated (review/company)', nullable: false },
          entity_id: { type: 'number', description: 'ID of the moderated entity', nullable: false },
          action: { type: 'string', description: 'Type of moderation action taken', nullable: false },
          moderator_id: { type: 'string', description: 'ID of the moderator', nullable: false },
          created_at: { type: 'string', description: 'When the action was taken', nullable: false }
        }
      },
      company_news: {
        description: 'News articles related to companies',
        fields: {
          id: { type: 'number', description: 'Unique identifier for the news article', nullable: false },
          company_id: { type: 'number', description: 'Reference to the company', nullable: false },
          title: { type: 'string', description: 'Article title', nullable: false },
          url: { type: 'string', description: 'Link to the article', nullable: false },
          source: { type: 'string', description: 'News source name', nullable: false },
          published_at: { type: 'string', description: 'When the article was published', nullable: false },
          created_at: { type: 'string', description: 'When the article was added', nullable: false }
        }
      }
    };

    // Add tables to schema
    Object.entries(tableDefinitions).forEach(([tableName, definition]) => {
      schema.tables[tableName] = {
        description: definition.description,
        fields: definition.fields
      };
    });

    // Write schema to file
    const schemaPath = path.join(supabaseDir, 'schema.json');
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
    console.log(chalk.green(`✅ Generated schema file: ${schemaPath}`));

    return schema;
  } catch (error) {
    console.error(chalk.red('❌ Error generating schema:'), error);
    throw error;
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