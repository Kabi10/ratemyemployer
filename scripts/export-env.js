#!/usr/bin/env node

/**
 * This script helps export environment variables to Vercel
 * Usage: node scripts/export-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = envContent
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .map(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    return { key: key.trim(), value: value.trim() };
  });

// Export to Vercel
console.log('Exporting environment variables to Vercel...');
envVars.forEach(({ key, value }) => {
  try {
    execSync(`vercel env add ${key} production`, {
      stdio: ['pipe', process.stdout, process.stderr],
      input: value,
    });
    console.log(`✓ Added ${key}`);
  } catch (error) {
    console.error(`✗ Failed to add ${key}: ${error.message}`);
  }
});

console.log('\nDone! Please verify your environment variables in the Vercel dashboard.');
console.log('https://vercel.com/dashboard/project/settings/environment-variables'); 