#!/usr/bin/env node

/**
 * AI Session Initialization Script
 * 
 * This script loads the .cursorrules file and prepares a formatted message
 * to initialize the AI assistant at the start of each session.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Main function
function main() {
  console.log(`${COLORS.cyan}=== AI Session Initialization ===\n${COLORS.reset}`);
  
  // Get the project root directory
  const projectRoot = path.resolve(__dirname, '..');
  
  // Path to .cursorrules file
  const rulesPath = path.join(projectRoot, '.cursorrules');
  
  // Check if .cursorrules exists
  if (!fs.existsSync(rulesPath)) {
    console.error(`${COLORS.red}Error: .cursorrules file not found at ${rulesPath}${COLORS.reset}`);
    process.exit(1);
  }
  
  // Read the .cursorrules file
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  // Extract the mandatory pre-implementation checklist
  const checklistMatch = rulesContent.match(/## ⚠️ MANDATORY PRE-IMPLEMENTATION CHECKLIST ⚠️[\s\S]+?(?=##)/);
  const checklist = checklistMatch ? checklistMatch[0].trim() : 'Checklist not found';
  
  // Create the initialization message
  const initMessage = `
/init-session

I've read the .cursorrules file and will follow all implementation rules for this session.

Key rules I will follow:

1. MANDATORY PRE-IMPLEMENTATION CHECKLIST:
   - Search first using grep_search/file_search
   - Document findings before implementing
   - Get explicit approval before proceeding

2. PATTERN RECOGNITION:
   - Follow established project patterns
   - Maintain consistency with existing code
   - Use the appropriate pattern for each feature type

3. IMPLEMENTATION APPROACH:
   - Enhance existing code when possible
   - Create new files only when justified
   - Document decision-making process

I will not skip any steps in the pre-implementation checklist.
`;
  
  // Output the initialization message
  console.log(`${COLORS.green}=== Initialization Message ===\n${COLORS.reset}`);
  console.log(initMessage);
  
  // Copy to clipboard if possible
  try {
    // For Windows
    if (process.platform === 'win32') {
      execSync(`echo "${initMessage.replace(/"/g, '\\"')}" | clip`);
    } 
    // For macOS
    else if (process.platform === 'darwin') {
      execSync(`echo "${initMessage.replace(/"/g, '\\"')}" | pbcopy`);
    } 
    // For Linux with xclip
    else if (process.platform === 'linux') {
      execSync(`echo "${initMessage.replace(/"/g, '\\"')}" | xclip -selection clipboard`);
    }
    console.log(`${COLORS.green}Initialization message copied to clipboard!${COLORS.reset}`);
  } catch (error) {
    console.log(`${COLORS.yellow}Could not copy to clipboard: ${error.message}${COLORS.reset}`);
  }
  
  console.log(`\n${COLORS.blue}Paste this message at the start of your AI session.${COLORS.reset}`);
}

// Run the main function
main(); 