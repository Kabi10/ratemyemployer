#!/usr/bin/env node

/**
 * Script to update repository URLs in project files
 * Usage: node scripts/update-repo-urls.js <your-github-username>
 */

const fs = require('fs');
const path = require('path');

const username = process.argv[2];

if (!username) {
  console.error('❌ Please provide your GitHub username as an argument');
  console.error('Usage: node scripts/update-repo-urls.js <your-github-username>');
  process.exit(1);
}

const repoName = 'ratemyemployer';
const baseUrl = `https://github.com/${username}/${repoName}`;

const filesToUpdate = [
  {
    path: 'package.json',
    patterns: [
      { from: /"url": "https:\/\/github\.com\/your-username\/ratemyemployer\.git"/, to: `"url": "${baseUrl}.git"` },
      { from: /"url": "https:\/\/github\.com\/your-username\/ratemyemployer\/issues"/, to: `"url": "${baseUrl}/issues"` },
      { from: /"url": "https:\/\/github\.com\/your-username\/ratemyemployer"/, to: `"url": "${baseUrl}"` }
    ]
  },
  {
    path: 'README.md',
    patterns: [
      { from: /https:\/\/github\.com\/your-username\/ratemyemployer/g, to: baseUrl },
      { from: /YOUR_USERNAME/g, to: username }
    ]
  },
  {
    path: 'CONTRIBUTING.md',
    patterns: [
      { from: /https:\/\/github\.com\/your-username\/ratemyemployer/g, to: baseUrl },
      { from: /YOUR_USERNAME/g, to: username }
    ]
  }
];

console.log(`🚀 Updating repository URLs to use: ${baseUrl}`);
console.log('');

let updatedFiles = 0;

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file.path}`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileUpdated = false;

    file.patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        fileUpdated = true;
      }
    });

    if (fileUpdated) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${file.path}`);
      updatedFiles++;
    } else {
      console.log(`ℹ️  No changes needed: ${file.path}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${file.path}:`, error.message);
  }
});

console.log('');
console.log(`🎉 Updated ${updatedFiles} files`);
console.log('');
console.log('📋 Next steps:');
console.log('1. Review the changes in the files above');
console.log('2. Create a .env.example file from your .env.local');
console.log('3. Make your repository public on GitHub');
console.log('4. Add repository topics on GitHub');
console.log('5. Share with your network!');
console.log('');
console.log('📖 For more guidance, see OPEN_SOURCE_GUIDE.md');