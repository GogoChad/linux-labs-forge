export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LabCategory = 'basics' | 'filesystem' | 'permissions' | 'processes' | 'networking' | 'scripting' | 'security' | 'system-admin' | 'custom';

export interface Lab {
  id: string;
  title: string;
  description: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  duration: string;
  objectives: string[];
  commands: string[];
  hints: string[];
  completed?: boolean;
}

import customLabsData from './custom-labs.json';

type CustomLabInput = {
  id: string;
  title: string;
  description: string;
  difficulty?: LabDifficulty;
  duration?: string;
  objectives?: string[];
  commands?: string[];
  hints?: string[];
};

export const categoryInfo: Record<LabCategory, { name: string; icon: string; color: string }> = {
  basics: { name: 'Linux Basics', icon: '📚', color: 'from-emerald-500 to-green-600' },
  filesystem: { name: 'File System', icon: '📁', color: 'from-blue-500 to-cyan-600' },
  permissions: { name: 'Permissions', icon: '🔐', color: 'from-amber-500 to-orange-600' },
  processes: { name: 'Processes', icon: '⚙️', color: 'from-purple-500 to-violet-600' },
  networking: { name: 'Networking', icon: '🌐', color: 'from-pink-500 to-rose-600' },
  scripting: { name: 'Shell Scripting', icon: '📜', color: 'from-cyan-500 to-teal-600' },
  security: { name: 'Security', icon: '🛡️', color: 'from-red-500 to-rose-600' },
  'system-admin': { name: 'System Admin', icon: '🖥️', color: 'from-indigo-500 to-purple-600' },
  custom: { name: 'Custom Labs', icon: '🛠️', color: 'from-slate-500 to-slate-700' },
};

const coreLabs: Lab[] = [
  // BASICS (5 labs)
  {
    id: 'basics-1',
    title: 'Your First Terminal Commands',
    description: 'Learn to navigate the terminal with basic commands like pwd, ls, and cd.',
    category: 'basics',
    difficulty: 'beginner',
    duration: '15 min',
    objectives: [
      'Understand what the terminal is',
      'Use pwd to print working directory',
      'List files with ls and its options',
      'Navigate directories with cd',
    ],
    commands: ['pwd', 'ls', 'ls -la', 'cd', 'cd ..', 'cd ~'],
    hints: ['Try ls -la to see hidden files', 'Use cd ~ to go to your home directory'],
  },
  {
    id: 'basics-2',
    title: 'Creating and Removing Files',
    description: 'Master file creation with touch and removal with rm.',
    category: 'basics',
    difficulty: 'beginner',
    duration: '15 min',
    objectives: [
      'Create empty files with touch',
      'Remove files with rm',
      'Understand the dangers of rm -rf',
      'Use wildcards for batch operations',
    ],
    commands: ['touch', 'rm', 'rm -i', 'rm -rf'],
    hints: ['Always use rm -i when learning to confirm deletions'],
  },
  {
    id: 'basics-3',
    title: 'Working with Directories',
    description: 'Create, remove, and organize directories effectively.',
    category: 'basics',
    difficulty: 'beginner',
    duration: '20 min',
    objectives: [
      'Create directories with mkdir',
      'Create nested directories with mkdir -p',
      'Remove directories with rmdir and rm -r',
      'Copy and move directories',
    ],
    commands: ['mkdir', 'mkdir -p', 'rmdir', 'rm -r', 'cp -r', 'mv'],
    hints: ['mkdir -p creates parent directories automatically'],
  },
  {
    id: 'basics-4',
    title: 'Viewing File Contents',
    description: 'Learn multiple ways to view and explore file contents.',
    category: 'basics',
    difficulty: 'beginner',
    duration: '20 min',
    objectives: [
      'View entire files with cat',
      'Page through files with less',
      'View file beginnings with head',
      'View file endings with tail',
    ],
    commands: ['cat', 'less', 'head', 'tail', 'tail -f'],
    hints: ['Use tail -f to follow log files in real-time'],
  },
  {
    id: 'basics-5',
    title: 'Getting Help in Linux',
    description: 'Discover how to find help for any command.',
    category: 'basics',
    difficulty: 'beginner',
    duration: '15 min',
    objectives: [
      'Use man pages effectively',
      'Get quick help with --help',
      'Search man pages with apropos',
      'Understand man page sections',
    ],
    commands: ['man', '--help', 'apropos', 'whatis', 'info'],
    hints: ['Press q to exit man pages', 'Use / to search within man pages'],
  },

  // FILESYSTEM (5 labs)
  {
    id: 'filesystem-1',
    title: 'Understanding the Linux Filesystem',
    description: 'Explore the Linux directory structure and its purpose.',
    category: 'filesystem',
    difficulty: 'beginner',
    duration: '25 min',
    objectives: [
      'Understand the root filesystem hierarchy',
      'Know the purpose of /bin, /etc, /home, /var',
      'Navigate between important directories',
      'Identify system vs user directories',
    ],
    commands: ['ls /', 'cd /etc', 'cd /var/log', 'tree'],
    hints: ['/etc contains configuration files', '/var contains variable data like logs'],
  },
  {
    id: 'filesystem-2',
    title: 'Finding Files with find',
    description: 'Master the powerful find command for locating files.',
    category: 'filesystem',
    difficulty: 'intermediate',
    duration: '30 min',
    objectives: [
      'Find files by name',
      'Find files by type',
      'Find files by size and modification time',
      'Execute commands on found files',
    ],
    commands: ['find . -name', 'find -type f', 'find -size', 'find -mtime', 'find -exec'],
    hints: ['Use -iname for case-insensitive search'],
  },
  {
    id: 'filesystem-3',
    title: 'Searching File Contents with grep',
    description: 'Use grep to search within files for patterns.',
    category: 'filesystem',
    difficulty: 'intermediate',
    duration: '25 min',
    objectives: [
      'Search for patterns in files',
      'Use recursive grep',
      'Understand basic regular expressions',
      'Combine grep with other commands',
    ],
    commands: ['grep', 'grep -r', 'grep -i', 'grep -v', 'grep -E'],
    hints: ['Use grep -n to show line numbers'],
  },
  {
    id: 'filesystem-4',
    title: 'Disk Usage and Management',
    description: 'Monitor and manage disk space on your system.',
    category: 'filesystem',
    difficulty: 'intermediate',
    duration: '20 min',
    objectives: [
      'Check disk usage with df',
      'Find large files with du',
      'Understand mount points',
      'Identify disk space issues',
    ],
    commands: ['df -h', 'du -sh', 'du -h --max-depth=1', 'lsblk'],
    hints: ['du -sh * shows size of each item in current directory'],
  },
  {
    id: 'filesystem-5',
    title: 'Symbolic and Hard Links',
    description: 'Create and understand file links in Linux.',
    category: 'filesystem',
    difficulty: 'intermediate',
    duration: '25 min',
    objectives: [
      'Understand the difference between hard and soft links',
      'Create symbolic links with ln -s',
      'Create hard links',
      'Identify and manage links',
    ],
    commands: ['ln', 'ln -s', 'ls -l', 'readlink'],
    hints: ['Symbolic links can cross filesystems, hard links cannot'],
  },

  // PERMISSIONS (4 labs)
  {
    id: 'permissions-1',
    title: 'Understanding File Permissions',
    description: 'Learn to read and understand Linux file permissions.',
    category: 'permissions',
    difficulty: 'beginner',
    duration: '25 min',
    objectives: [
      'Read permission strings (rwxr-xr-x)',
      'Understand user, group, and other permissions',
      'Identify file ownership',
      'Check your own permissions',
    ],
    commands: ['ls -l', 'stat', 'id', 'groups'],
    hints: ['r=4, w=2, x=1 in octal notation'],
  },
  {
    id: 'permissions-2',
    title: 'Changing Permissions with chmod',
    description: 'Modify file permissions using symbolic and octal notation.',
    category: 'permissions',
    difficulty: 'intermediate',
    duration: '30 min',
    objectives: [
      'Use chmod with symbolic notation (u+x)',
      'Use chmod with octal notation (755)',
      'Apply permissions recursively',
      'Set default permissions',
    ],
    commands: ['chmod', 'chmod +x', 'chmod 755', 'chmod -R'],
    hints: ['755 is common for directories, 644 for files'],
  },
  {
    id: 'permissions-3',
    title: 'File Ownership with chown',
    description: 'Change file and directory ownership.',
    category: 'permissions',
    difficulty: 'intermediate',
    duration: '20 min',
    objectives: [
      'Change file owner with chown',
      'Change file group with chgrp',
      'Change owner and group together',
      'Apply ownership recursively',
    ],
    commands: ['chown', 'chgrp', 'chown user:group', 'chown -R'],
    hints: ['You need sudo to change ownership to another user'],
  },
  {
    id: 'permissions-4',
    title: 'Special Permissions: SUID, SGID, Sticky Bit',
    description: 'Understand and apply special permission bits.',
    category: 'permissions',
    difficulty: 'advanced',
    duration: '35 min',
    objectives: [
      'Understand SUID and its security implications',
      'Use SGID for shared directories',
      'Apply sticky bit to directories',
      'Find files with special permissions',
    ],
    commands: ['chmod u+s', 'chmod g+s', 'chmod +t', 'find -perm'],
    hints: ['The sticky bit prevents users from deleting others\' files'],
  },

  // PROCESSES (4 labs)
  {
    id: 'processes-1',
    title: 'Viewing Running Processes',
    description: 'Monitor and understand running processes on your system.',
    category: 'processes',
    difficulty: 'beginner',
    duration: '20 min',
    objectives: [
      'View processes with ps',
      'Use top for real-time monitoring',
      'Understand process states',
      'Identify resource-heavy processes',
    ],
    commands: ['ps', 'ps aux', 'top', 'htop', 'pgrep'],
    hints: ['Press q to exit top', 'Use htop for a friendlier interface'],
  },
  {
    id: 'processes-2',
    title: 'Managing Processes',
    description: 'Control processes: start, stop, and signal them.',
    category: 'processes',
    difficulty: 'intermediate',
    duration: '25 min',
    objectives: [
      'Send signals to processes with kill',
      'Understand common signals (SIGTERM, SIGKILL)',
      'Kill processes by name with pkill',
      'Use nice and renice for priority',
    ],
    commands: ['kill', 'kill -9', 'pkill', 'killall', 'nice', 'renice'],
    hints: ['Always try SIGTERM before SIGKILL'],
  },
  {
    id: 'processes-3',
    title: 'Background Jobs and Job Control',
    description: 'Run processes in background and manage jobs.',
    category: 'processes',
    difficulty: 'intermediate',
    duration: '25 min',
    objectives: [
      'Run commands in background with &',
      'Use jobs, fg, and bg',
      'Understand Ctrl+Z vs Ctrl+C',
      'Use nohup for persistent processes',
    ],
    commands: ['&', 'jobs', 'fg', 'bg', 'nohup', 'disown'],
    hints: ['nohup allows processes to continue after logout'],
  },
  {
    id: 'processes-4',
    title: 'System Services with systemctl',
    description: 'Manage system services using systemd.',
    category: 'processes',
    difficulty: 'advanced',
    duration: '30 min',
    objectives: [
      'Start and stop services',
      'Enable services at boot',
      'Check service status',
      'View service logs with journalctl',
    ],
    commands: ['systemctl start', 'systemctl stop', 'systemctl enable', 'systemctl status', 'journalctl'],
    hints: ['Use journalctl -f to follow logs in real-time'],
  },

  // NETWORKING (4 labs)
  {
    id: 'networking-1',
    title: 'Network Configuration Basics',
    description: 'View and understand your network configuration.',
    category: 'networking',
    difficulty: 'beginner',
    duration: '20 min',
    objectives: [
      'View IP addresses with ip or ifconfig',
      'Understand network interfaces',
      'Check routing table',
      'View DNS configuration',
    ],
    commands: ['ip addr', 'ip route', 'cat /etc/resolv.conf', 'hostname'],
    hints: ['ip has largely replaced ifconfig on modern systems'],
  },
  {
    id: 'networking-2',
    title: 'Testing Network Connectivity',
    description: 'Diagnose network issues with essential tools.',
    category: 'networking',
    difficulty: 'intermediate',
    duration: '25 min',
    objectives: [
      'Test connectivity with ping',
      'Trace routes with traceroute',
      'Check open ports with netstat/ss',
      'Test DNS with dig and nslookup',
    ],
    commands: ['ping', 'traceroute', 'ss -tuln', 'dig', 'nslookup'],
    hints: ['ss is the modern replacement for netstat'],
  },
  {
    id: 'networking-3',
    title: 'Downloading Files from the Web',
    description: 'Use curl and wget to download files and interact with APIs.',
    category: 'networking',
    difficulty: 'intermediate',
    duration: '25 min',
    objectives: [
      'Download files with wget',
      'Use curl for HTTP requests',
      'Send POST requests with curl',
      'Handle authentication and headers',
    ],
    commands: ['wget', 'curl', 'curl -O', 'curl -X POST', 'curl -H'],
    hints: ['Use curl -I to only fetch headers'],
  },
  {
    id: 'networking-4',
    title: 'SSH Remote Access',
    description: 'Connect to remote systems securely with SSH.',
    category: 'networking',
    difficulty: 'intermediate',
    duration: '30 min',
    objectives: [
      'Connect to remote systems with ssh',
      'Use SSH keys for authentication',
      'Transfer files with scp and rsync',
      'Configure SSH client',
    ],
    commands: ['ssh', 'ssh-keygen', 'ssh-copy-id', 'scp', 'rsync'],
    hints: ['Use ssh-agent to avoid typing your passphrase repeatedly'],
  },

  // SCRIPTING (4 labs)
  {
    id: 'scripting-1',
    title: 'Your First Bash Script',
    description: 'Create and run your first shell script.',
    category: 'scripting',
    difficulty: 'beginner',
    duration: '25 min',
    objectives: [
      'Create a script with shebang',
      'Make scripts executable',
      'Use variables in scripts',
      'Accept command-line arguments',
    ],
    commands: ['#!/bin/bash', 'chmod +x', '$1 $2', 'echo'],
    hints: ['Always start with #!/bin/bash'],
  },
  {
    id: 'scripting-2',
    title: 'Conditionals and Loops',
    description: 'Add logic to your scripts with if statements and loops.',
    category: 'scripting',
    difficulty: 'intermediate',
    duration: '35 min',
    objectives: [
      'Write if-else statements',
      'Use for and while loops',
      'Test conditions with [ ]',
      'Handle multiple conditions with case',
    ],
    commands: ['if', 'for', 'while', 'case', 'test'],
    hints: ['Use [[ ]] for more advanced tests in bash'],
  },
  {
    id: 'scripting-3',
    title: 'Text Processing with awk and sed',
    description: 'Master text processing for log analysis and data manipulation.',
    category: 'scripting',
    difficulty: 'advanced',
    duration: '40 min',
    objectives: [
      'Extract columns with awk',
      'Find and replace with sed',
      'Process log files',
      'Combine awk and sed in pipelines',
    ],
    commands: ['awk', 'sed', 'cut', 'sort', 'uniq'],
    hints: ['awk \'{print $1}\' prints the first column'],
  },
  {
    id: 'scripting-4',
    title: 'Automation with Cron Jobs',
    description: 'Schedule scripts to run automatically.',
    category: 'scripting',
    difficulty: 'intermediate',
    duration: '25 min',
    objectives: [
      'Understand cron syntax',
      'Edit crontab',
      'Set up scheduled tasks',
      'Debug cron job issues',
    ],
    commands: ['crontab -e', 'crontab -l', '/etc/crontab'],
    hints: ['Use crontab.guru to help with cron syntax'],
  },

  // SECURITY (3 labs)
  {
    id: 'security-1',
    title: 'User and Password Management',
    description: 'Manage users and understand Linux authentication.',
    category: 'security',
    difficulty: 'intermediate',
    duration: '30 min',
    objectives: [
      'Add and remove users',
      'Set and change passwords',
      'Understand /etc/passwd and /etc/shadow',
      'Manage user groups',
    ],
    commands: ['useradd', 'userdel', 'passwd', 'usermod', 'groupadd'],
    hints: ['Use useradd -m to create home directory automatically'],
  },
  {
    id: 'security-2',
    title: 'Basic Firewall with iptables/ufw',
    description: 'Configure firewall rules to secure your system.',
    category: 'security',
    difficulty: 'advanced',
    duration: '35 min',
    objectives: [
      'Understand firewall concepts',
      'Use ufw for simple firewall management',
      'Allow and deny specific ports',
      'Check firewall status',
    ],
    commands: ['ufw enable', 'ufw allow', 'ufw deny', 'ufw status'],
    hints: ['Always allow SSH before enabling firewall!'],
  },
  {
    id: 'security-3',
    title: 'SSH Remote Access and Key Management',
    description: 'Master secure remote access with SSH, including key generation, configuration, and best practices for secure connections.',
    category: 'security',
    difficulty: 'intermediate',
    duration: '40 min',
    objectives: [
      'Understand SSH protocol and its security benefits',
      'Generate and manage SSH key pairs',
      'Configure SSH client and server settings',
      'Use SSH for secure remote command execution',
      'Set up passwordless SSH authentication',
      'Troubleshoot common SSH connection issues',
    ],
    commands: [
      'ssh user@hostname',
      'ssh-keygen -t rsa -b 4096',
      'ssh-copy-id user@hostname',
      'ssh -i ~/.ssh/id_rsa user@hostname',
      'ssh-add ~/.ssh/id_rsa',
      'ssh -v user@hostname',
      'scp file.txt user@hostname:/path/',
      'ssh user@hostname "command"',
      'cat ~/.ssh/authorized_keys',
      'chmod 600 ~/.ssh/id_rsa',
    ],
    hints: [
      'Always use strong key pairs (RSA 4096-bit or Ed25519)',
      'Keep private keys secure with appropriate permissions (600)',
      'Use ssh-agent to manage multiple keys',
      'Add -v flag for verbose output when troubleshooting',
      'Disable password authentication after setting up keys for better security',
    ],
  },

  // SYSTEM ADMIN (2 labs)
  {
    id: 'sysadmin-1',
    title: 'Package Management',
    description: 'Install, update, and remove software packages.',
    category: 'system-admin',
    difficulty: 'beginner',
    duration: '25 min',
    objectives: [
      'Update package lists',
      'Install and remove packages',
      'Search for packages',
      'Understand apt vs apt-get',
    ],
    commands: ['apt update', 'apt install', 'apt remove', 'apt search', 'dpkg'],
    hints: ['Always run apt update before installing new packages'],
  },
  {
    id: 'sysadmin-2',
    title: 'System Monitoring and Logs',
    description: 'Monitor system health and analyze logs.',
    category: 'system-admin',
    difficulty: 'intermediate',
    duration: '30 min',
    objectives: [
      'Check system uptime and load',
      'Monitor memory usage',
      'View system logs',
      'Use dmesg for kernel messages',
    ],
    commands: ['uptime', 'free -h', 'dmesg', 'journalctl', '/var/log/'],
    hints: ['Use watch to repeatedly run commands for monitoring'],
  },
];

const customLabs: Lab[] = (customLabsData as CustomLabInput[]).map((lab) => ({
  id: lab.id,
  title: lab.title,
  description: lab.description,
  category: 'custom' as LabCategory,
  difficulty: lab.difficulty || 'beginner',
  duration: lab.duration || '30 min',
  objectives: lab.objectives || [],
  commands: lab.commands || [],
  hints: lab.hints || [],
  completed: false,
}));

export const labs: Lab[] = [...coreLabs, ...customLabs];

export const getLabsByCategory = (category: LabCategory) => 
  labs.filter(lab => lab.category === category);

export const getLabById = (id: string) => 
  labs.find(lab => lab.id === id);

export const getLabsByDifficulty = (difficulty: LabDifficulty) => 
  labs.filter(lab => lab.difficulty === difficulty);
