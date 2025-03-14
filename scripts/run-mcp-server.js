#!/usr/bin/env node

/**
 * MCP Server Runner
 * 
 * This script helps users run the Model Context Protocol (MCP) server
 * for the RateMyEmployer project. It provides a simple interface to
 * start the server and check its status.
 */

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if MCP configuration exists
function checkMcpConfig() {
  const configPath = path.join(process.cwd(), '.mcp', 'supabase', 'config.json');
  const schemaPath = path.join(process.cwd(), '.mcp', 'supabase', 'schema.json');
  
  if (!fs.existsSync(configPath) || !fs.existsSync(schemaPath)) {
    console.log(`${colors.fg.yellow}⚠️  MCP configuration not found!${colors.reset}`);
    console.log(`${colors.fg.cyan}ℹ️  Running setup script first...${colors.reset}\n`);
    return false;
  }
  
  return true;
}

// Run the MCP setup script
function runSetup() {
  console.log(`${colors.fg.cyan}🔧 Setting up MCP server...${colors.reset}\n`);
  
  const setupProcess = spawn('npm', ['run', 'mcp:setup'], { 
    stdio: 'inherit',
    shell: true
  });
  
  return new Promise((resolve, reject) => {
    setupProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${colors.fg.green}✅ MCP setup completed successfully!${colors.reset}\n`);
        resolve(true);
      } else {
        console.log(`\n${colors.fg.red}❌ MCP setup failed with code ${code}${colors.reset}\n`);
        reject(new Error(`Setup failed with code ${code}`));
      }
    });
  });
}

// Start the MCP server
function startServer() {
  console.log(`${colors.fg.green}🚀 Starting MCP server...${colors.reset}\n`);
  console.log(`${colors.fg.yellow}ℹ️  Press Ctrl+C to stop the server${colors.reset}\n`);
  
  const serverProcess = spawn('npm', ['run', 'mcp:start'], { 
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('close', (code) => {
    if (code === 0 || code === null) {
      console.log(`\n${colors.fg.green}✅ MCP server stopped gracefully${colors.reset}\n`);
    } else {
      console.log(`\n${colors.fg.red}❌ MCP server exited with code ${code}${colors.reset}\n`);
    }
    process.exit(0);
  });
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log(`\n${colors.fg.yellow}🛑 Stopping MCP server...${colors.reset}`);
    serverProcess.kill('SIGINT');
  });
}

// Display welcome message
function displayWelcome() {
  console.log(`\n${colors.fg.cyan}${colors.bright}==================================================${colors.reset}`);
  console.log(`${colors.fg.cyan}${colors.bright}           RateMyEmployer MCP Server Runner           ${colors.reset}`);
  console.log(`${colors.fg.cyan}${colors.bright}==================================================${colors.reset}\n`);
  
  console.log(`${colors.fg.white}This script helps you run the Model Context Protocol (MCP) server${colors.reset}`);
  console.log(`${colors.fg.white}for the RateMyEmployer project. The MCP server enables natural${colors.reset}`);
  console.log(`${colors.fg.white}language interaction with your Supabase database.${colors.reset}\n`);
}

// Display help information
function displayHelp() {
  console.log(`${colors.fg.yellow}${colors.bright}Available Commands:${colors.reset}`);
  console.log(`${colors.fg.green}start${colors.reset} - Start the MCP server`);
  console.log(`${colors.fg.blue}setup${colors.reset} - Run the MCP setup script`);
  console.log(`${colors.fg.magenta}help${colors.reset}  - Display this help information`);
  console.log(`${colors.fg.red}exit${colors.reset}  - Exit the script\n`);
}

// Main function
async function main() {
  displayWelcome();
  
  // Check if MCP is configured
  const isConfigured = checkMcpConfig();
  
  if (!isConfigured) {
    try {
      await runSetup();
    } catch (error) {
      console.log(`${colors.fg.red}Failed to set up MCP: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
  
  displayHelp();
  
  // Command prompt
  function promptUser() {
    rl.question(`${colors.fg.cyan}${colors.bright}mcp>${colors.reset} `, async (answer) => {
      const command = answer.trim().toLowerCase();
      
      switch (command) {
        case 'start':
          startServer();
          break;
        
        case 'setup':
          try {
            await runSetup();
            promptUser();
          } catch (error) {
            console.log(`${colors.fg.red}Failed to set up MCP: ${error.message}${colors.reset}`);
            promptUser();
          }
          break;
        
        case 'help':
          displayHelp();
          promptUser();
          break;
        
        case 'exit':
          console.log(`${colors.fg.yellow}👋 Goodbye!${colors.reset}`);
          rl.close();
          process.exit(0);
          break;
        
        default:
          console.log(`${colors.fg.red}Unknown command: ${command}${colors.reset}`);
          displayHelp();
          promptUser();
          break;
      }
    });
  }
  
  promptUser();
}

// Run the main function
main().catch(error => {
  console.error(`${colors.fg.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 