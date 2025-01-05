import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TRACKING_FILE = 'resources/troubleshooting-tracker.json';
const ERROR_LOG_PATH = 'resources/ERRORS_AND_SOLUTIONS.md';

interface Session {
  id: string;
  steps: Array<{
    action: string;
    result: string;
    timestamp: string;
    emotion: string;
  }>;
}

interface ErrorInfo {
  message: string;
  category: string;
  file?: string;
}

interface ResolutionInfo {
  solved: boolean;
  solution?: string;
  commitHash?: string;
  timeSpent: number;
}

interface TroubleshootingSession extends Session {
  startTime: string;
  endTime?: string;
  error: ErrorInfo;
  resolution?: ResolutionInfo;
  tags: string[];
}

interface TrackerData {
  sessions: TroubleshootingSession[];
  statistics?: {
    totalTime: number;
    averageResolutionTime: number;
    commonErrors: Record<string, number>;
    frustrationPoints: string[];
  };
}

function initializeTracker(): TrackerData {
  let data: TrackerData;
  if (!fs.existsSync(TRACKING_FILE)) {
    data = { sessions: [] };
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data));
  } else {
    data = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
  }
  return data;
}

function addStep(sessionId: string, action: string, result: string, emotion: string = 'neutral') {
  const data: TrackerData = initializeTracker();
  const session = data.sessions.find((s: TroubleshootingSession) => s.id === sessionId);

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.steps.push({
    action,
    result,
    timestamp: new Date().toISOString(),
    emotion
  });

  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
}

// Start a new troubleshooting session
function startSession(errorMessage: string, category: string, file?: string): string {
  const data: TrackerData = initializeTracker();
  const sessionId = Date.now().toString();

  const newSession: TroubleshootingSession = {
    id: sessionId,
    startTime: new Date().toISOString(),
    error: {
      message: errorMessage,
      category,
      file
    },
    steps: [],
    tags: []
  };

  data.sessions.push(newSession);
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));

  console.log(`Started tracking session ${sessionId}`);
  console.log('Run these commands to track your troubleshooting:');
  console.log(`npm run track:step ${sessionId} "what you tried" "result" [emotion]`);
  console.log(`npm run track:end ${sessionId} "solution" --solved`);

  return sessionId;
}

// End a troubleshooting session
function endSession(sessionId: string, solution?: string, solved: boolean = true) {
  const data: TrackerData = initializeTracker();
  const session = data.sessions.find((s: TroubleshootingSession) => s.id === sessionId);

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.endTime = new Date().toISOString();
  const timeSpent = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 / 60;

  // Try to find related commit
  let commitHash: string | undefined;
  try {
    commitHash = execSync('git log -1 --pretty=format:"%h"').toString().trim();
  } catch (error) {
    console.error('Failed to get recent commit hash:', error);
  }

  session.resolution = {
    solved,
    solution,
    commitHash,
    timeSpent
  };

  // Update statistics
  updateStatistics(data);

  // If solved, add to error log
  if (solved && solution) {
    appendToErrorLog(session);
  }

  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));

  console.log(`Session ${sessionId} ended`);
  console.log(`Time spent: ${timeSpent.toFixed(2)} minutes`);
}

// Update overall statistics
function updateStatistics(data: TrackerData) {
  const stats = {
    totalTime: 0,
    averageResolutionTime: 0,
    commonErrors: {} as Record<string, number>,
    frustrationPoints: [] as string[]
  };

  data.sessions.forEach((session: TroubleshootingSession) => {
    if (session.resolution) {
      stats.totalTime += session.resolution.timeSpent;

      // Track common errors
      const errorType = session.error.category;
      stats.commonErrors[errorType] = (stats.commonErrors[errorType] || 0) + 1;

      // Track frustration points
      session.steps
        .filter(step => step.emotion === 'frustrated')
        .forEach(step => stats.frustrationPoints.push(step.action));
    }
  });

  stats.averageResolutionTime = stats.totalTime / data.sessions.filter(s => s.resolution).length;
  data.statistics = stats;
}

// Append solved issue to error log
function appendToErrorLog(session: TroubleshootingSession) {
  if (!session.resolution?.solution) return;

  const errorEntry = `
### ${new Date(session.startTime).toISOString().split('T')[0]} - ${session.error.message}
**Error Message:**
\`\`\`
${session.error.message}
\`\`\`

**Context:**
- File/Location: ${session.error.file || 'N/A'}
- Time Spent: ${session.resolution.timeSpent.toFixed(2)} minutes
- Steps Taken: ${session.steps.length}

**Solution:**
${session.resolution.solution}

**Troubleshooting Steps:**
${session.steps.map(step => `- ${step.action} → ${step.result}`).join('\n')}

${session.resolution.commitHash ? `**Commit:** ${session.resolution.commitHash}` : ''}
`;

  let currentLog = '';
  if (fs.existsSync(ERROR_LOG_PATH)) {
    currentLog = fs.readFileSync(ERROR_LOG_PATH, 'utf-8');
  }

  const sections = currentLog.split('\n## ');
  const categoryIndex = sections.findIndex(s =>
    s.toLowerCase().includes(session.error.category.toLowerCase())
  );

  if (categoryIndex !== -1) {
    sections[categoryIndex] += errorEntry;
  } else {
    sections.push(`${session.error.category}${errorEntry}`);
  }

  fs.writeFileSync(ERROR_LOG_PATH, sections.join('\n## '));
}

// CLI command handling
const command = process.argv[2];
const sessionId = process.argv[3];

switch (command) {
  case 'start':
    const [errorMsg, category, file] = process.argv.slice(3);
    startSession(errorMsg, category, file);
    break;
  case 'step':
    const [action, result, emotion] = process.argv.slice(4);
    addStep(sessionId, action, result, emotion);
    break;
  case 'end':
    const solution = process.argv[4];
    const solved = process.argv.includes('--solved');
    endSession(sessionId, solution, solved);
    break;
  default:
    console.log('Invalid command. Use: start, step, or end');
}