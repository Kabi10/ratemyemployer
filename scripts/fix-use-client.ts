import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function findFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...(await findFiles(path)));
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

async function fixUseClientDirective(filePath: string): Promise<boolean> {
  const content = await readFile(filePath, 'utf-8');
  
  // Check if file has 'use client' directive
  const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
  if (!hasUseClient) return false;

  // Split into lines
  let lines = content.split('\n');

  // Remove all 'use client' directives and empty lines at the start
  lines = lines.filter((line, index) => {
    const trimmed = line.trim();
    if (index === 0 && (trimmed === "'use client'" || trimmed === "'use client';")) {
      return true; // Keep the first one if it's at the very top
    }
    return trimmed !== "'use client'" && trimmed !== "'use client';" && 
           trimmed !== '"use client"' && trimmed !== '"use client";';
  });

  // If the first line isn't 'use client', add it
  if (lines[0]?.trim() !== "'use client'" && lines[0]?.trim() !== "'use client';") {
    lines.unshift("'use client';", "");
  }

  // Write back to file
  const newContent = lines.join('\n');
  if (newContent !== content) {
    await writeFile(filePath, newContent);
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

async function main() {
  try {
    console.log('🔍 Scanning for files...');
    const files = await findFiles(join(process.cwd(), 'src'));
    console.log(`Found ${files.length} files to check.`);

    let fixedCount = 0;
    for (const file of files) {
      if (await fixUseClientDirective(file)) {
        fixedCount++;
      }
    }

    console.log(`\n✨ Done! Fixed ${fixedCount} files.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 