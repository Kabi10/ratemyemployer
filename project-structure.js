const fs = require('fs');
const path = require('path');

// Helper function to extract Tailwind CSS classes from JSX
function extractTailwindClasses(content) {
    const regex = /className="([^"]+)"/g;
    let match;
    let classes = [];
    while ((match = regex.exec(content)) !== null) {
        classes.push(match[1]);
    }
    return classes.join(' ');
}

// Helper function to extract props from component usage
function extractProps(content) {
    const regex = /\s+([a-zA-Z0-9]+)=/g;
    let match;
    let props = [];
    while ((match = regex.exec(content)) !== null) {
        props.push(match[1]);
    }
    return props;
}

// Main function to traverse the directory and extract details
function getAllFiles(dirPath, arrayOfFiles = [], indent = '', output = '') {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);

        // Skip node_modules, .git, and other common ignore folders
        if (file === 'node_modules' || file === '.git' || file === '.next') {
            return;
        }

        if (fs.statSync(fullPath).isDirectory()) {
            output += `${indent}📁 ${file}/\n`;
            output = getAllFiles(fullPath, arrayOfFiles, indent + '  ', output);
        } else {
            output += `${indent}📄 ${file}\n`;

            // Only read content of specific file types
            if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file))) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const componentName = content.match(/export default function (\w+)/);
                    const tailwindClasses = extractTailwindClasses(content);
                    const props = extractProps(content);

                    output += `${indent}   Component Name: ${componentName ? componentName[1] : 'N/A'}\n`;
                    output += `${indent}   Props: ${props.length > 0 ? props.join(', ') : 'None'}\n`;
                    output += `${indent}   Tailwind Classes: ${tailwindClasses || 'None'}\n`;
                    output += `${indent}   -------------------\n`;
                    output += `${indent}   Content:\n`;
                    output += `${indent}   -------------------\n`;
                    output += `${indent}   ${content.replace(/\n/g, `\n${indent}   `)}\n`;
                    output += `${indent}   -------------------\n\n`;
                } catch (err) {
                    output += `${indent}   Error reading file: ${err.message}\n\n`;
                }
            }
        }
    });
    return output;
}

// Call function on the directory where your project is located
const outputContent = 'Project Structure:\n' + getAllFiles('./src', [], '', '');
fs.writeFileSync('project_structure.txt', outputContent, 'utf8');

console.log('Project structure has been written to project_structure.txt');
