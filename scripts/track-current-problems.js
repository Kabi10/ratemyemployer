var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
function isExecSyncError(error) {
    return error instanceof Error &&
        typeof error.status === 'number' &&
        Array.isArray(error.output);
}
// Constants
var OUTPUT_FILE = 'resources/CURRENT_PROBLEMS.md';
var PROBLEMS_JSON = 'resources/problems-tracker.json';
// Helper to determine category based on file path
function determineCategory(filePath) {
    if (filePath.includes('hooks/'))
        return 'Hook';
    if (filePath.includes('.test.'))
        return 'Test';
    if (filePath.includes('route.'))
        return 'Route';
    if (filePath.includes('.yml') || filePath.includes('.config.'))
        return 'Config';
    return 'Component';
}
// Main scanning function
function scanProblems() {
    return __awaiter(this, void 0, void 0, function () {
        var tscOutput, problemGroups, errors, resourcesDir;
        return __generator(this, function (_a) {
            console.log('Running TypeScript compiler check...');
            tscOutput = '';
            try {
                tscOutput = execSync('tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' }).toString();
            }
            catch (error) {
                if (isExecSyncError(error) && error.status === 2 && error.output[1]) {
                    console.log('TypeScript found errors:');
                    tscOutput = error.output[1].toString();
                }
                else {
                    console.error('Error running TypeScript compiler:', error);
                    return [2 /*return*/, []];
                }
            }
            problemGroups = new Map();
            errors = tscOutput.split('\n').filter(function (line) { return line.includes('error TS'); });
            console.log("Found ".concat(errors.length, " TypeScript errors"));
            errors.forEach(function (error) {
                console.log('Processing error line:', error); // Log the raw error line
                // Parse file path, line number, and column (updated regex)
                var fileMatch = error.match(/^(.+?)\((\d+),(\d+)\):/);
                if (!fileMatch) {
                    console.log('Could not parse file info from error line');
                    return;
                }
                var _ = fileMatch[0], filePath = fileMatch[1], line = fileMatch[2], column = fileMatch[3];
                var normalizedPath = path.normalize(filePath);
                // Parse error code and message (updated regex)
                var errorMatch = error.match(/: error TS(\d+): (.+)$/);
                if (!errorMatch) {
                    console.log('Could not parse error code/message from error line');
                    return;
                }
                var __ = errorMatch[0], code = errorMatch[1], message = errorMatch[2];
                var problem = {
                    filePath: normalizedPath,
                    lineNumber: parseInt(line),
                    message: message.trim(),
                    severity: 'error',
                    code: "TS".concat(code),
                    errorCount: 1
                };
                if (!problemGroups.has(normalizedPath)) {
                    problemGroups.set(normalizedPath, {
                        filePath: normalizedPath,
                        totalErrors: 0,
                        problems: [],
                        category: determineCategory(normalizedPath)
                    });
                }
                var group = problemGroups.get(normalizedPath);
                group.problems.push(problem);
                group.totalErrors++;
            });
            resourcesDir = path.join(process.cwd(), 'resources');
            if (!fs.existsSync(resourcesDir)) {
                console.log('Creating resources directory...');
                fs.mkdirSync(resourcesDir, { recursive: true });
            }
            return [2 /*return*/, Array.from(problemGroups.values())];
        });
    });
}
// Generate markdown output
function generateMarkdown(groups) {
    var timestamp = new Date().toISOString().split('T')[0];
    var markdown = "# TypeScript Problems Report\n\n";
    markdown += "Generated on: ".concat(timestamp, "\n\n");
    markdown += "## Summary\n";
    markdown += "- Total files with problems: ".concat(groups.length, "\n");
    markdown += "- Total errors: ".concat(groups.reduce(function (sum, g) { return sum + g.totalErrors; }, 0), "\n\n");
    // Group by category
    var categoryGroups = groups.reduce(function (acc, group) {
        if (!acc[group.category])
            acc[group.category] = [];
        acc[group.category].push(group);
        return acc;
    }, {});
    // Generate markdown for each category
    for (var _i = 0, _a = Object.entries(categoryGroups); _i < _a.length; _i++) {
        var _b = _a[_i], category = _b[0], items = _b[1];
        markdown += "## ".concat(category, " Issues\n\n");
        items.forEach(function (group) {
            markdown += "### ".concat(path.basename(group.filePath), "\n");
            markdown += "**Path:** `".concat(group.filePath, "`\n");
            markdown += "**Total Errors:** ".concat(group.totalErrors, "\n\n");
            if (group.problems.length > 0) {
                markdown += "#### Problems:\n";
                group.problems.forEach(function (problem) {
                    markdown += "- Line ".concat(problem.lineNumber, ": ").concat(problem.message, " (").concat(problem.code, ")\n");
                });
                markdown += '\n';
            }
        });
    }
    return markdown;
}
// Save problems to JSON for tracking
function saveProblemTracker(groups) {
    var data = {
        lastUpdated: new Date().toISOString(),
        totalProblems: groups.reduce(function (sum, group) { return sum + group.totalErrors; }, 0),
        groups: groups
    };
    fs.writeFileSync(PROBLEMS_JSON, JSON.stringify(data, null, 2));
}
// Add debug logging
function ensureDirectoryExists(filePath) {
    var dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        console.log("Creating directory: ".concat(dir));
        fs.mkdirSync(dir, { recursive: true });
    }
    else {
        console.log("Directory exists: ".concat(dir));
    }
}
// Main execution
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var problems, markdown;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting problem scan...');
                    console.log('Current working directory:', process.cwd());
                    // Ensure directories exist
                    ensureDirectoryExists(OUTPUT_FILE);
                    ensureDirectoryExists(PROBLEMS_JSON);
                    console.log('Scanning for problems...');
                    return [4 /*yield*/, scanProblems()];
                case 1:
                    problems = _a.sent();
                    console.log("Found ".concat(problems.length, " problems"));
                    if (problems.length === 0) {
                        console.log('No problems found!');
                        return [2 /*return*/];
                    }
                    try {
                        // Generate and save markdown report
                        console.log('Generating markdown report...');
                        markdown = generateMarkdown(problems);
                        fs.writeFileSync(OUTPUT_FILE, markdown);
                        console.log("Successfully wrote to ".concat(OUTPUT_FILE));
                        // Save JSON tracker
                        console.log('Saving JSON tracker...');
                        saveProblemTracker(problems);
                        console.log("Successfully wrote to ".concat(PROBLEMS_JSON));
                        console.log('All operations completed successfully!');
                    }
                    catch (error) {
                        console.error('Error writing files:', error);
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
module.exports = { scanProblems: scanProblems, generateMarkdown: generateMarkdown, saveProblemTracker: saveProblemTracker };
