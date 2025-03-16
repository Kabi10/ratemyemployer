#!/usr/bin/env node

/**
 * AI Rule Compliance Verification Script
 * 
 * This script generates verification questions to check if the AI
 * is following the implementation rules defined in .cursorrules.
 */

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

// Verification question templates
const VERIFICATION_QUESTIONS = [
  {
    category: 'Search First',
    questions: [
      'Which search commands did you run before implementing this feature?',
      'What existing files did you find that are related to this feature?',
      'Did you find any similar functionality in the codebase? If so, where?',
      'What patterns did you identify in the existing code?'
    ]
  },
  {
    category: 'Documentation',
    questions: [
      'What gaps did you identify in the existing functionality?',
      'Why did you choose to create a new file instead of enhancing existing code?',
      'Why did you choose to enhance existing code instead of creating a new file?',
      'What implementation decision tree did you follow?'
    ]
  },
  {
    category: 'Pattern Recognition',
    questions: [
      'Which pattern from the Pattern Recognition Map did you follow?',
      'How does your implementation maintain consistency with existing code?',
      'Which existing component did you use as a reference for this implementation?',
      'How does your implementation follow the project\'s established patterns?'
    ]
  },
  {
    category: 'Approval Process',
    questions: [
      'Did you present multiple options before proceeding with implementation?',
      'Did you wait for explicit approval before implementing this feature?',
      'Did you document your decision-making process?',
      'Did you justify the creation of new files?'
    ]
  }
];

// Main function
function main() {
  console.log(`${COLORS.cyan}=== AI Rule Compliance Verification ===\n${COLORS.reset}`);
  
  // Generate random verification questions
  console.log(`${COLORS.green}=== Verification Questions ===\n${COLORS.reset}`);
  
  // Select one question from each category
  VERIFICATION_QUESTIONS.forEach(category => {
    const randomIndex = Math.floor(Math.random() * category.questions.length);
    const question = category.questions[randomIndex];
    
    console.log(`${COLORS.yellow}[${category.category}]${COLORS.reset} ${question}`);
  });
  
  console.log(`\n${COLORS.blue}Use these questions to verify the AI is following the implementation rules.${COLORS.reset}`);
  console.log(`${COLORS.blue}If the AI cannot answer these questions, it likely hasn't read or isn't following the rules.${COLORS.reset}`);
}

// Run the main function
main(); 