const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the file to check from command line arguments
const fileToCheck = process.argv[2];

if (!fileToCheck) {
  console.error('Please provide a file path to check');
  console.log('Usage: node check-ts.js src/components/SomeComponent.tsx');
  process.exit(1);
}

// Create a temporary tsconfig file
const tempTsConfig = {
  extends: './tsconfig.json',
  include: [fileToCheck]
};

const tempTsConfigPath = path.join(__dirname, 'temp-tsconfig.json');

try {
  // Write the temporary tsconfig
  fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2));
  console.log(`Created temporary TypeScript config for: ${fileToCheck}`);

  // Run TypeScript check
  console.log('Running TypeScript check...');
  const output = execSync('npx tsc --noEmit --project temp-tsconfig.json', { 
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  
  console.log('✅ No TypeScript errors found!');
} catch (error) {
  console.log('❌ TypeScript errors found:');
  console.log(error.stdout || error.message);
} finally {
  // Clean up the temporary file
  if (fs.existsSync(tempTsConfigPath)) {
    fs.unlinkSync(tempTsConfigPath);
    console.log('Cleaned up temporary TypeScript config');
  }
} 