import { LabDifficulty } from '@/data/labs';

export interface GeneratedLab {
  title: string;
  description: string;
  difficulty: LabDifficulty;
  duration: string;
  objectives: string[];
  commands: string[];
  hints: string[];
}

interface LabTemplate {
  keywords: string[];
  title: string;
  description: string;
  difficulty: LabDifficulty;
  duration: string;
  objectives: string[];
  commands: string[];
  hints: string[];
}

const labTemplates: LabTemplate[] = [
  {
    keywords: ['ssh', 'secure shell', 'remote access', 'remote connection'],
    title: 'SSH Remote Access and Key Management',
    description: 'Master secure remote access with SSH, including key generation, configuration, and best practices for secure connections.',
    difficulty: 'intermediate',
    duration: '35 min',
    objectives: [
      'Understand SSH protocol and its security benefits',
      'Generate and manage SSH key pairs',
      'Configure SSH client and server settings',
      'Use SSH for secure remote command execution',
      'Set up passwordless SSH authentication',
      'Troubleshoot common SSH connection issues'
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
      'chmod 600 ~/.ssh/id_rsa'
    ],
    hints: [
      'Always use strong key pairs (RSA 4096-bit or Ed25519)',
      'Keep private keys secure with appropriate permissions (600)',
      'Use ssh-agent to manage multiple keys',
      'Add -v flag for verbose output when troubleshooting',
      'Disable password authentication after setting up keys for better security'
    ]
  },
  {
    keywords: ['docker', 'container', 'containerization', 'image'],
    title: 'Docker Container Management Essentials',
    description: 'Learn to create, manage, and orchestrate Docker containers for modern application deployment.',
    difficulty: 'intermediate',
    duration: '40 min',
    objectives: [
      'Understand containerization concepts',
      'Pull and run Docker images',
      'Create custom Docker images with Dockerfile',
      'Manage container lifecycle',
      'Map ports and volumes for data persistence',
      'Use Docker Compose for multi-container applications'
    ],
    commands: [
      'docker pull ubuntu:latest',
      'docker run -it ubuntu bash',
      'docker ps',
      'docker ps -a',
      'docker stop container_id',
      'docker rm container_id',
      'docker images',
      'docker build -t myapp .',
      'docker run -p 8080:80 myapp',
      'docker-compose up -d'
    ],
    hints: [
      'Use docker logs to debug container issues',
      'Always clean up stopped containers to save space',
      'Use .dockerignore to exclude unnecessary files',
      'Mount volumes for persistent data storage',
      'Tag images meaningfully for version control'
    ]
  },
  {
    keywords: ['git', 'version control', 'repository', 'commit', 'branch'],
    title: 'Git Version Control Fundamentals',
    description: 'Master Git for version control, collaborative development, and code management.',
    difficulty: 'beginner',
    duration: '30 min',
    objectives: [
      'Initialize and configure Git repositories',
      'Track and commit changes effectively',
      'Work with branches and merging',
      'Collaborate using remote repositories',
      'Resolve merge conflicts',
      'Use Git history and logs'
    ],
    commands: [
      'git init',
      'git config --global user.name "Your Name"',
      'git config --global user.email "email@example.com"',
      'git add .',
      'git commit -m "message"',
      'git status',
      'git log',
      'git branch feature',
      'git checkout feature',
      'git merge feature',
      'git push origin main',
      'git pull origin main'
    ],
    hints: [
      'Write clear, descriptive commit messages',
      'Commit early and often',
      'Use branches for new features',
      'Pull before you push to avoid conflicts',
      'Use git status frequently to check your work'
    ]
  },
  {
    keywords: ['vim', 'vi', 'text editor', 'editor'],
    title: 'Vim Text Editor Mastery',
    description: 'Learn the powerful Vim editor for efficient text editing in the terminal.',
    difficulty: 'beginner',
    duration: '25 min',
    objectives: [
      'Navigate Vim modes (Normal, Insert, Visual)',
      'Perform basic text editing operations',
      'Use motion commands for efficient navigation',
      'Search and replace text',
      'Save and quit Vim properly',
      'Use visual mode for selection'
    ],
    commands: [
      'vim filename',
      'i (insert mode)',
      'Esc (normal mode)',
      ':w (save)',
      ':q (quit)',
      ':wq (save and quit)',
      'dd (delete line)',
      'yy (copy line)',
      'p (paste)',
      '/pattern (search)',
      ':%s/old/new/g (replace all)'
    ],
    hints: [
      'Press Esc to return to normal mode from any mode',
      'Use :q! to quit without saving',
      'h, j, k, l for left, down, up, right navigation',
      'Use . to repeat the last command',
      'Practice with vimtutor command'
    ]
  },
  {
    keywords: ['awk', 'text processing', 'log', 'analysis', 'parsing'],
    title: 'Log File Analysis with AWK',
    description: 'Master AWK for powerful text processing and log file analysis.',
    difficulty: 'intermediate',
    duration: '30 min',
    objectives: [
      'Understand AWK syntax and structure',
      'Process and filter text files',
      'Extract specific columns from data',
      'Perform calculations on data',
      'Use patterns and conditions',
      'Generate formatted reports from logs'
    ],
    commands: [
      'awk \'{print $1}\' file.txt',
      'awk \'/pattern/ {print $0}\' file.txt',
      'awk -F: \'{print $1,$3}\' /etc/passwd',
      'awk \'$3 > 100 {print $1}\' data.txt',
      'awk \'{sum+=$1} END {print sum}\' numbers.txt',
      'awk \'NR==5\' file.txt',
      'awk \'{print NR, $0}\' file.txt',
      'awk \'BEGIN {print "Start"} {print} END {print "End"}\' file.txt'
    ],
    hints: [
      '$0 represents the entire line, $1, $2... represent fields',
      'Use -F to specify field separator',
      'NR is the current record number',
      'NF is the number of fields in current record',
      'Combine with pipes for complex processing'
    ]
  },
  {
    keywords: ['lamp', 'apache', 'mysql', 'php', 'web server', 'stack'],
    title: 'LAMP Stack Setup and Configuration',
    description: 'Set up a complete LAMP (Linux, Apache, MySQL, PHP) stack for web development.',
    difficulty: 'advanced',
    duration: '45 min',
    objectives: [
      'Install and configure Apache web server',
      'Set up MySQL database server',
      'Install and configure PHP',
      'Create virtual hosts',
      'Secure the installation',
      'Test the complete stack'
    ],
    commands: [
      'sudo apt update',
      'sudo apt install apache2',
      'sudo systemctl start apache2',
      'sudo apt install mysql-server',
      'sudo mysql_secure_installation',
      'sudo apt install php libapache2-mod-php php-mysql',
      'sudo systemctl restart apache2',
      'sudo nano /etc/apache2/sites-available/mysite.conf',
      'sudo a2ensite mysite',
      'sudo systemctl reload apache2'
    ],
    hints: [
      'Check Apache status with systemctl status apache2',
      'Web root is typically /var/www/html',
      'Test PHP with <?php phpinfo(); ?>',
      'Set proper file permissions for web directories',
      'Enable required Apache modules with a2enmod'
    ]
  },
  {
    keywords: ['kernel', 'module', 'driver', 'lsmod', 'modprobe'],
    title: 'Linux Kernel Module Management',
    description: 'Learn to manage and troubleshoot Linux kernel modules for hardware and functionality.',
    difficulty: 'advanced',
    duration: '35 min',
    objectives: [
      'List loaded kernel modules',
      'Load and unload modules',
      'View module information',
      'Configure module parameters',
      'Troubleshoot module issues',
      'Manage module dependencies'
    ],
    commands: [
      'lsmod',
      'modinfo module_name',
      'sudo modprobe module_name',
      'sudo modprobe -r module_name',
      'sudo insmod module.ko',
      'sudo rmmod module_name',
      'cat /proc/modules',
      'dmesg | grep module',
      'lsmod | grep module',
      'modprobe --show-depends module_name'
    ],
    hints: [
      'Use lsmod to see currently loaded modules',
      'modprobe handles dependencies automatically',
      'Check dmesg for module loading errors',
      'Module config files are in /etc/modprobe.d/',
      'Some modules are blacklisted for stability'
    ]
  },
  {
    keywords: ['nginx', 'reverse proxy', 'web server', 'load balancer'],
    title: 'Nginx Reverse Proxy Configuration',
    description: 'Configure Nginx as a reverse proxy and load balancer for modern web applications.',
    difficulty: 'advanced',
    duration: '40 min',
    objectives: [
      'Install and configure Nginx',
      'Set up reverse proxy for backend services',
      'Configure SSL/TLS certificates',
      'Implement load balancing',
      'Optimize performance settings',
      'Monitor and troubleshoot Nginx'
    ],
    commands: [
      'sudo apt install nginx',
      'sudo systemctl start nginx',
      'sudo nginx -t',
      'sudo systemctl reload nginx',
      'sudo nano /etc/nginx/sites-available/default',
      'sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/',
      'sudo nginx -s reload',
      'curl -I localhost',
      'sudo tail -f /var/log/nginx/access.log',
      'sudo certbot --nginx -d example.com'
    ],
    hints: [
      'Always test config with nginx -t before reloading',
      'Use proxy_pass for reverse proxy configuration',
      'Enable gzip compression for better performance',
      'Set appropriate buffer sizes for your use case',
      'Monitor logs in /var/log/nginx/ for debugging'
    ]
  },
  {
    keywords: ['bash', 'shell script', 'scripting', 'automation'],
    title: 'Bash Scripting for Automation',
    description: 'Create powerful bash scripts to automate system tasks and workflows.',
    difficulty: 'intermediate',
    duration: '35 min',
    objectives: [
      'Write and execute bash scripts',
      'Use variables and parameters',
      'Implement conditional logic',
      'Create loops for repetitive tasks',
      'Handle user input',
      'Debug scripts effectively'
    ],
    commands: [
      'nano script.sh',
      'chmod +x script.sh',
      './script.sh',
      'bash -x script.sh',
      'echo $VARIABLE',
      'read -p "Enter name: " name',
      'if [ condition ]; then ... fi',
      'for i in {1..10}; do ... done',
      'while [ condition ]; do ... done',
      'function myfunction() { ... }'
    ],
    hints: [
      'Start scripts with #!/bin/bash shebang',
      'Quote variables to handle spaces: "$var"',
      'Use set -e to exit on errors',
      'Add comments for maintainability',
      'Test scripts with bash -x for debugging'
    ]
  },
  {
    keywords: ['firewall', 'iptables', 'ufw', 'security', 'port'],
    title: 'Firewall Configuration with UFW',
    description: 'Secure your system with UFW firewall configuration and rules.',
    difficulty: 'intermediate',
    duration: '30 min',
    objectives: [
      'Install and enable UFW firewall',
      'Configure default policies',
      'Allow and deny specific services',
      'Manage port-based rules',
      'Review and modify firewall rules',
      'Implement advanced firewall strategies'
    ],
    commands: [
      'sudo apt install ufw',
      'sudo ufw status',
      'sudo ufw enable',
      'sudo ufw default deny incoming',
      'sudo ufw default allow outgoing',
      'sudo ufw allow ssh',
      'sudo ufw allow 80/tcp',
      'sudo ufw deny 8080',
      'sudo ufw status numbered',
      'sudo ufw delete 2'
    ],
    hints: [
      'Always allow SSH before enabling UFW',
      'Use numbered status to delete specific rules',
      'Test rules before making permanent',
      'Use application profiles: ufw app list',
      'Log firewall activity for monitoring'
    ]
  }
];

// Generic template generator for topics not matching specific templates
function generateGenericLab(topic: string): GeneratedLab {
  const cleanTopic = topic.trim();
  const isBasic = cleanTopic.toLowerCase().includes('basic') || 
                  cleanTopic.toLowerCase().includes('beginner') ||
                  cleanTopic.toLowerCase().includes('introduction') ||
                  cleanTopic.toLowerCase().includes('intro');
  
  const isAdvanced = cleanTopic.toLowerCase().includes('advanced') || 
                     cleanTopic.toLowerCase().includes('expert') ||
                     cleanTopic.toLowerCase().includes('master');

  const difficulty: LabDifficulty = isAdvanced ? 'advanced' : (isBasic ? 'beginner' : 'intermediate');
  const duration = difficulty === 'beginner' ? '20 min' : (difficulty === 'advanced' ? '45 min' : '30 min');

  return {
    title: `${cleanTopic} - Hands-On Lab`,
    description: `A comprehensive hands-on lab to learn and practice ${cleanTopic} in a Linux environment.`,
    difficulty,
    duration,
    objectives: [
      `Understand the fundamentals of ${cleanTopic}`,
      `Execute basic ${cleanTopic} operations`,
      `Apply best practices for ${cleanTopic}`,
      `Troubleshoot common ${cleanTopic} issues`,
      `Master key ${cleanTopic} commands and workflows`,
    ],
    commands: [
      'man command',
      'command --help',
      'ls -la',
      'cd /path/to/directory',
      'cat file.txt',
      'grep pattern file.txt',
      'sudo systemctl status service',
      'journalctl -xe',
    ],
    hints: [
      'Use man pages to learn more about commands',
      'Add --help flag to most commands for quick reference',
      'Practice in a safe environment first',
      'Read error messages carefully for troubleshooting',
    ],
  };
}

export function generateLab(topic: string): GeneratedLab {
  const normalizedTopic = topic.toLowerCase().trim();

  // Find matching template
  const matchedTemplate = labTemplates.find(template =>
    template.keywords.some(keyword => normalizedTopic.includes(keyword.toLowerCase()))
  );

  if (matchedTemplate) {
    return {
      title: matchedTemplate.title,
      description: matchedTemplate.description,
      difficulty: matchedTemplate.difficulty,
      duration: matchedTemplate.duration,
      objectives: matchedTemplate.objectives,
      commands: matchedTemplate.commands,
      hints: matchedTemplate.hints,
    };
  }

  // Generate generic lab if no template matches
  return generateGenericLab(topic);
}

// Simulate async operation for consistency with old API
export async function generateLabAsync(topic: string): Promise<GeneratedLab> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  return generateLab(topic);
}
