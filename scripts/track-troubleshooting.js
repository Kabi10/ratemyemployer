"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var child_process_1 = require("child_process");
var TRACKING_FILE = 'resources/troubleshooting-tracker.json';
var ERROR_LOG_PATH = 'resources/ERRORS_AND_SOLUTIONS.md';
function initializeTracker() {
    var data;
    if (!fs_1.default.existsSync(TRACKING_FILE)) {
        data = { sessions: [] };
        fs_1.default.writeFileSync(TRACKING_FILE, JSON.stringify(data));
    }
    else {
        data = JSON.parse(fs_1.default.readFileSync(TRACKING_FILE, 'utf8'));
    }
    return data;
}
function addStep(sessionId, action, result, emotion) {
    if (emotion === void 0) { emotion = 'neutral'; }
    var data = initializeTracker();
    var session = data.sessions.find(function (s) { return s.id === sessionId; });
    if (!session) {
        throw new Error("Session ".concat(sessionId, " not found"));
    }
    session.steps.push({
        action: action,
        result: result,
        timestamp: new Date().toISOString(),
        emotion: emotion
    });
    fs_1.default.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
}
// Start a new troubleshooting session
function startSession(errorMessage, category, file) {
    var data = initializeTracker();
    var sessionId = Date.now().toString();
    var newSession = {
        id: sessionId,
        startTime: new Date().toISOString(),
        error: {
            message: errorMessage,
            category: category,
            file: file
        },
        steps: [],
        tags: []
    };
    data.sessions.push(newSession);
    fs_1.default.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
    console.log("Started tracking session ".concat(sessionId));
    console.log('Run these commands to track your troubleshooting:');
    console.log("npm run track:step ".concat(sessionId, " \"what you tried\" \"result\" [emotion]"));
    console.log("npm run track:end ".concat(sessionId, " \"solution\" --solved"));
    return sessionId;
}
// End a troubleshooting session
function endSession(sessionId, solution, solved) {
    if (solved === void 0) { solved = true; }
    var data = initializeTracker();
    var session = data.sessions.find(function (s) { return s.id === sessionId; });
    if (!session) {
        throw new Error("Session ".concat(sessionId, " not found"));
    }
    session.endTime = new Date().toISOString();
    var timeSpent = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 / 60;
    // Try to find related commit
    var commitHash;
    try {
        commitHash = (0, child_process_1.execSync)('git log -1 --pretty=format:"%h"').toString().trim();
    }
    catch (error) {
        console.error('Failed to get recent commit hash:', error);
    }
    session.resolution = {
        solved: solved,
        solution: solution,
        commitHash: commitHash,
        timeSpent: timeSpent
    };
    // Update statistics
    updateStatistics(data);
    // If solved, add to error log
    if (solved && solution) {
        appendToErrorLog(session);
    }
    fs_1.default.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
    console.log("Session ".concat(sessionId, " ended"));
    console.log("Time spent: ".concat(timeSpent.toFixed(2), " minutes"));
}
// Update overall statistics
function updateStatistics(data) {
    var stats = {
        totalTime: 0,
        averageResolutionTime: 0,
        commonErrors: {},
        frustrationPoints: []
    };
    data.sessions.forEach(function (session) {
        if (session.resolution) {
            stats.totalTime += session.resolution.timeSpent;
            // Track common errors
            var errorType = session.error.category;
            stats.commonErrors[errorType] = (stats.commonErrors[errorType] || 0) + 1;
            // Track frustration points
            session.steps
                .filter(function (step) { return step.emotion === 'frustrated'; })
                .forEach(function (step) { return stats.frustrationPoints.push(step.action); });
        }
    });
    stats.averageResolutionTime = stats.totalTime / data.sessions.filter(function (s) { return s.resolution; }).length;
    data.statistics = stats;
}
// Append solved issue to error log
function appendToErrorLog(session) {
    var _a;
    if (!((_a = session.resolution) === null || _a === void 0 ? void 0 : _a.solution))
        return;
    var errorEntry = "\n### ".concat(new Date(session.startTime).toISOString().split('T')[0], " - ").concat(session.error.message, "\n**Error Message:**\n```\n").concat(session.error.message, "\n```\n\n**Context:**\n- File/Location: ").concat(session.error.file || 'N/A', "\n- Time Spent: ").concat(session.resolution.timeSpent.toFixed(2), " minutes\n- Steps Taken: ").concat(session.steps.length, "\n\n**Solution:**\n").concat(session.resolution.solution, "\n\n**Troubleshooting Steps:**\n").concat(session.steps.map(function (step) { return "- ".concat(step.action, " \u2192 ").concat(step.result); }).join('\n'), "\n\n").concat(session.resolution.commitHash ? "**Commit:** ".concat(session.resolution.commitHash) : '', "\n");
    var currentLog = '';
    if (fs_1.default.existsSync(ERROR_LOG_PATH)) {
        currentLog = fs_1.default.readFileSync(ERROR_LOG_PATH, 'utf-8');
    }
    var sections = currentLog.split('\n## ');
    var categoryIndex = sections.findIndex(function (s) {
        return s.toLowerCase().includes(session.error.category.toLowerCase());
    });
    if (categoryIndex !== -1) {
        sections[categoryIndex] += errorEntry;
    }
    else {
        sections.push("".concat(session.error.category).concat(errorEntry));
    }
    fs_1.default.writeFileSync(ERROR_LOG_PATH, sections.join('\n## '));
}
// CLI command handling
var command = process.argv[2];
var sessionId = process.argv[3];
switch (command) {
    case 'start':
        var _a = process.argv.slice(3), errorMsg = _a[0], category = _a[1], file = _a[2];
        startSession(errorMsg, category, file);
        break;
    case 'step':
        var _b = process.argv.slice(4), action = _b[0], result = _b[1], emotion = _b[2];
        addStep(sessionId, action, result, emotion);
        break;
    case 'end':
        var solution = process.argv[4];
        var solved = process.argv.includes('--solved');
        endSession(sessionId, solution, solved);
        break;
    default:
        console.log('Invalid command. Use: start, step, or end');
}
