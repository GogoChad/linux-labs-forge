import dotenv from 'dotenv';
import express from 'express';
import { WebSocketServer } from 'ws';
import Docker from 'dockerode';
import cors from 'cors';
import { spawn } from 'node-pty';
import { spawn as childSpawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsPromises = fs.promises;
const DEFAULT_IMAGE = 'debian:latest';
const BASE_IMAGE = process.env.LAB_BASE_IMAGE || 'linux-lab-base:latest';
const BASE_DOCKERFILE = process.env.LAB_BASE_DOCKERFILE || path.join(__dirname, 'Dockerfile');
const BASE_BUILD_CONTEXT = process.env.LAB_BASE_BUILD_CONTEXT || path.dirname(BASE_DOCKERFILE);

const app = express();
const docker = new Docker();
const PORT = 3001;
const CUSTOM_LABS_FILE = path.join(__dirname, 'custom-labs.json');
const FRONTEND_CUSTOM_LABS_FILE = path.join(__dirname, '..', 'src', 'data', 'custom-labs.json');
const EXERCISES_DIR = path.join(__dirname, 'exercises');

app.use(cors());
app.use(express.json());

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Store active containers
const activeContainers = new Map();

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/terminal' });

// Helpers for custom lab persistence
const ensureFile = async (filePath, fallback = '[]\n') => {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fsPromises.access(filePath);
  } catch {
    await fsPromises.writeFile(filePath, fallback, 'utf8');
  }
};

const loadCustomLabs = async () => {
  await ensureFile(CUSTOM_LABS_FILE);
  try {
    const raw = await fsPromises.readFile(CUSTOM_LABS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read custom-labs.json:', error.message);
    return [];
  }
};

const saveCustomLabs = async (labs) => {
  await ensureFile(CUSTOM_LABS_FILE);
  await ensureFile(FRONTEND_CUSTOM_LABS_FILE);
  const content = JSON.stringify(labs, null, 2) + '\n';
  await fsPromises.writeFile(CUSTOM_LABS_FILE, content, 'utf8');
  await fsPromises.writeFile(FRONTEND_CUSTOM_LABS_FILE, content, 'utf8');
};

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .trim() || `custom-lab-${Date.now()}`;
};

const runChildProcess = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const child = childSpawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
};

async function buildLabBaseImage() {
  if (!fs.existsSync(BASE_DOCKERFILE)) {
    throw new Error(`Dockerfile not found at ${BASE_DOCKERFILE}`);
  }

  console.log(`Building lab base image "${BASE_IMAGE}" from ${BASE_DOCKERFILE}...`);
  const args = ['build', '-t', BASE_IMAGE, '-f', BASE_DOCKERFILE, BASE_BUILD_CONTEXT];
  await runChildProcess('docker', args);
}

// Check if Docker is available
async function checkDocker() {
  try {
    await docker.ping();
    console.log('✓ Docker is running');
    return true;
  } catch (error) {
    console.error('✗ Docker is not available:', error.message);
    return false;
  }
}

async function ensureDebianImage() {
  try {
    await docker.getImage(DEFAULT_IMAGE).inspect();
  } catch {
    console.log(`Pulling ${DEFAULT_IMAGE} image...`);
    await new Promise((resolve, reject) => {
      docker.pull(DEFAULT_IMAGE, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
    });
  }

  return DEFAULT_IMAGE;
}

async function ensureLabBaseImage() {
  try {
    await docker.getImage(BASE_IMAGE).inspect();
    return BASE_IMAGE;
  } catch (error) {
    console.warn(`Lab base image "${BASE_IMAGE}" missing: ${error.message}`);
  }

  try {
    await buildLabBaseImage();
    return BASE_IMAGE;
  } catch (buildError) {
    console.error('Failed to build lab base image:', buildError.message);
    console.warn(`Falling back to ${DEFAULT_IMAGE}`);
    return await ensureDebianImage();
  }
}

async function runBootstrap(container) {
  const bootstrapScript = String.raw`set -e

if ! command -v sshd >/dev/null 2>&1 || ! command -v zsh >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq openssh-server sudo vim nano curl wget net-tools iputils-ping procps grep sed gawk git python3 build-essential zsh
fi

if ! id -u student >/dev/null 2>&1; then
  useradd -m -s /bin/bash student
  echo "student:student123" | chpasswd
  echo "student ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
fi

mkdir -p /home/student/.ssh
chmod 700 /home/student/.ssh
chown -R student:student /home/student

if [ ! -f /home/student/.zshrc ]; then
cat <<'ZRC' > /home/student/.zshrc
# Disable compfix warning
export ZSH_DISABLE_COMPFIX=true

# PATH
export PATH="$HOME/bin:$HOME/.local/bin:/usr/local/bin:$PATH"

# History
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt appendhistory
setopt sharehistory
setopt hist_ignore_dups
setopt hist_ignore_space

# Completion
autoload -Uz compinit
compinit

# Prompt (user@host:dir $)
PROMPT='%F{cyan}%n@%m%f %F{yellow}%1~%f %# '

# Aliases
alias ll='ls -lah'
alias gs='git status'
alias ..='cd ..'
alias ...='cd ../..'

# Enable colors
autoload -U colors && colors
ZRC
chown student:student /home/student/.zshrc
fi

if [ ! -f /home/student/.bash_profile ]; then
cat <<'LOGO_EOF' > /home/student/.bash_profile
echo ""
echo "=============================================================="
echo "        Linux Lab Forge - Interactive Learning"
echo "=============================================================="
echo ""
echo "Your lab environment is ready!"
echo "Type 'ls' to see available exercises"
echo "Run 'finished' when you complete all exercises"
echo ""
LOGO_EOF
chown student:student /home/student/.bash_profile
fi

grep -qxF 'source ~/.bash_profile' /home/student/.bashrc || echo 'source ~/.bash_profile' >> /home/student/.bashrc
chown student:student /home/student/.bashrc

mkdir -p /var/run/sshd /run/sshd
/usr/sbin/sshd || true`;

  console.log('Running bootstrap script in container...');
  const bootstrapExec = await container.exec({
    Cmd: ['/bin/bash', '-lc', bootstrapScript],
    AttachStdout: true,
    AttachStderr: true
  });
  const bootstrapStream = await bootstrapExec.start({ Detach: false, Tty: false });

  await new Promise((resolve, reject) => {
    let output = '';
    bootstrapStream.on('data', (chunk) => {
      output += chunk.toString();
    });
    bootstrapStream.on('end', () => {
      if (output) console.log(`  Bootstrap output: ${output.substring(0, 200)}`);
      resolve();
    });
    bootstrapStream.on('error', reject);
  });
  console.log('✓ Bootstrap script completed');
}

// Shared reusable Debian container for quick script tests
let testSandboxContainer = null;
async function getOrCreateTestSandbox() {
  try {
    // If we already have a running handle, verify it is alive
    if (testSandboxContainer) {
      try {
        const info = await testSandboxContainer.inspect();
        if (info.State.Running) {
          return testSandboxContainer;
        }
        await testSandboxContainer.start();
        return testSandboxContainer;
      } catch {
        // fall through to recreate
      }
    }

    const baseImage = await ensureLabBaseImage();

    // Reuse by name if it already exists
    const containers = await docker.listContainers({ all: true });
    const existing = containers.find((c) => c.Names.some((n) => n.replace('/', '') === 'lab-test-sandbox'));
    if (existing) {
      testSandboxContainer = docker.getContainer(existing.Id);
      if (existing.State !== 'running') {
        await testSandboxContainer.start();
      }
      return testSandboxContainer;
    }

    // Create once and keep alive
    testSandboxContainer = await docker.createContainer({
      name: 'lab-test-sandbox',
      Image: baseImage,
      Cmd: ['/bin/bash', '-lc', 'sleep infinity'],
      Tty: false,
      OpenStdin: false,
      HostConfig: {
        AutoRemove: false,
        Memory: 256 * 1024 * 1024,
        MemorySwap: 256 * 1024 * 1024,
      },
    });
    await testSandboxContainer.start();
    return testSandboxContainer;
  } catch (error) {
    console.error('getOrCreateTestSandbox error:', error);
    throw error;
  }
}

// Check if a container for this lab already exists and is running
async function findExistingContainer(labType) {
  try {
    // Use the labType directly so each lab gets its own container name
    const baseName = labType || 'linux-lab';
    const containers = await docker.listContainers({ all: true });
    
    // Find container with matching lab name; prefer running, otherwise start an exited one
    for (const containerInfo of containers) {
      const name = containerInfo.Names[0].replace('/', '');
      if (name.startsWith(baseName)) {
        const container = docker.getContainer(containerInfo.Id);
        if (containerInfo.State === 'running') {
          console.log(`Found existing running container: ${name}`);
          return container;
        }
        // Start exited/stopped container to avoid reinstalling packages
        console.log(`Starting existing container: ${name}`);
        await container.start();
        return container;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking for existing container:', error.message);
    return null;
  }
}


// Create SSH container
async function createSSHContainer(labType = 'general') {
  try {
    console.log(`Creating SSH container for lab: ${labType}...`);
    
    // Create meaningful container name based on lab type
    const labNames = {
      'security-3': 'grep-lab',
      'basics-4': 'grep-lab',
      'basics-5': 'vim-lab',
      'scripting-1': 'git-lab',
      'scripting-3': 'text-processing-lab',
      'awk': 'awk-lab',
      'sed': 'sed-lab',
      'grep': 'grep-lab',
      'git': 'git-lab',
      'vim': 'vim-lab',
    };
    const baseName = labNames[labType] || labType || 'linux-lab';

    let container = await findExistingContainer(labType);
    if (container) {
      console.log('Reusing existing container');
    } else {
      const baseImage = await ensureLabBaseImage();
      console.log(`Using base image: ${baseImage}`);
      container = await docker.createContainer({
        name: baseName,
        Image: baseImage,
        Cmd: ['/bin/bash'],
        Tty: true,
        OpenStdin: true,
        Env: [
          'DEBIAN_FRONTEND=noninteractive',
          'PASSWORD=student123'
        ],
        HostConfig: {
          AutoRemove: false,
          Memory: 512 * 1024 * 1024,
          MemorySwap: 512 * 1024 * 1024,
        }
      });
      await container.start();
      console.log('New container started');
    }

    await runBootstrap(container);

    // Install lab-specific exercises
    console.log(`Checking lab type: ${labType}`);
    
    // Map lab types to exercise scripts
    const exerciseMap = {
      // Basics labs (1-5)
      'basics-1': 'basics-1-exercises.sh',
      'basics-2': 'basics-2-exercises.sh',
      'basics-3': 'basics-3-exercises.sh',
      'basics-4': 'basics-4-exercises.sh',
      'basics-5': 'basics-5-exercises.sh',
      
      // Filesystem labs (1-5)
      'filesystem-1': 'filesystem-1-exercises.sh',
      'filesystem-2': 'filesystem-2-exercises.sh',
      'filesystem-3': 'filesystem-3-exercises.sh',
      'filesystem-4': 'filesystem-4-exercises.sh',
      'filesystem-5': 'filesystem-5-exercises.sh',
      
      // Permissions labs (1-4)
      'permissions-1': 'permissions-1-exercises.sh',
      'permissions-2': 'permissions-2-exercises.sh',
      'permissions-3': 'permissions-3-exercises.sh',
      'permissions-4': 'permissions-4-exercises.sh',
      
      // Processes labs (1-4)
      'processes-1': 'processes-1-exercises.sh',
      'processes-2': 'processes-2-exercises.sh',
      'processes-3': 'processes-3-exercises.sh',
      'processes-4': 'processes-4-exercises.sh',
      
      // Networking labs (1-4)
      'networking-1': 'networking-1-exercises.sh',
      'networking-2': 'networking-2-exercises.sh',
      'networking-3': 'networking-3-exercises.sh',
      'networking-4': 'networking-4-exercises.sh',
      
      // Scripting labs (1-4)
      'scripting-1': 'scripting-1-exercises.sh',
      'scripting-2': 'scripting-2-exercises.sh',
      'scripting-3': 'scripting-3-exercises.sh',
      'scripting-4': 'scripting-4-exercises.sh',
      
      // Security labs (1-3)
      'security-1': 'security-1-exercises.sh',
      'security-2': 'security-2-exercises.sh',
      'security-3': 'security-3-exercises.sh',
      
      // Sysadmin labs (1-2)
      'sysadmin-1': 'sysadmin-1-exercises.sh',
      'sysadmin-2': 'sysadmin-2-exercises.sh',
      
      // Direct command labs (for special tool-focused labs)
      'awk': 'awk-exercises.sh',
      'sed': 'sed-exercises.sh',
      'grep': 'grep-exercises.sh',
      'git': 'git-exercises.sh',
      'vim': 'vim-exercises.sh',
      'text-processing': 'text-processing-exercises.sh',
    };

    const defaultLabType = 'basics-1';

    // Prefer a matching custom lab script; fall back to built-in map
    const customLabs = await loadCustomLabs();
    const customLab = customLabs.find((lab) => lab.id === labType);

    const exerciseScript = exerciseMap[labType] || exerciseMap[defaultLabType];
    const effectiveLabType = customLab ? labType : (exerciseMap[labType] ? labType : defaultLabType);

    // Resolve script path for built-in or custom labs
    const exerciseScriptPath = customLab
      ? (path.isAbsolute(customLab.scriptPath)
        ? customLab.scriptPath
        // Stored paths are relative to repo root (e.g., server/exercises/foo.sh)
        : path.join(__dirname, customLab.scriptPath.replace(/^server[\\/]/, '')))
      : (exerciseScript ? path.join(__dirname, 'exercises', exerciseScript) : null);

    if (exerciseScriptPath && fs.existsSync(exerciseScriptPath)) {
      const sourceLabel = customLab ? 'custom' : 'built-in';
      console.log(`Installing ${sourceLabel} script for lab ${labType} from ${exerciseScriptPath}...`);
      try {
        const runLabPath = path.join(__dirname, 'exercises', 'run-lab.sh');
        console.log(`Reading exercise script from: ${exerciseScriptPath}`);

        let scriptContent = await fsPromises.readFile(exerciseScriptPath, 'utf8');
        let runLabContent = '';
        try {
          await fsPromises.access(runLabPath);
          runLabContent = await fsPromises.readFile(runLabPath, 'utf8');
        } catch {
          // run-lab.sh not found, continue without it
        }

        // Remove any source line because the helper will be inlined
        scriptContent = scriptContent.replace(/source .*run-lab\.sh.*\n?/g, '');
        const combinedScript = `${scriptContent}\n${runLabContent}`;
        console.log(`Exercise script loaded, combined size: ${combinedScript.length} bytes`);
        
        const setupExec = await container.exec({
          Cmd: ['/bin/bash', '-c', combinedScript],
          AttachStdout: true,
          AttachStderr: true,
          User: 'student',
          Workdir: '/home/student',
          Env: [`HOME=/home/student`, `LAB_ID=${effectiveLabType}`]
        });
        const setupStream = await setupExec.start({ Detach: false, Tty: false });
        
        let exerciseOutput = '';
        await new Promise((resolve, reject) => {
          setupStream.on('data', (data) => {
            const output = data.toString();
            exerciseOutput += output;
            console.log('  Exercise setup:', output.substring(0, 100));
          });
          setupStream.on('end', resolve);
          setupStream.on('error', reject);
        });
        
        console.log(`✓ ${sourceLabel} script installed successfully as ${effectiveLabType}`);
        console.log('Full exercise output:', exerciseOutput);
      } catch (err) {
        console.error('Failed to install exercises:', err);
      }
    } else {
      console.log(`No exercises configured or script missing for lab type: ${labType}`);
    }

    const info = await container.inspect();
    const containerId = info.Id;
    const containerName = info.Name.replace('/', '');
    
    console.log(`✓ Container ${containerId.substring(0, 12)} created: ${containerName}`);
    
    return {
      container,
      containerId,
      containerName,
      created: Date.now()
    };
  } catch (error) {
    console.error('Error creating container:', error);
    throw error;
  }
}

// API endpoint to create a lab session
app.post('/api/sessions/create', async (req, res) => {
  try {
    const { labType } = req.body; // e.g., 'grep', 'ssh', 'docker'
    const dockerAvailable = await checkDocker();
    if (!dockerAvailable) {
      return res.status(503).json({ 
        error: 'Docker service is not available. Please start Docker Desktop.' 
      });
    }

    const containerInfo = await createSSHContainer(labType || 'general');
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    activeContainers.set(sessionId, containerInfo);
    
    // Auto-cleanup after 1 hour
    setTimeout(async () => {
      await cleanupSession(sessionId);
    }, 60 * 60 * 1000);

    res.json({
      sessionId,
      containerId: containerInfo.containerId ? containerInfo.containerId.substring(0, 12) : 'unknown',
      containerName: containerInfo.containerName || 'linux-lab',
      username: 'student',
      password: 'student123',
      message: 'SSH container ready'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      error: 'Failed to create lab session',
      details: error.message 
    });
  }
});

// API endpoint to list active sessions
app.get('/api/sessions', (req, res) => {
  const sessions = Array.from(activeContainers.entries()).map(([id, info]) => ({
    sessionId: id,
    containerId: info.id.substring(0, 12),
    created: new Date(info.created).toISOString()
  }));
  res.json({ sessions });
});

// API endpoint to delete a session
app.delete('/api/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const success = await cleanupSession(sessionId);
  
  if (success) {
    res.json({ message: 'Session terminated' });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// API endpoint to run lab validation (calls `finished` inside the container)
app.post('/api/sessions/:sessionId/check', async (req, res) => {
  const { sessionId } = req.params;
  const containerInfo = activeContainers.get(sessionId);

  if (!containerInfo) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const exec = await containerInfo.container.exec({
      Cmd: [
        '/bin/bash',
        '-lc',
        'if [ -x /usr/local/bin/finished ]; then sudo -u student /usr/local/bin/finished; ' +
        'elif [ -x "$HOME/bin/finished" ]; then sudo -u student "$HOME/bin/finished"; ' +
        'else echo "finished script not installed"; fi'
      ],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });

    const stream = await exec.start({ Detach: false, Tty: false });

    let output = '';
    await new Promise((resolve, reject) => {
      stream.on('data', (data) => {
        output += data.toString();
      });
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    res.json({ output });
  } catch (error) {
    console.error('Error running finished:', error);
    res.status(500).json({
      error: 'Failed to run finished',
      details: error.message
    });
  }
});

// List custom labs (manual)
app.get('/api/custom-labs', async (req, res) => {
  const labs = (await loadCustomLabs()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  res.json({ labs });
});

// Create a custom lab (manual) and persist metadata plus script
app.post('/api/custom-labs', async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      duration,
      objectives = [],
      commands = [],
      hints = [],
      script,
      topic = '',
      category
    } = req.body || {};

    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!description || !description.trim()) return res.status(400).json({ error: 'Description is required' });
    if (!script || !script.trim()) return res.status(400).json({ error: 'Script is required' });

    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    const diff = validDifficulties.includes((difficulty || '').toLowerCase()) ? difficulty.toLowerCase() : 'beginner';

    const normalizeArray = (arr) => Array.isArray(arr)
      ? arr.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim())
      : [];

    const recordCategory = (category && typeof category === 'string' && category.trim()) ? category.trim() : 'custom';
    const recordObjectives = normalizeArray(objectives);
    const recordCommands = normalizeArray(commands);
    const recordHints = normalizeArray(hints);

    const idBase = slugify(title);
    const id = `${idBase}-${randomUUID().split('-')[0]}`;
    const scriptFilename = `custom-${id}.sh`;
    const scriptPath = path.join(EXERCISES_DIR, scriptFilename);

    await fsPromises.writeFile(scriptPath, script, { encoding: 'utf8', mode: 0o755 });

    const labs = await loadCustomLabs();
    const record = {
      id,
      topic: topic.trim(),
      title: title.trim(),
      description: description.trim(),
      difficulty: diff,
      duration: duration?.trim() || '30 min',
      category: recordCategory,
      objectives: recordObjectives,
      commands: recordCommands,
      hints: recordHints,
      scriptPath: `server/exercises/${scriptFilename}`,
      createdAt: new Date().toISOString(),
    };

    labs.push(record);
    await saveCustomLabs(labs);

    res.json({ lab: record });
  } catch (error) {
    console.error('Custom lab creation failed:', error);
    res.status(500).json({ error: 'Failed to create custom lab', details: error.message });
  }
});

// Update an existing custom lab and its script
app.put('/api/custom-labs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      difficulty,
      duration,
      objectives = [],
      commands = [],
      hints = [],
      script,
      topic = '',
      category
    } = req.body || {};

    const labs = await loadCustomLabs();
    const idx = labs.findIndex((lab) => lab.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Lab not found' });

    const record = labs[idx];

    if (title && title.trim()) record.title = title.trim();
    if (description && description.trim()) record.description = description.trim();
    if (topic) record.topic = topic.trim();
    if (category && typeof category === 'string' && category.trim()) record.category = category.trim();

    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (difficulty && validDifficulties.includes(difficulty.toLowerCase())) {
      record.difficulty = difficulty.toLowerCase();
    }

    if (duration && typeof duration === 'string') record.duration = duration.trim();

    const normalizeArray = (arr) => Array.isArray(arr)
      ? arr.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim())
      : [];

    record.objectives = normalizeArray(objectives);
    record.commands = normalizeArray(commands);
    record.hints = normalizeArray(hints);

    if (script && typeof script === 'string') {
      const scriptPath = path.isAbsolute(record.scriptPath)
        ? record.scriptPath
        : path.join(__dirname, record.scriptPath.replace(/^server[\\/]/, ''));
      await fsPromises.writeFile(scriptPath, script, { encoding: 'utf8', mode: 0o755 });
    }

    record.updatedAt = new Date().toISOString();

    labs[idx] = record;
    await saveCustomLabs(labs);

    res.json({ lab: record });
  } catch (error) {
    console.error('Custom lab update failed:', error);
    res.status(500).json({ error: 'Failed to update custom lab', details: error.message });
  }
});

// Helper: Parse delimited sections from exec output
function parseSectionFromOutput(raw, sectionName) {
  const start = `___SECTION_START__${sectionName}___`;
  const end = `___SECTION_END__${sectionName}___`;
  const startIdx = raw.indexOf(start);
  const endIdx = raw.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return '';
  return raw.substring(startIdx + start.length, endIdx).trim();
}

// Helper: Build test script that runs syntax check + execution + tree snapshot
function buildTestScript(encodedScript) {
  return `
set -euo pipefail
  rm -rf /workspace && mkdir -p /workspace
cd /workspace
echo '${encodedScript}' | base64 -d > script.sh
chmod +x script.sh

syntax_status=0
run_status=0

bash -n script.sh >/tmp/syntax.out 2>/tmp/syntax.err || syntax_status=$?
/bin/bash script.sh >/tmp/run.out 2>/tmp/run.err || run_status=$?

find /workspace -maxdepth 12 -printf '%p (%y %s bytes)\n' > /tmp/tree.txt 2>/tmp/tree.err

echo "___SECTION_START__SYNTAX_OUT___"
cat /tmp/syntax.out /tmp/syntax.err 2>/dev/null || true
echo "___SECTION_END__SYNTAX_OUT___"

echo "___SECTION_START__RUN_OUT___"
cat /tmp/run.out /tmp/run.err 2>/dev/null || true
echo "___SECTION_END__RUN_OUT___"

echo "___SECTION_START__META___"
echo "syntax_status=\${syntax_status}"
echo "run_status=\${run_status}"
echo "___SECTION_END__META___"

echo "___SECTION_START__TREE___"
cat /tmp/tree.txt /tmp/tree.err 2>/dev/null || true
echo "___SECTION_END__TREE___"
`;
}

// Helper: Execute script in container and capture output
async function executeScriptInContainer(sandbox, execScript) {
  const exec = await sandbox.exec({
    Cmd: ['/bin/bash', '-lc', execScript],
    AttachStdout: true,
    AttachStderr: true,
    Env: ['HOME=/workspace'],
    WorkingDir: '/workspace'
  });

  const logs = await exec.start({ Detach: false, Tty: false });
  let raw = '';
  
  await new Promise((resolve, reject) => {
    logs.on('data', (chunk) => { raw += chunk.toString(); });
    logs.on('end', resolve);
    logs.on('error', reject);
  });

  const execInspect = await exec.inspect().catch(() => ({ ExitCode: 1 }));
  const statusCode = typeof execInspect?.ExitCode === 'number' ? execInspect.ExitCode : 1;

  return { raw, statusCode };
}

// Test a custom script with syntax check + full run + tree snapshot (reuses a single sandbox container)
app.post('/api/custom-labs/test', async (req, res) => {
  const { script } = req.body || {};

  if (!script || typeof script !== 'string' || !script.trim()) {
    return res.status(400).json({ error: 'Script is required' });
  }

  const dockerAvailable = await checkDocker();
  if (!dockerAvailable) {
    return res.status(503).json({ error: 'Docker service is not available. Please start Docker Desktop.' });
  }

  try {
    const sandbox = await getOrCreateTestSandbox();
    const encoded = Buffer.from(script, 'utf8').toString('base64');
    const execScript = buildTestScript(encoded);

    const { raw, statusCode } = await executeScriptInContainer(sandbox, execScript);

    const syntaxOutput = parseSectionFromOutput(raw, 'SYNTAX_OUT');
    const runOutput = parseSectionFromOutput(raw, 'RUN_OUT');
    const meta = parseSectionFromOutput(raw, 'META');
    const tree = parseSectionFromOutput(raw, 'TREE');

    const rawFallback = raw.trim();
    const syntaxMatch = meta.match(/syntax_status=(\d+)/);
    const runMatch = meta.match(/run_status=(\d+)/);

    const syntaxStatus = syntaxMatch ? Number(syntaxMatch[1]) : statusCode;
    const runStatus = runMatch ? Number(runMatch[1]) : statusCode;

    return res.json({
      ok: syntaxStatus === 0 && runStatus === 0,
      syntaxStatus,
      runStatus,
      syntaxOutput: syntaxOutput || rawFallback,
      runOutput: runOutput || rawFallback,
      tree,
      raw: rawFallback,
      statusCode
    });
  } catch (error) {
    console.error('Script test failed:', error);
    return res.status(500).json({ error: 'Failed to test script', details: error.message });
  }
});

// Run a custom script in a full SSH container, keep it alive, and return a session + tree
app.post('/api/custom-labs/preview', async (req, res) => {
  const { script } = req.body || {};

  if (!script || typeof script !== 'string' || !script.trim()) {
    return res.status(400).json({ error: 'Script is required' });
  }

  const dockerAvailable = await checkDocker();
  if (!dockerAvailable) {
    return res.status(503).json({ error: 'Docker service is not available. Please start Docker Desktop.' });
  }

  try {
    const containerInfo = await createSSHContainer('custom-preview');
    const sessionId = Math.random().toString(36).substring(2, 15);
    activeContainers.set(sessionId, containerInfo);
    setTimeout(async () => {
      await cleanupSession(sessionId);
    }, 60 * 60 * 1000);

    const encoded = Buffer.from(script, 'utf8').toString('base64');
    const execScript = `
set -euo pipefail
WORK=/home/student/custom-preview
rm -rf "$WORK"
mkdir -p "$WORK"
cd "$WORK"
echo '${encoded}' | base64 -d > script.sh
chmod +x script.sh

syntax_status=0
run_status=0

bash -n script.sh >/tmp/syntax.out 2>/tmp/syntax.err || syntax_status=$?
/bin/bash script.sh >/tmp/run.out 2>/tmp/run.err || run_status=$?

find "$WORK" -maxdepth 12 -printf '%p (%y %s bytes)\n' > /tmp/tree.txt 2>/tmp/tree.err

echo "___SECTION_START__SYNTAX_OUT___"
cat /tmp/syntax.out /tmp/syntax.err 2>/dev/null || true
echo "___SECTION_END__SYNTAX_OUT___"

echo "___SECTION_START__RUN_OUT___"
cat /tmp/run.out /tmp/run.err 2>/dev/null || true
echo "___SECTION_END__RUN_OUT___"

echo "___SECTION_START__META___"
echo "syntax_status=\${syntax_status}"
echo "run_status=\${run_status}"
echo "___SECTION_END__META___"

echo "___SECTION_START__TREE___"
cat /tmp/tree.txt /tmp/tree.err 2>/dev/null || true
echo "___SECTION_END__TREE___"
`;

    const exec = await containerInfo.container.exec({
      Cmd: ['/bin/bash', '-lc', execScript],
      AttachStdout: true,
      AttachStderr: true,
      User: 'student',
      Workdir: '/home/student/custom-preview',
      Env: ['HOME=/home/student']
    });

    const stream = await exec.start({ Detach: false, Tty: false });

    let raw = '';
    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => { raw += chunk.toString(); });
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const getSection = (name) => {
      const start = `___SECTION_START__${name}___`;
      const end = `___SECTION_END__${name}___`;
      const startIdx = raw.indexOf(start);
      const endIdx = raw.indexOf(end);
      if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return '';
      return raw.substring(startIdx + start.length, endIdx).trim();
    };

    const syntaxOutput = getSection('SYNTAX_OUT');
    const runOutput = getSection('RUN_OUT');
    const meta = getSection('META');
    const tree = getSection('TREE');

    const syntaxMatch = meta.match(/syntax_status=(\d+)/);
    const runMatch = meta.match(/run_status=(\d+)/);

    const syntaxStatus = syntaxMatch ? Number(syntaxMatch[1]) : 0;
    const runStatus = runMatch ? Number(runMatch[1]) : 0;

    return res.json({
      sessionId,
      containerName: containerInfo.containerName,
      ok: syntaxStatus === 0 && runStatus === 0,
      syntaxStatus,
      runStatus,
      syntaxOutput,
      runOutput,
      tree,
    });
  } catch (error) {
    console.error('Preview sandbox failed:', error);
    return res.status(500).json({ error: 'Failed to start preview sandbox', details: error.message });
  }
});

// Cleanup session
async function cleanupSession(sessionId) {
  const containerInfo = activeContainers.get(sessionId);
  if (containerInfo) {
    try {
      await containerInfo.container.stop();
      console.log(`✓ Container ${containerInfo.containerId ? containerInfo.containerId.substring(0, 12) : 'unknown'} stopped`);
    } catch (error) {
      console.error('Error stopping container:', error.message);
    }
    activeContainers.delete(sessionId);
    return true;
  }
  return false;
}

// WebSocket connection for terminal
wss.on('connection', async (ws, req) => {
  const sessionId = new URL(req.url, 'http://localhost').searchParams.get('sessionId');
  
  console.log(`WebSocket connection attempt for session: ${sessionId}`);
  
  if (!sessionId || !activeContainers.has(sessionId)) {
    console.error(`Invalid session ID: ${sessionId}`);
    ws.send(JSON.stringify({ type: 'error', data: 'Invalid or expired session' }));
    ws.close();
    return;
  }

  const containerInfo = activeContainers.get(sessionId);
  let ptyProcess = null;

  try {
    console.log(`Setting up terminal for container: ${containerInfo.containerId ? containerInfo.containerId.substring(0, 12) : 'unknown'}`);
    // Execute bash in the container
    const exec = await containerInfo.container.exec({
      Cmd: ['/bin/bash'],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      User: 'student',
      WorkingDir: '/home/student'
    });

    const stream = await exec.start({ hijack: true, stdin: true, Tty: true });
    console.log('Terminal stream started');

    // Forward container output to WebSocket
    stream.on('data', (data) => {
      const output = data.toString('utf8');
      console.log('Container output:', output.substring(0, 100));
      ws.send(JSON.stringify({ type: 'data', data: output }));
    });

    // Forward WebSocket input to container
    ws.on('message', (message) => {
      try {
        const msg = JSON.parse(message);
        if (msg.type === 'input') {
          stream.write(msg.data);
        } else if (msg.type === 'resize') {
          exec.resize({ h: msg.rows, w: msg.cols });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      stream.end();
      console.log(`WebSocket closed for session ${sessionId}`);
    });

    stream.on('end', () => {
      ws.close();
    });

    // Send welcome message
    setTimeout(() => {
      const welcomeScript = [
        'stty -echo',
        'clear',
        'cat <<EOW',
        '========================================',
        '  Welcome to Linux Lab Forge - REAL CONTAINER!',
        '========================================',
        '',
        'Container Info:',
        '$(uname -a)',
        '',
        'You are: $(whoami)',
        'Home: $(pwd)',
        '',
        'Try: ls, pwd, cd, grep, or any Linux command!',
        '',
        'EOW',
        'if [ -f /home/student/grep-lab/EXERCISES.txt ]; then echo "📚 Exercises available! Run: cd grep-lab && cat EXERCISES.txt"; echo "✅ When done, run: finished"; echo ""; fi',
        'stty echo'
      ].join('\n');

      stream.write(`${welcomeScript}\n`);
    }, 500);

  } catch (error) {
    console.error('Error setting up terminal:', error);
    ws.send(JSON.stringify({ type: 'error', data: error.message }));
    ws.close();
  }
});

// Health check
app.get('/health', async (req, res) => {
  const dockerAvailable = await checkDocker();
  res.json({ 
    status: 'ok',
    docker: dockerAvailable,
    activeSessions: activeContainers.size
  });
});

// Cleanup on server shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  for (const [sessionId] of activeContainers) {
    await cleanupSession(sessionId);
  }
  process.exit(0);
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Linux Lab Forge Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket terminal available at ws://localhost:${PORT}/terminal`);
  checkDocker();
});
