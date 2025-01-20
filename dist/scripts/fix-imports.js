import fs from 'fs';
import { glob } from 'glob';
// Define import groups in order of priority
const importGroups = [
    // External packages
    '^react$',
    '^next',
    '^@supabase',
    '^@firebase',
    '^@radix-ui',
    '^@heroicons',
    '^@hookform',
    '^@testing-library',
    '^[a-zA-Z]', // Other external packages
    // Internal absolute imports
    '^@/lib/',
    '^@/contexts/',
    '^@/hooks/',
    '^@/components/',
    '^@/utils/',
    '^@/types/',
    // Relative imports
    '^\\./',
    '^\\.\\./'
];
function sortImports(fileContent) {
    // Extract all import statements
    const importRegex = /^import.*?['"]\s*;?\s*$/gm;
    const imports = fileContent.match(importRegex) || [];
    // Remove imports from original content
    let newContent = fileContent.replace(importRegex, '');
    // Sort imports based on groups
    const sortedImports = imports.sort((a, b) => {
        const getGroupIndex = (imp) => {
            const from = imp.match(/from\s+['"]([^'"]+)['"]/)?.[1] || '';
            return importGroups.findIndex(group => new RegExp(group).test(from));
        };
        const indexA = getGroupIndex(a);
        const indexB = getGroupIndex(b);
        if (indexA === indexB)
            return a.localeCompare(b);
        return indexA - indexB;
    });
    // Add newlines between different groups
    const groupedImports = sortedImports.reduce((acc, imp, i) => {
        const currentGroup = getGroupIndex(imp);
        const prevGroup = i > 0 ? getGroupIndex(sortedImports[i - 1]) : -1;
        if (i > 0 && currentGroup !== prevGroup) {
            acc.push('');
        }
        acc.push(imp);
        return acc;
    }, []);
    // Add sorted imports back to the content
    return groupedImports.join('\n') + '\n\n' + newContent.trim();
}
function getGroupIndex(imp) {
    const from = imp.match(/from\s+['"]([^'"]+)['"]/)?.[1] || '';
    return importGroups.findIndex(group => new RegExp(group).test(from));
}
async function fixImports() {
    try {
        const files = await glob('src/**/*.{ts,tsx}');
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            const fixed = sortImports(content);
            if (content !== fixed) {
                fs.writeFileSync(file, fixed);
                console.log(`Fixed imports in ${file}`);
            }
        }
        console.log('Import fixing completed!');
    }
    catch (error) {
        console.error('Error fixing imports:', error);
    }
}
// Run the script
fixImports();
