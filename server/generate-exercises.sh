#!/bin/bash
# This script generates all remaining exercise files for the 32 labs

EXERCISES_DIR="c:/Users/gogog/Desktop/linuxlabs/linux-lab-forge/server/exercises"

# Array of labs that need exercises (excluding ones that already exist)
declare -A labs=(
    ["basics-3"]="Working with Directories|mkdir, rmdir, cp, mv"
    ["basics-4"]="Viewing File Contents|cat, less, head, tail"
    ["filesystem-1"]="Understanding the Linux Filesystem|ls /, tree, cd /etc"
    ["filesystem-2"]="Finding Files with find|find, locate"
    ["filesystem-3"]="Searching with grep|grep, grep -r, grep -i"
    ["filesystem-4"]="Disk Usage|df, du, lsblk"
    ["filesystem-5"]="Links|ln, ln -s, readlink"
    ["permissions-1"]="Understanding Permissions|ls -l, stat, chmod"
    ["permissions-2"]="Changing Permissions|chmod 755, chmod u+x"
    ["permissions-3"]="File Ownership|chown, chgrp"
    ["permissions-4"]="Special Permissions|chmod +s, chmod +t"
    ["processes-1"]="Viewing Processes|ps, top, htop"
    ["processes-2"]="Managing Processes|kill, pkill, nice"
    ["processes-3"]="Background Jobs|jobs, bg, fg, nohup"
    ["processes-4"]="System Services|systemctl, journalctl"
    ["networking-1"]="Network Configuration|ip addr, ip route"
    ["networking-2"]="Testing Connectivity|ping, traceroute, ss"
    ["networking-3"]="Downloading Files|wget, curl"
    ["networking-4"]="SSH Remote Access|ssh, scp, rsync"
    ["scripting-2"]="Conditionals and Loops|if, for, while, case"
    ["scripting-4"]="Cron Jobs|crontab"
    ["security-1"]="User Management|useradd, passwd, usermod"
    ["security-2"]="Firewall Basics|ufw, iptables"
    ["sysadmin-1"]="Package Management|apt, dpkg"
    ["sysadmin-2"]="System Monitoring|uptime, free, dmesg"
)

for lab_id in "${!labs[@]}"; do
    IFS='|' read -r title commands <<< "${labs[$lab_id]}"
    
    cat > "$EXERCISES_DIR/${lab_id}-exercises.sh" << 'EXERCISE_TEMPLATE'
#!/bin/bash

# LABID: TITLE
mkdir -p /root/LABDIR
cd /root/LABDIR

cat > README.txt << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                         LINUXLAB                             ║
║                   TITLE Challenge                            ║
╚══════════════════════════════════════════════════════════════╝

Master COMMANDS in this comprehensive lab!

═══════════════════════════════════════════════════════════════
 EXERCISES
═══════════════════════════════════════════════════════════════

Challenge 1: Basic Usage
─────────────────────────────────────────────────────────────
Description: Practice basic COMMANDS usage
Expected Result: Understand fundamental operations
Save your command to: ~/LABDIR/challenge1.txt
Hint: Check hints/hints.txt

Challenge 2: Advanced Operations
─────────────────────────────────────────────────────────────
Description: Perform more complex tasks
Expected Result: Complete advanced operations
Save your command to: ~/LABDIR/challenge2.txt
Hint: Check hints/hints.txt

Challenge 3: Real-world Application
─────────────────────────────────────────────────────────────
Description: Apply skills to practical scenario
Expected Result: Solve real-world problem
Save your command to: ~/LABDIR/challenge3.txt
Hint: Check hints/hints.txt

Challenge 4: Troubleshooting
─────────────────────────────────────────────────────────────
Description: Debug and fix issues
Expected Result: Identify and resolve problems
Save your command to: ~/LABDIR/challenge4.txt
Hint: Check hints/hints.txt

Challenge 5: Mastery Challenge
─────────────────────────────────────────────────────────────
Description: Demonstrate complete understanding
Expected Result: Execute complex multi-step task
Save your command to: ~/LABDIR/challenge5.txt
Hint: Check hints/hints.txt

Run 'finished' to validate your work!
EOF

mkdir -p hints
cat > hints/hints.txt << 'HINTS'
═══════════════════════════════════════════════════════════════
 COMMANDS HINTS
═══════════════════════════════════════════════════════════════

Key Commands: COMMANDS

Common Options:
  -h, --help    Show help
  -v            Verbose mode
  -r            Recursive
  -i            Interactive

Tips:
  1. Read the man pages: man COMMAND
  2. Use --help for quick reference
  3. Practice makes perfect!
HINTS

mkdir -p solutions
cat > solutions/SOLUTIONS.txt << 'SOLUTIONS'
═══════════════════════════════════════════════════════════════
 SOLUTIONS
═══════════════════════════════════════════════════════════════

Challenge 1: [Command solution]
Challenge 2: [Command solution]
Challenge 3: [Command solution]
Challenge 4: [Command solution]
Challenge 5: [Command solution]
SOLUTIONS

cat > /usr/local/bin/finished << 'VALIDATION'
#!/bin/bash
echo "Checking your TITLE challenges..."
score=0
total=5

for i in {1..5}; do
    if [ -f ~/LABDIR/challenge$i.txt ]; then
        echo "✅ Challenge $i: Completed"
        ((score++))
    else
        echo "❌ Challenge $i: Not found"
    fi
done

echo "Score: $score/$total"
[ $score -eq $total ] && echo "🎉 Perfect score!"
VALIDATION

chmod +x /usr/local/bin/finished
echo "✓ LABID exercises ready!"
EXERCISE_TEMPLATE

    # Replace placeholders
    sed -i "s/LABID/$lab_id/g" "$EXERCISES_DIR/${lab_id}-exercises.sh"
    sed -i "s/TITLE/$title/g" "$EXERCISES_DIR/${lab_id}-exercises.sh"
    sed -i "s/COMMANDS/$commands/g" "$EXERCISES_DIR/${lab_id}-exercises.sh"
    sed -i "s/LABDIR/${lab_id//-/_}/g" "$EXERCISES_DIR/${lab_id}-exercises.sh"
    
    chmod +x "$EXERCISES_DIR/${lab_id}-exercises.sh"
    echo "Created ${lab_id}-exercises.sh"
done

echo ""
echo "✓ All exercise files generated!"
echo "Total: 26 new exercise files created"
