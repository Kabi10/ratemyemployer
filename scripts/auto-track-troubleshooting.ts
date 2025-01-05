import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { watch } from 'chokidar';

const TRACKING_FILE = 'resources/troubleshooting-tracker.json';
const ERROR_LOG_PATH = 'resources/ERRORS_AND_SOLUTIONS.md';
const WATCH_PATHS = [
  'src/**/*.{ts,tsx}',
  'src/**/*.log',
  '.next/error.log',
  'npm-debug.log'
];

interface AutoTrackedSession {
  id: string;
  startTime: string;
  endTime?: string;
  error: {
    message: string;
    stack?: string;
    category: string;
    file?: string;
    line?: number;
  };
  context: {
    branch: string;
    uncommittedChanges: string[];
    recentCommits: string[];
    npmLogs?: string[];
  };
  actions: {
    timestamp: string;
    type: 'file_change' | 'commit' | 'npm_install' | 'error_repeat' | 'error_resolved';
    description: string;
  }[];
  resolution?: {
    solved: boolean;
    solution?: string;
    commitHash?: string;
    timeSpent: number;
  };
}

// Watch for TypeScript compiler errors
function watchTsErrors() {
  const tscProcess = spawn('tsc', ['--watch', '--preserveWatchOutput']);
  
  tscProcess.stdout?.on('data', (data: Buffer) => {
    const output = data.toString();
    if (output.includes('error TS')) {
      const errorMatch = output.match(/error TS\d+: (.*)/);
      if (errorMatch) {
        handleNewError({
          message: errorMatch[1],
          category: 'typescript',
          file: output.match(/([^(\s]+\.tsx?)/)?.[1]
        });
      }
    }
  });

  tscProcess.on('error', (error) => {
    console.error('TypeScript compiler process error:', error);
  });
}

// Watch for runtime errors in development
function watchRuntimeErrors() {
  const errorLogPath = path.join(process.cwd(), '.next/error.log');
  
  watch(errorLogPath).on('change', (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = content.match(/Error: .+(?:\\n\\s+at .+)+/g);
    
    if (errors) {
      errors.forEach(error => {
        handleNewError({
          message: error.split('\\n')[0],
          stack: error,
          category: 'runtime'
        });
      });
    }
  });
}

// Watch for npm errors
function watchNpmErrors() {
  watch('npm-debug.log').on('add', (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    handleNewError({
      message: content.split('\\n')[0],
      category: 'npm',
      file: 'package.json'
    });
  });
}

// Watch for file changes
function watchFileChanges() {
  const watcher = watch(WATCH_PATHS, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  watcher.on('change', (filePath) => {
    const activeSessions = loadActiveSessions();
    activeSessions.forEach(session => {
      session.actions.push({
        timestamp: new Date().toISOString(),
        type: 'file_change',
        description: `Modified ${filePath}`
      });
      updateSession(session);
    });
  });
}

// Watch for git changes
function watchGitChanges() {
  setInterval(() => {
    try {
      const activeSessions = loadActiveSessions();
      if (activeSessions.length === 0) return;

      const currentBranch = execSync('git branch --show-current').toString().trim();
      const recentCommits = execSync('git log -3 --oneline').toString().split('\\n');
      const uncommittedChanges = execSync('git status --porcelain').toString().split('\\n').filter(Boolean);

      activeSessions.forEach(session => {
        if (session.context.branch !== currentBranch || 
            session.context.uncommittedChanges.join('') !== uncommittedChanges.join('')) {
          
          session.actions.push({
            timestamp: new Date().toISOString(),
            type: 'commit',
            description: 'Git changes detected'
          });
          
          session.context.branch = currentBranch;
          session.context.uncommittedChanges = uncommittedChanges;
          session.context.recentCommits = recentCommits;
          
          updateSession(session);
        }
      });
    } catch (error) {
      console.warn('Error watching git changes:', error);
    }
  }, 5000);
}

function handleNewError({ message, stack, category, file, line }: Partial<AutoTrackedSession['error']>) {
  const activeSessions = loadActiveSessions();
  const existingSession = activeSessions.find(s => s.error.message === message);
  
  if (existingSession) {
    existingSession.actions.push({
      timestamp: new Date().toISOString(),
      type: 'error_repeat',
      description: 'Error occurred again'
    });
    updateSession(existingSession);
    return;
  }

  const newSession: AutoTrackedSession = {
    id: Date.now().toString(),
    startTime: new Date().toISOString(),
    error: {
      message: message || 'Unknown error',
      stack,
      category: category || 'unknown',
      file,
      line
    },
    context: {
      branch: execSync('git branch --show-current').toString().trim(),
      uncommittedChanges: execSync('git status --porcelain').toString().split('\\n').filter(Boolean),
      recentCommits: execSync('git log -3 --oneline').toString().split('\\n')
    },
    actions: []
  };

  saveNewSession(newSession);
}

function loadActiveSessions(): AutoTrackedSession[] {
  if (!fs.existsSync(TRACKING_FILE)) {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify({ sessions: [] }, null, 2));
    return [];
  }

  const data = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
  return data.sessions.filter((s: AutoTrackedSession) => !s.endTime);
}

function updateSession(session: AutoTrackedSession) {
  const data = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
  const index = data.sessions.findIndex((s: AutoTrackedSession) => s.id === session.id);
  
  if (index !== -1) {
    data.sessions[index] = session;
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
  }
}

function saveNewSession(session: AutoTrackedSession) {
  const data = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
  data.sessions.push(session);
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
}

function checkErrorResolution() {
  setInterval(() => {
    const activeSessions = loadActiveSessions();
    activeSessions.forEach(session => {
      // Check if the error still exists
      try {
        if (session.error.file) {
          const content = fs.readFileSync(session.error.file, 'utf8');
          const errorStillExists = content.includes(session.error.message);
          
          if (!errorStillExists) {
            session.endTime = new Date().toISOString();
            session.resolution = {
              solved: true,
              timeSpent: (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 / 60,
              commitHash: execSync('git rev-parse HEAD').toString().trim()
            };
            
            session.actions.push({
              timestamp: new Date().toISOString(),
              type: 'error_resolved',
              description: 'Error no longer present in code'
            });
            
            updateSession(session);
            appendToErrorLog(session);
          }
        }
      } catch (error) {
        console.warn('Error checking resolution:', error);
      }
    });
  }, 10000);
}

function appendToErrorLog(session: AutoTrackedSession) {
  if (!session.resolution?.solved) return;

  const errorEntry = `
### ${new Date(session.startTime).toISOString().split('T')[0]} - Auto-tracked: ${session.error.message}
**Error:**
\`\`\`
${session.error.stack || session.error.message}
\`\`\`

**Context:**
- File: ${session.error.file || 'N/A'}
- Branch: ${session.context.branch}
- Time Spent: ${session.resolution.timeSpent.toFixed(2)} minutes

**Actions Taken:**
${session.actions.map(action => `- ${new Date(action.timestamp).toLocaleTimeString()}: ${action.description}`).join('\\n')}

**Resolution:**
- Commit: ${session.resolution.commitHash}
- Changes Made: ${session.context.uncommittedChanges.join(', ')}
`;

  const currentLog = fs.readFileSync(ERROR_LOG_PATH, 'utf8');
  const sections = currentLog.split('\n## ');
  const categorySection = sections.find(s => 
    s.toLowerCase().includes(session.error.category.toLowerCase())
  );
  
  if (categorySection) {
    sections[sections.indexOf(categorySection)] += errorEntry;
    fs.writeFileSync(ERROR_LOG_PATH, sections.join('\n## '));
  }
}

// Start all watchers
function startAutoTracking() {
  console.log('Starting automated error tracking...');
  watchTsErrors();
  watchRuntimeErrors();
  watchNpmErrors();
  watchFileChanges();
  watchGitChanges();
  checkErrorResolution();
}

startAutoTracking(); 