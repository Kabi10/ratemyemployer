#!/usr/bin/env node

/**
 * Documentation Helper
 * 
 * This script helps users navigate the RateMyEmployer documentation.
 * It provides a simple CLI interface to open different documentation files.
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

// Documentation files
const docs = [
  { name: 'MCP Documentation', path: 'MCP_DOCUMENTATION.md', description: 'Comprehensive documentation for the Model Context Protocol integration' },
  { name: 'README', path: 'README.md', description: 'Main project documentation' },
  { name: 'Contributing Guide', path: 'CONTRIBUTING.md', description: 'Guidelines for contributing to the project' },
  { name: 'Security Policy', path: 'SECURITY.md', description: 'Security policy and guidelines' },
  { name: 'Code of Conduct', path: 'CODE_OF_CONDUCT.md', description: 'Code of conduct for project contributors' },
  { name: 'Changelog', path: 'CHANGELOG.md', description: 'Project changelog' },
];

// Open a documentation file
function openDoc(docPath) {
  console.log(`${colors.fg.cyan}📄 Opening ${docPath}...${colors.reset}\n`);
  
  let command;
  let args;
  
  // Determine the command based on the platform
  if (process.platform === 'win32') {
    command = 'start';
    args = ['', docPath];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = [docPath];
  } else {
    command = 'xdg-open';
    args = [docPath];
  }
  
  const openProcess = spawn(command, args, { 
    stdio: 'inherit',
    shell: true
  });
  
  openProcess.on('error', (error) => {
    console.error(`${colors.fg.red}❌ Error opening file: ${error.message}${colors.reset}\n`);
  });
  
  return new Promise((resolve) => {
    openProcess.on('close', (code) => {
      if (code === 0 || code === null) {
        console.log(`${colors.fg.green}✅ File opened successfully${colors.reset}\n`);
      } else {
        console.log(`${colors.fg.red}❌ Failed to open file (exit code: ${code})${colors.reset}\n`);
      }
      resolve();
    });
  });
}

// Display welcome message
function displayWelcome() {
  console.log(`\n${colors.fg.cyan}${colors.bright}==================================================${colors.reset}`);
  console.log(`${colors.fg.cyan}${colors.bright}           RateMyEmployer Documentation Helper           ${colors.reset}`);
  console.log(`${colors.fg.cyan}${colors.bright}==================================================${colors.reset}\n`);
  
  console.log(`${colors.fg.white}This script helps you navigate the RateMyEmployer documentation.${colors.reset}`);
  console.log(`${colors.fg.white}Choose a documentation file to open from the list below.${colors.reset}\n`);
}

// Display available documentation
function displayDocs() {
  console.log(`${colors.fg.yellow}${colors.bright}Available Documentation:${colors.reset}\n`);
  
  docs.forEach((doc, index) => {
    console.log(`${colors.fg.green}${index + 1}${colors.reset}. ${colors.fg.white}${colors.bright}${doc.name}${colors.reset}`);
    console.log(`   ${colors.fg.dim}${doc.description}${colors.reset}`);
    console.log(`   ${colors.fg.blue}Path: ${doc.path}${colors.reset}\n`);
  });
}

// Display help information
function displayHelp() {
  console.log(`${colors.fg.yellow}${colors.bright}Available Commands:${colors.reset}`);
  console.log(`${colors.fg.green}[1-${docs.length}]${colors.reset} - Open the corresponding documentation file`);
  console.log(`${colors.fg.blue}list${colors.reset}  - List available documentation files`);
  console.log(`${colors.fg.magenta}help${colors.reset}  - Display this help information`);
  console.log(`${colors.fg.red}exit${colors.reset}  - Exit the script\n`);
}

// Main function
async function main() {
  displayWelcome();
  displayDocs();
  displayHelp();
  
  // Command prompt
  function promptUser() {
    rl.question(`${colors.fg.cyan}${colors.bright}docs>${colors.reset} `, async (answer) => {
      const command = answer.trim().toLowerCase();
      
      if (command === 'exit') {
        console.log(`${colors.fg.yellow}👋 Goodbye!${colors.reset}`);
        rl.close();
        process.exit(0);
      } else if (command === 'help') {
        displayHelp();
        promptUser();
      } else if (command === 'list') {
        displayDocs();
        promptUser();
      } else {
        // Check if the command is a number
        const index = parseInt(command, 10);
        if (!isNaN(index) && index >= 1 && index <= docs.length) {
          const doc = docs[index - 1];
          await openDoc(doc.path);
          promptUser();
        } else {
          console.log(`${colors.fg.red}Unknown command: ${command}${colors.reset}`);
          displayHelp();
          promptUser();
        }
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