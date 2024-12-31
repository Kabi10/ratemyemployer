const fs = require('fs');
const path = require('path');

// Limit the folder structure depth and which files to include
const MAX_DEPTH = 3;  // Change this if needed
const EXCLUDED_FOLDERS = ['node_modules', '.git'];  // Directories to ignore
const KEY_FILES = ['package.json', '.env', 'README.md'];  // Essential files to capture

// Function to get the folder structure with controlled depth and exclusions
function getFolderStructure(dir, depth = 0) {
    if (depth > MAX_DEPTH) return [];

    const items = fs.readdirSync(dir).filter(item => !EXCLUDED_FOLDERS.includes(item));

    return items.map(item => {
        const fullPath = path.join(dir, item);
        const isDirectory = fs.lstatSync(fullPath).isDirectory();
        const result = {
            name: item,
            type: isDirectory ? 'folder' : 'file'
        };

        // Include folder contents only up to MAX_DEPTH
        if (isDirectory) {
            result.contents = getFolderStructure(fullPath, depth + 1);
        }

        return result;
    });
}

// Function to get the package.json info
function getPackageJsonInfo() {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        return {
            name: packageJson.name || 'N/A',
            version: packageJson.version || 'N/A',
            main: packageJson.main || 'N/A',
            scripts: packageJson.scripts || {},
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {}
        };
    }
    return null;
}

// Function to get the .env file content
function getEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        return fs.readFileSync(envPath, 'utf-8').slice(0, 500);  // Limit .env content to 500 chars
    }
    return 'No .env file found';
}

// Function to read the README.md content (if exists)
function getReadmeFile() {
    const readmePath = path.join(process.cwd(), 'README.md');
    if (fs.existsSync(readmePath)) {
        return fs.readFileSync(readmePath, 'utf-8').slice(0, 500);  // Limit README content to 500 chars
    }
    return 'No README.md file found';
}

function main() {
    console.log('Fetching project information...');

    // Step 1: Folder Structure (limited depth and excluding unnecessary folders)
    const folderStructure = getFolderStructure(process.cwd());

    // Step 2: package.json Info
    const packageJsonInfo = getPackageJsonInfo();

    // Step 3: .env File content (if exists)
    const envFileContent = getEnvFile();

    // Step 4: README.md content (if exists)
    const readmeFileContent = getReadmeFile();

    // Step 5: Aggregate and write to file
    const projectInfo = {
        folderStructure,
        packageJson: packageJsonInfo,
        envFile: envFileContent,
        readmeFile: readmeFileContent
    };

    const outputPath = path.join(process.cwd(), 'project-info-limited.json');
    fs.writeFileSync(outputPath, JSON.stringify(projectInfo, null, 2), 'utf-8');

    console.log('Project information fetched successfully!');
    console.log(`Output saved to: ${outputPath}`);
}

// Run the script
main();
