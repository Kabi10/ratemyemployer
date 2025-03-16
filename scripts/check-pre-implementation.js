#!/usr/bin/env node

/**
 * Pre-Implementation Checklist Compliance Checker
 * 
 * This script scans the codebase for recently added files and checks
 * if they have corresponding pre-implementation documentation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DAYS_TO_CHECK = 7; // Check files added in the last 7 days
const IMPLEMENTATION_DIR = path.join(__dirname, '..', 'implementations');
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'pre-implementation-checklist.md');

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

// Get recently added files
function getRecentlyAddedFiles() {
  try {
    // Get files added in the most recent commit
    const command = `git diff-tree --no-commit-id --name-only --diff-filter=A -r HEAD`;
    const result = execSync(command).toString().trim();
    
    if (!result) {
      console.log(`${COLORS.yellow}No new files found in the most recent commit.${COLORS.reset}`);
      return [];
    }
    
    console.log(`${COLORS.blue}Files added in the most recent commit:${COLORS.reset}`);
    console.log(result);
    
    return result.split('\n').filter(file => 
      // Exclude certain directories and file types
      !file.startsWith('node_modules/') && 
      !file.startsWith('.git/') &&
      !file.startsWith('dist/') &&
      !file.endsWith('.md') &&
      fs.existsSync(file)
    );
  } catch (error) {
    console.error(`${COLORS.red}Error getting recently added files:${COLORS.reset}`, error.message);
    return [];
  }
}

// Check if pre-implementation documentation exists for a file
function hasPreImplementationDoc(file) {
  const fileBaseName = path.basename(file, path.extname(file));
  const possibleDocs = [
    path.join(IMPLEMENTATION_DIR, `${fileBaseName}-pre-implementation.md`),
    path.join(IMPLEMENTATION_DIR, `${fileBaseName}.md`),
    path.join(IMPLEMENTATION_DIR, `${path.dirname(file).replace(/\//g, '-')}-${fileBaseName}.md`),
  ];
  
  return possibleDocs.some(docPath => fs.existsSync(docPath));
}

// Main function
function main() {
  console.log(`${COLORS.cyan}=== Pre-Implementation Checklist Compliance Checker ===${COLORS.reset}`);
  console.log(`${COLORS.blue}Checking files added in the last ${DAYS_TO_CHECK} days...${COLORS.reset}\n`);
  
  // Create implementations directory if it doesn't exist
  if (!fs.existsSync(IMPLEMENTATION_DIR)) {
    fs.mkdirSync(IMPLEMENTATION_DIR, { recursive: true });
    console.log(`${COLORS.green}Created implementations directory at ${IMPLEMENTATION_DIR}${COLORS.reset}`);
  }
  
  // Get recently added files
  const recentFiles = getRecentlyAddedFiles();
  
  if (recentFiles.length === 0) {
    console.log(`${COLORS.green}No new files found in the last ${DAYS_TO_CHECK} days.${COLORS.reset}`);
    return;
  }
  
  console.log(`${COLORS.blue}Found ${recentFiles.length} recently added files.${COLORS.reset}\n`);
  
  // Check each file for pre-implementation documentation
  let compliantFiles = 0;
  let nonCompliantFiles = [];
  
  recentFiles.forEach(file => {
    const hasDoc = hasPreImplementationDoc(file);
    
    if (hasDoc) {
      compliantFiles++;
      console.log(`${COLORS.green}✓ ${file} - Has pre-implementation documentation${COLORS.reset}`);
    } else {
      nonCompliantFiles.push(file);
      console.log(`${COLORS.red}✗ ${file} - Missing pre-implementation documentation${COLORS.reset}`);
    }
  });
  
  // Summary
  console.log(`\n${COLORS.cyan}=== Summary ===${COLORS.reset}`);
  console.log(`${COLORS.blue}Total files checked: ${recentFiles.length}${COLORS.reset}`);
  console.log(`${COLORS.green}Compliant files: ${compliantFiles}${COLORS.reset}`);
  console.log(`${COLORS.red}Non-compliant files: ${nonCompliantFiles.length}${COLORS.reset}`);
  
  // Compliance rate
  const complianceRate = (compliantFiles / recentFiles.length) * 100;
  console.log(`${COLORS.yellow}Compliance rate: ${complianceRate.toFixed(2)}%${COLORS.reset}`);
  
  // Recommendations for non-compliant files
  if (nonCompliantFiles.length > 0) {
    console.log(`\n${COLORS.yellow}=== Recommendations ===${COLORS.reset}`);
    console.log(`${COLORS.yellow}The following files need pre-implementation documentation:${COLORS.reset}`);
    
    nonCompliantFiles.forEach(file => {
      const fileBaseName = path.basename(file, path.extname(file));
      const recommendedDocPath = path.join(IMPLEMENTATION_DIR, `${fileBaseName}-pre-implementation.md`);
      
      console.log(`${COLORS.yellow}1. Create ${recommendedDocPath}${COLORS.reset}`);
      console.log(`${COLORS.yellow}   Use the template at ${TEMPLATE_PATH}${COLORS.reset}`);
    });
  }
}

// Run the main function
main(); 