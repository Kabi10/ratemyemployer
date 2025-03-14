const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const COMMON_TYPE_FILES = [
  'src/types/database.ts',
  'src/types/supabase.ts'
];

// Parse command line arguments
const args = process.argv.slice(2);
let filesToCheck = [];
let includeCommonTypes = true;
let verbose = false;

// Process arguments
args.forEach(arg => {
  if (arg === '--no-common-types') {
    includeCommonTypes = false;
  } else if (arg === '--verbose' || arg === '-v') {
    verbose = true;
  } else if (arg.startsWith('--component=')) {
    // Check a component and related files
    const componentName = arg.split('=')[1];
    filesToCheck.push(
      `src/components/${componentName}.tsx`,
      `src/components/${componentName}/*.tsx`
    );
  } else {
    filesToCheck.push(arg);
  }
});

if (filesToCheck.length === 0) {
  console.error('Please provide at least one file path to check');
  console.log('Usage: node ts-check.js [options] <file-paths>');
  console.log('');
  console.log('Options:');
  console.log('  --no-common-types       Don\'t include common type files');
  console.log('  --component=<name>      Check a component and its related files');
  console.log('  --verbose, -v           Show more detailed output');
  console.log('');
  console.log('Examples:');
  console.log('  node ts-check.js src/components/ReviewCard.tsx');
  console.log('  node ts-check.js --component=ReviewCard');
  console.log('  node ts-check.js src/components/ReviewCard.tsx src/hooks/useReviews.ts');
  process.exit(1);
}

// Add common type files if needed
if (includeCommonTypes) {
  filesToCheck = [...COMMON_TYPE_FILES, ...filesToCheck];
}

// Create a temporary tsconfig file
const tempTsConfig = {
  extends: './tsconfig.json',
  include: filesToCheck
};

const tempTsConfigPath = path.join(__dirname, 'temp-tsconfig.json');

try {
  // Write the temporary tsconfig
  fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2));
  if (verbose) {
    console.log(`Created temporary TypeScript config for:`);
    filesToCheck.forEach(file => console.log(`- ${file}`));
  } else {
    console.log(`Checking ${filesToCheck.length} files...`);
  }

  // Run TypeScript check
  console.log('Running TypeScript check...');
  const output = execSync('npx tsc --noEmit --project temp-tsconfig.json', { 
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  
  console.log('✅ No TypeScript errors found!');
} catch (error) {
  console.log('❌ TypeScript errors found:');
  
  // Format the error output to be more readable
  const errorOutput = error.stdout || error.message;
  const formattedErrors = formatErrorOutput(errorOutput);
  console.log(formattedErrors);
  
  // Suggest fixes based on common patterns
  suggestFixes(errorOutput);
} finally {
  // Clean up the temporary file
  if (fs.existsSync(tempTsConfigPath)) {
    fs.unlinkSync(tempTsConfigPath);
    if (verbose) {
      console.log('Cleaned up temporary TypeScript config');
    }
  }
}

// Helper function to format error output
function formatErrorOutput(output) {
  // Split by lines and filter out noise
  const lines = output.split('\n').filter(line => 
    !line.includes('node_modules') && 
    !line.includes('error TS18003:') &&
    line.trim() !== ''
  );
  
  // Group errors by file
  const errorsByFile = {};
  let currentFile = null;
  
  lines.forEach(line => {
    if (line.includes('.tsx(') || line.includes('.ts(')) {
      // This is a file line
      const fileMatch = line.match(/(.+?)\(\d+,\d+\)/);
      if (fileMatch) {
        currentFile = fileMatch[1];
        if (!errorsByFile[currentFile]) {
          errorsByFile[currentFile] = [];
        }
      }
    } else if (currentFile && line.trim() !== '') {
      // This is an error message line
      errorsByFile[currentFile].push(line);
    }
  });
  
  // Format the output
  let result = '';
  Object.keys(errorsByFile).forEach(file => {
    result += `\n${file}:\n`;
    errorsByFile[file].forEach(error => {
      result += `  - ${error.trim()}\n`;
    });
  });
  
  return result;
}

// Helper function to suggest fixes based on common patterns
function suggestFixes(errorOutput) {
  const commonErrors = [
    {
      pattern: /Property '(\w+)' does not exist on type/,
      suggestion: (matches) => `Consider adding the '${matches[1]}' property to the type definition or using optional chaining: obj?.${matches[1]}`
    },
    {
      pattern: /Type '(.+)' is not assignable to type '(.+)'/,
      suggestion: (matches) => `Type mismatch: '${matches[1]}' is not compatible with '${matches[2]}'. Consider using type assertion or updating the type definition.`
    },
    {
      pattern: /Object literal may only specify known properties, and '(\w+)' does not exist/,
      suggestion: (matches) => `The property '${matches[1]}' is not defined in the type. Add it to the interface definition.`
    }
  ];
  
  console.log('\n📋 Suggested fixes:');
  
  let suggestionsFound = false;
  
  commonErrors.forEach(({ pattern, suggestion }) => {
    const matches = errorOutput.match(pattern);
    if (matches) {
      console.log(`- ${suggestion(matches)}`);
      suggestionsFound = true;
    }
  });
  
  if (!suggestionsFound) {
    console.log('- No automatic suggestions available for these errors.');
  }
  
  console.log('\nTip: Check the Error-finder.md document for more detailed fixing strategies.');
} 