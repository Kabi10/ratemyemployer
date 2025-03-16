const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add the script
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts['check:pre-implementation'] = 'node scripts/check-pre-implementation.js';

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Added check:pre-implementation script to package.json'); 