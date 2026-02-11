#!/bin/bash
set -euo pipefail

LAB_ID=${LAB_ID:-""}
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

if [ -z "$LAB_ID" ]; then
  echo "LAB_ID is not set" >&2
  exit 1
fi

LAB_DIR="$HOME/labs/$LAB_ID"
WORK_DIR="$LAB_DIR/exercises/workspace"
DATE_STAMP=$(date +%Y-%m-%d)

TITLE=""
DESCRIPTION=""
COMMANDS=()
OBJECTIVES=()
TASKS=()
HINTS=()
SOLUTIONS=()

prepare_lab_data() {
  # Seed realistic files/data per lab inside the workspace directory only
  case "$LAB_ID" in
    basics-1)
      # No pre-created folders to let learners build from scratch
      ;;
    basics-2)
      mkdir -p "$WORK_DIR/scratch"
      touch "$WORK_DIR/scratch/temp1.txt" "$WORK_DIR/scratch/temp2.log"
      ;;
    basics-3)
      mkdir -p "$WORK_DIR/projects/app/src" "$WORK_DIR/archive"
      echo "draft" > "$WORK_DIR/projects/app/src/main.txt"
      ;;
    basics-4)
      mkdir -p "$WORK_DIR/logs"
      seq 1 50 > "$WORK_DIR/logs/numbers.txt"
      printf "line-one\nline-two\nline-three\n" > "$WORK_DIR/logs/sample.txt"
      ;;
    basics-5)
      mkdir -p "$WORK_DIR/manuals"
      printf "man ls\nman grep\n" > "$WORK_DIR/manuals/common.txt"
      ;;
    filesystem-1)
      mkdir -p "$WORK_DIR/system/etc" "$WORK_DIR/system/var/log" "$WORK_DIR/system/home/student"
      echo "CONFIG" > "$WORK_DIR/system/etc/app.conf"
      ;;
    filesystem-2)
      mkdir -p "$WORK_DIR/findme/reports" "$WORK_DIR/findme/tmp" "$WORK_DIR/findme/logs"
      touch "$WORK_DIR/findme/reports/report1.csv" "$WORK_DIR/findme/reports/report2.csv"
      echo "debug" > "$WORK_DIR/findme/tmp/debug.log"
      echo "needle" > "$WORK_DIR/findme/logs/needle.txt"
      ;;
    filesystem-3)
      mkdir -p "$WORK_DIR/logs"
      printf "INFO start\nERROR disk full\nWARN retry\n" > "$WORK_DIR/logs/app.log"
      printf "user: alice\nuser: bob\nuser: clara\n" > "$WORK_DIR/logs/users.log"
      ;;
    filesystem-4)
      mkdir -p "$WORK_DIR/data"
      dd if=/dev/zero of="$WORK_DIR/data/bigfile.bin" bs=1K count=256 status=none
      dd if=/dev/zero of="$WORK_DIR/data/smallfile.bin" bs=1K count=8 status=none
      ;;
    filesystem-5)
      mkdir -p "$WORK_DIR/links"
      echo "original" > "$WORK_DIR/links/target.txt"
      ;;
    permissions-1)
      mkdir -p "$WORK_DIR/perms"
      echo "sensitive" > "$WORK_DIR/perms/secret.txt"
      chmod 640 "$WORK_DIR/perms/secret.txt"
      ;;
    permissions-2)
      mkdir -p "$WORK_DIR/scripts"
      echo -e "#!/bin/bash\necho hi" > "$WORK_DIR/scripts/runme.sh"
      ;;
    permissions-3)
      mkdir -p "$WORK_DIR/ownership"
      echo "data" > "$WORK_DIR/ownership/data.txt"
      sudo useradd -m -s /bin/bash trainee 2>/dev/null || true
      ;;
    permissions-4)
      mkdir -p "$WORK_DIR/shared"
      touch "$WORK_DIR/shared/file.txt"
      ;;
    processes-1)
      sleep 120 & echo $! > "$WORK_DIR/fake.pid"
      ;;
    processes-2)
      yes > "$WORK_DIR/cpu-hog.txt" & echo $! > "$WORK_DIR/hog.pid"
      ;;
    processes-3)
      echo "echo running" > "$WORK_DIR/bg.sh"
      chmod +x "$WORK_DIR/bg.sh"
      ;;
    processes-4)
      sudo systemctl list-unit-files >/dev/null 2>&1 || true
      ;;
    networking-1)
      echo "127.0.0.1 localhost" > "$WORK_DIR/resolv.mock"
      ;;
    networking-2)
      echo "ping 8.8.8.8" > "$WORK_DIR/connectivity.txt"
      ;;
    networking-3)
      mkdir -p "$WORK_DIR/downloads"
      echo "http://example.com" > "$WORK_DIR/downloads/urls.txt"
      ;;
    networking-4)
      mkdir -p "$WORK_DIR/ssh"
      ;;
    scripting-1)
      mkdir -p "$WORK_DIR/bin"
      ;;
    scripting-2)
      echo -e "apple\nbanana\ncherry" > "$WORK_DIR/fruits.txt"
      ;;
    scripting-3)
      mkdir -p "$WORK_DIR/data"
      printf "user,role\nalice,admin\nbob,dev\n" > "$WORK_DIR/data/users.csv"
      printf "ERROR 500\nINFO ok\nWARN retry\n" > "$WORK_DIR/data/app.log"
      ;;
    scripting-4)
      mkdir -p "$WORK_DIR/logs"
      echo "echo $(date) >> $WORK_DIR/logs/cron.log" > "$WORK_DIR/cron-task.sh"
      chmod +x "$WORK_DIR/cron-task.sh"
      ;;
    security-1)
      sudo useradd -m -s /bin/bash audituser 2>/dev/null || true
      ;;
    security-2)
      echo "SSH" > "$WORK_DIR/port-list.txt"
      ;;
    security-3)
      mkdir -p "$WORK_DIR/ssh"
      ;;
    sysadmin-1)
      touch "$WORK_DIR/pkg-list.txt"
      ;;
    sysadmin-2)
      mkdir -p "$WORK_DIR/logs"
      ;;
    awk)
      mkdir -p "$WORK_DIR/data"
      printf "alice,10\nbob,20\ncarol,15\n" > "$WORK_DIR/data/scores.csv"
      ;;
    sed)
      printf "foo bar baz\nfoo line two\n" > "$WORK_DIR/text.txt"
      ;;
    grep)
      printf "alpha\nbeta\ngamma\nerror: disk\n" > "$WORK_DIR/log.txt"
      ;;
    git)
      mkdir -p "$WORK_DIR/repo"
      ;;
    vim)
      mkdir -p "$WORK_DIR/docs"
      printf "Edit me with vim\n" > "$WORK_DIR/docs/note.txt"
      ;;
    text-processing)
      mkdir -p "$WORK_DIR/data"
      printf "name,lang\nalice,bash\nbob,python\ncarol,go\n" > "$WORK_DIR/data/devs.csv"
      ;;
  esac
}

case "$LAB_ID" in
  basics-1)
    TITLE="Your First Terminal Commands"
    DESCRIPTION="Learn to navigate the terminal with basic commands like pwd, ls, and cd."
    COMMANDS=("pwd" "ls" "ls -la" "cd" "cd .." "cd ~")
    OBJECTIVES=(
      "Understand what the terminal is"
      "Use pwd to print working directory"
      "List files with ls and its options"
      "Navigate directories with cd"
    )
    TASKS=(
      "Create a folder named playground, move into it, and list its contents with ls -la (save the command you used in challenge1.txt)."
      "Create a subfolder docs and a file notes.txt inside playground (record the command in challenge2.txt)."
      "Use pwd to capture your working directory into challenge3.txt."
      "Use cd .. to go up one level and note the command in challenge4.txt."
      "List hidden files (if any) and note the command in challenge5.txt."
    )
    HINTS=(
      "You can create and move in one line with mkdir -p and cd."
      "Use touch to create the file after making the docs folder."
      "pwd prints the absolute path."
      ".. is the parent directory."
      "Use ls with a flag that shows dotfiles."
    )
    SOLUTIONS=(
      "mkdir -p playground && cd playground && ls -la"
      "mkdir -p docs && touch docs/notes.txt"
      "pwd > challenge3.txt"
      "cd .."
      "ls -la"
    )
    ;;
  basics-2)
    TITLE="Creating and Removing Files"
    DESCRIPTION="Master file creation with touch and removal with rm."
    COMMANDS=("touch" "rm" "rm -i" "rm -rf")
    OBJECTIVES=(
      "Create empty files with touch"
      "Remove files with rm"
      "Understand the dangers of rm -rf"
      "Use wildcards for batch operations"
    )
    TASKS=(
      "In scratch/, create files a.txt, b.txt, and c.log using one command; save it in challenge1.txt."
      "Remove c.log safely with an interactive delete; record the command in challenge2.txt."
      "Create a nested folder scratch/archive/2026 and move a.txt into it; note the move command in challenge3.txt."
      "Remove the empty scratch/archive/2026 directory; record the command in challenge4.txt."
      "Write a one-line wildcard delete that would remove all .tmp files (do NOT run it), just place the command in challenge5.txt."
    )
    HINTS=(
      "Use brace expansion with touch."
      "Interactive remove is -i."
      "mkdir -p helps create nested paths."
      "Use rmdir for empty directories."
      "Use rm with a wildcard but do not execute."
    )
    SOLUTIONS=(
      "touch scratch/a.txt scratch/b.txt scratch/c.log"
      "rm -i scratch/c.log"
      "mkdir -p scratch/archive/2026 && mv scratch/a.txt scratch/archive/2026/"
      "rmdir scratch/archive/2026"
      "rm -f scratch/*.tmp"
    )
    ;;
  basics-3)
    TITLE="Working with Directories"
    DESCRIPTION="Create, remove, and organize directories effectively."
    COMMANDS=("mkdir" "mkdir -p" "rmdir" "rm -r" "cp -r" "mv")
    OBJECTIVES=(
      "Create directories with mkdir"
      "Create nested directories with mkdir -p"
      "Remove directories with rmdir and rm -r"
      "Copy and move directories"
    )
    TASKS=(
      "Create projects/app/logs and archive/old; note the mkdir command in challenge1.txt."
      "Copy projects/app/src/main.txt to projects/app/logs/main.bak; record the command in challenge2.txt."
      "Move projects/app/src/main.txt into archive/old; record the mv command in challenge3.txt."
      "Create nested dirs labs/2026/02/09 with one command using -p; store it in challenge4.txt."
      "Remove the empty labs/2026/02/09 directory tree; store the rm command in challenge5.txt."
    )
    HINTS=(
      "One mkdir command can create multiple paths."
      "Use cp -r for directories or cp for files."
      "mv moves the file; source then destination."
      "mkdir -p handles nested creation."
      "Use rm -r to remove nested directories."
    )
    SOLUTIONS=(
      "mkdir -p projects/app/logs archive/old"
      "cp projects/app/src/main.txt projects/app/logs/main.bak"
      "mv projects/app/src/main.txt archive/old/"
      "mkdir -p labs/2026/02/09"
      "rm -r labs/2026/02/09"
    )
    ;;
  basics-4)
    TITLE="Viewing File Contents"
    DESCRIPTION="Learn multiple ways to view and explore file contents."
    COMMANDS=("cat" "less" "head" "tail" "tail -f")
    OBJECTIVES=(
      "View entire files with cat"
      "Page through files with less"
      "View file beginnings with head"
      "View file endings with tail"
    )
    TASKS=(
      "View the first 5 lines of logs/numbers.txt; save the command in challenge1.txt."
      "Tail the last 3 lines of logs/numbers.txt; save the command in challenge2.txt."
      "Follow logs/numbers.txt with tail -f in another shell (just write the command you would use in challenge3.txt)."
      "Use less on logs/sample.txt and note the command in challenge4.txt."
      "Concatenate logs/sample.txt and append to logs/combined.txt; store the command in challenge5.txt."
    )
    HINTS=(
      "Use head with -n."
      "tail can limit lines with -n."
      "tail -f follows updates."
      "less opens a pager."
      "cat with >> appends."
    )
    SOLUTIONS=(
      "head -n 5 logs/numbers.txt"
      "tail -n 3 logs/numbers.txt"
      "tail -f logs/numbers.txt"
      "less logs/sample.txt"
      "cat logs/sample.txt >> logs/combined.txt"
    )
    ;;
  basics-5)
    TITLE="Getting Help in Linux"
    DESCRIPTION="Discover how to find help for any command."
    COMMANDS=("man" "--help" "apropos" "whatis" "info")
    OBJECTIVES=(
      "Use man pages effectively"
      "Get quick help with --help"
      "Search man pages with apropos"
      "Understand man page sections"
    )
    TASKS=(
      "Open the man page for ls; note the exact command in challenge1.txt."
      "Use --help for grep; record the command in challenge2.txt."
      "Find man entries related to network using apropos; save the command in challenge3.txt."
      "Use whatis on chmod; save the command in challenge4.txt."
      "Write the man section number you found for passwd into challenge5.txt."
    )
    HINTS=(
      "man shows manual pages."
      "Most commands support --help."
      "apropos searches man database."
      "whatis gives a one-line description."
      "man outputs section numbers at top."
    )
    SOLUTIONS=(
      "man ls"
      "grep --help"
      "apropos network"
      "whatis chmod"
      "Section likely 1; record the number shown"
    )
    ;;
  filesystem-1)
    TITLE="Understanding the Linux Filesystem"
    DESCRIPTION="Explore the Linux directory structure and its purpose."
    COMMANDS=("ls /" "cd /etc" "cd /var/log" "tree")
    OBJECTIVES=(
      "Understand the root filesystem hierarchy"
      "Know the purpose of /bin, /etc, /home, /var"
      "Navigate between important directories"
      "Identify system vs user directories"
    )
    TASKS=(
      "List the root of the mock tree under system/ with ls -R; record the command in challenge1.txt."
      "Change into system/etc and show the current path; save the command in challenge2.txt."
      "Find where app.conf lives using find; note the command in challenge3.txt."
      "Identify which subdir represents user data vs system config; describe it in challenge4.txt."
      "Use tree (or ls -R if tree missing) on system/ and redirect output to challenge5.txt."
    )
    HINTS=(
      "Recursive list is ls -R."
      "Use cd then pwd."
      "find can search by name."
      "User data is under home; config under etc."
      "tree may not be installed; fallback to ls -R."
    )
    SOLUTIONS=(
      "ls -R system/"
      "cd system/etc && pwd"
      "find system -name app.conf"
      "User data: system/home/student; config: system/etc"
      "tree system > challenge5.txt || ls -R system > challenge5.txt"
    )
    ;;
  filesystem-2)
    TITLE="Finding Files with find"
    DESCRIPTION="Master the powerful find command for locating files."
    COMMANDS=("find . -name" "find -type f" "find -size" "find -mtime" "find -exec")
    OBJECTIVES=(
      "Find files by name"
      "Find files by type"
      "Find files by size and modification time"
      "Execute commands on found files"
    )
    TASKS=(
      "Find all .csv files under findme/; record the command in challenge1.txt."
      "Find files named needle.txt anywhere under findme/; record in challenge2.txt."
      "Find files larger than 1K in findme/; record in challenge3.txt."
      "Run a find -exec that echoes each found file path into challenge4.txt (append output)."
      "Write a find command to delete empty files (do not run it); store in challenge5.txt."
    )
    HINTS=(
      "Use -name with wildcard."
      "Exact filename match."
      "-size +1k filters size."
      "-exec can run echo {}."
      "Use -empty with -delete (but do not run)."
    )
    SOLUTIONS=(
      "find findme -name '*.csv'"
      "find findme -name needle.txt"
      "find findme -type f -size +1k"
      "find findme -type f -exec echo {} \; >> challenge4.txt"
      "find findme -type f -empty -delete"
    )
    ;;
  filesystem-3)
    TITLE="Searching File Contents with grep"
    DESCRIPTION="Use grep to search within files for patterns."
    COMMANDS=("grep" "grep -r" "grep -i" "grep -v" "grep -E")
    OBJECTIVES=(
      "Search for patterns in files"
      "Use recursive grep"
      "Understand basic regular expressions"
      "Combine grep with other commands"
    )
    TASKS=(
      "Search for ERROR lines in logs/app.log; save the grep command in challenge1.txt."
      "Search case-insensitively for user in logs/users.log; record the command in challenge2.txt."
      "Count how many WARN entries appear in app.log using grep -c; record in challenge3.txt."
      "Use grep -n to show line numbers for ERROR in app.log; record in challenge4.txt."
      "Write a regex that matches lines starting with INFO or WARN and place it in challenge5.txt."
    )
    HINTS=(
      "Plain grep for ERROR."
      "Use -i flag for case-insensitive."
      "grep -c counts matches."
      "-n shows line numbers."
      "Use ^ anchor with alternation."
    )
    SOLUTIONS=(
      "grep 'ERROR' logs/app.log"
      "grep -i 'user' logs/users.log"
      "grep -c 'WARN' logs/app.log"
      "grep -n 'ERROR' logs/app.log"
      "^INFO|^WARN"
    )
    ;;
  filesystem-4)
    TITLE="Disk Usage and Management"
    DESCRIPTION="Monitor and manage disk space on your system."
    COMMANDS=("df -h" "du -sh" "du -h --max-depth=1" "lsblk")
    OBJECTIVES=(
      "Check disk usage with df"
      "Find large files with du"
      "Understand mount points"
      "Identify disk space issues"
    )
    TASKS=(
      "Check filesystem usage with df -h; redirect output to challenge1.txt."
      "Show sizes of files inside data/ with du -h --max-depth=1; append to challenge2.txt."
      "Identify which file is larger between bigfile.bin and smallfile.bin using ls -lh; record the command in challenge3.txt."
      "List block devices with lsblk; record the command in challenge4.txt."
      "Describe in challenge5.txt how you would find the largest 3 items under $HOME."
    )
    HINTS=(
      "df -h shows disk usage."
      "du can limit depth."
      "ls -lh shows sizes."
      "lsblk lists block devices."
      "Use du -sh with sort/head."
    )
    SOLUTIONS=(
      "df -h > challenge1.txt"
      "du -h --max-depth=1 data/ >> challenge2.txt"
      "ls -lh data/bigfile.bin data/smallfile.bin"
      "lsblk"
      "du -sh $HOME/* | sort -h | tail -3"
    )
    ;;
  filesystem-5)
    TITLE="Symbolic and Hard Links"
    DESCRIPTION="Create and understand file links in Linux."
    COMMANDS=("ln" "ln -s" "ls -l" "readlink")
    OBJECTIVES=(
      "Understand the difference between hard and soft links"
      "Create symbolic links with ln -s"
      "Create hard links"
      "Identify and manage links"
    )
    TASKS=(
      "Create a hard link links/hard.txt pointing to links/target.txt; record the command in challenge1.txt."
      "Create a symlink links/soft.txt pointing to links/target.txt; record the command in challenge2.txt."
      "Use ls -l to show link metadata and save output to challenge3.txt."
      "Use readlink to resolve soft.txt and note the command in challenge4.txt."
      "Write in challenge5.txt when you would choose hard vs soft links."
    )
    HINTS=(
      "ln without -s makes hard links."
      "ln -s makes symlinks."
      "ls -l shows link targets."
      "readlink prints the symlink target."
      "Hard links same inode; symlink for dirs/cross FS."
    )
    SOLUTIONS=(
      "ln links/target.txt links/hard.txt"
      "ln -s links/target.txt links/soft.txt"
      "ls -l links"
      "readlink links/soft.txt"
      "Use hard links for same FS durability; symlinks for flexibility/cross-FS."
    )
    ;;
  permissions-1)
    TITLE="Understanding File Permissions"
    DESCRIPTION="Learn to read and understand Linux file permissions."
    COMMANDS=("ls -l" "stat" "id" "groups")
    OBJECTIVES=(
      "Read permission strings (rwxr-xr-x)"
      "Understand user, group, and other permissions"
      "Identify file ownership"
      "Check your own permissions"
    )
    TASKS=(
      "List perms of perms/secret.txt with ls -l; record the command and output in challenge1.txt."
      "Use stat on secret.txt; append the command to challenge2.txt."
      "Run id to view your UID/GID; record command+output in challenge3.txt."
      "List your groups with groups; record in challenge4.txt."
      "Explain in challenge5.txt what 640 means for owner/group/others."
    )
    HINTS=(
      "Use ls -l to view permissions."
      "stat shows detailed metadata."
      "id prints uid/gid."
      "groups lists memberships."
      "640 is rw- r-- ---."
    )
    SOLUTIONS=(
      "ls -l perms/secret.txt"
      "stat perms/secret.txt"
      "id"
      "groups"
      "Owner rw-, group r--, others --- (no access)."
    )
    ;;
  permissions-2)
    TITLE="Changing Permissions with chmod"
    DESCRIPTION="Modify file permissions using symbolic and octal notation."
    COMMANDS=("chmod" "chmod +x" "chmod 755" "chmod -R")
    OBJECTIVES=(
      "Use chmod with symbolic notation (u+x)"
      "Use chmod with octal notation (755)"
      "Apply permissions recursively"
      "Set default permissions"
    )
    TASKS=(
      "Make scripts/runme.sh executable; record the chmod command in challenge1.txt."
      "Set scripts/runme.sh to 755 using octal; record in challenge2.txt."
      "Apply chmod -R 700 to scripts/; record the command in challenge3.txt."
      "Write a symbolic chmod to remove write for group on runme.sh (do not run); place in challenge4.txt."
      "Describe in challenge5.txt when to use octal vs symbolic chmod."
    )
    HINTS=(
      "Use +x to add execute."
      "Octal 755 equals rwxr-xr-x."
      "-R applies recursively."
      "Symbolic form uses u/g/o with +/-/=."
      "Octal for exact masks; symbolic for tweaks."
    )
    SOLUTIONS=(
      "chmod +x scripts/runme.sh"
      "chmod 755 scripts/runme.sh"
      "chmod -R 700 scripts/"
      "chmod g-w scripts/runme.sh"
      "Use octal for precise full mode; symbolic for incremental changes."
    )
    ;;
  permissions-3)
    TITLE="File Ownership with chown"
    DESCRIPTION="Change file and directory ownership."
    COMMANDS=("chown" "chgrp" "chown user:group" "chown -R")
    OBJECTIVES=(
      "Change file owner with chown"
      "Change file group with chgrp"
      "Change owner and group together"
      "Apply ownership recursively"
    )
    TASKS=(
      "Change ownership of ownership/data.txt to trainee:trainee; record the command in challenge1.txt."
      "Verify owner/group with ls -l ownership/data.txt; save output in challenge2.txt."
      "Recursively change ownership of ownership/ back to student:student; record in challenge3.txt."
      "Write a chgrp example to set group to sudo for data.txt (do not run); place in challenge4.txt."
      "Explain in challenge5.txt why sudo is needed for chown."
    )
    HINTS=(
      "chown user:group file."
      "ls -l shows owner/group."
      "-R applies recursively."
      "chgrp changes only group."
      "Changing ownership requires elevated rights."
    )
    SOLUTIONS=(
      "sudo chown trainee:trainee ownership/data.txt"
      "ls -l ownership/data.txt"
      "sudo chown -R student:student ownership/"
      "chgrp sudo ownership/data.txt"
      "Only root (or sudo) can give away ownership to prevent privilege abuse."
    )
    ;;
  permissions-4)
    TITLE="Special Permissions: SUID, SGID, Sticky Bit"
    DESCRIPTION="Understand and apply special permission bits."
    COMMANDS=("chmod u+s" "chmod g+s" "chmod +t" "find -perm")
    OBJECTIVES=(
      "Understand SUID and its security implications"
      "Use SGID for shared directories"
      "Apply sticky bit to directories"
      "Find files with special permissions"
    )
    TASKS=(
      "Set sticky bit on shared/ and record the chmod command in challenge1.txt."
      "Set SGID on shared/ so group inheritance applies; record in challenge2.txt."
      "Set SUID on /bin/mount example (do NOT run); write the command only in challenge3.txt."
      "Find any files with sticky bit under /tmp and record the find command in challenge4.txt."
      "Explain in challenge5.txt what sticky, SGID, SUID each do."
    )
    HINTS=(
      "Sticky bit is +t."
      "SGID is g+s on dirs."
      "SUID is u+s on binaries."
      "find -perm can match special bits."
      "Summarize effects on delete/owner execution."
    )
    SOLUTIONS=(
      "chmod +t shared/"
      "chmod g+s shared/"
      "chmod u+s /bin/mount"
      "find /tmp -perm -1000"
      "Sticky: only owner can delete in dir; SGID: inherits group; SUID: runs with owner's UID."
    )
    ;;
  processes-1)
    TITLE="Viewing Running Processes"
    DESCRIPTION="Monitor and understand running processes on your system."
    COMMANDS=("ps" "ps aux" "top" "htop" "pgrep")
    OBJECTIVES=(
      "View processes with ps"
      "Use top for real-time monitoring"
      "Understand process states"
      "Identify resource-heavy processes"
    )
    TASKS=(
      "List your processes with ps aux | head; save output in challenge1.txt."
      "Run top (or htop if available) and note the command in challenge2.txt."
      "Use pgrep to locate the sleep process started for you (check fake.pid); record the command in challenge3.txt."
      "Explain process states you observed in challenge4.txt."
      "Use ps -p \$(cat fake.pid) -o pid,cmd and store output in challenge5.txt."
    )
    HINTS=(
      "ps aux shows all processes."
      "top provides live view."
      "pgrep can read a PID file."
      "Common states: R, S, D, T, Z."
      "ps -p filters by PID."
    )
    SOLUTIONS=(
      "ps aux | head"
      "top"
      "pgrep -F fake.pid"
      "Describe Running (R), Sleeping (S), Stopped (T), Zombie (Z)."
      "ps -p \$(cat fake.pid) -o pid,cmd"
    )
    ;;
  processes-2)
    TITLE="Managing Processes"
    DESCRIPTION="Control processes: start, stop, and signal them."
    COMMANDS=("kill" "kill -9" "pkill" "killall" "nice" "renice")
    OBJECTIVES=(
      "Send signals to processes with kill"
      "Understand common signals (SIGTERM, SIGKILL)"
      "Kill processes by name with pkill"
      "Use nice and renice for priority"
    )
    TASKS=(
      "Inspect the CPU hog PID stored in hog.pid with ps -p; save output in challenge1.txt."
      "Send SIGTERM to that PID with kill; record the command in challenge2.txt."
      "Demonstrate pkill by name (write the command you would use) in challenge3.txt."
      "Set a nice value of 10 on a sleep 30 command (run it) and record the command in challenge4.txt."
      "Describe when to prefer SIGTERM over SIGKILL in challenge5.txt."
    )
    HINTS=(
      "ps -p accepts PID."
      "kill default is SIGTERM."
      "pkill matches process names."
      "nice starts a process with priority."
      "SIGTERM allows cleanup; SIGKILL is last resort."
    )
    SOLUTIONS=(
      "ps -p \$(cat hog.pid) -o pid,cmd"
      "kill \$(cat hog.pid)"
      "pkill sleep"
      "nice -n 10 sleep 30"
      "Prefer SIGTERM to let apps exit cleanly; use SIGKILL only if unresponsive."
    )
    ;;
  processes-3)
    TITLE="Background Jobs and Job Control"
    DESCRIPTION="Run processes in background and manage jobs."
    COMMANDS=("&" "jobs" "fg" "bg" "nohup" "disown")
    OBJECTIVES=(
      "Run commands in background with &"
      "Use jobs, fg, and bg"
      "Understand Ctrl+Z vs Ctrl+C"
      "Use nohup for persistent processes"
    )
    TASKS=(
      "Start bg.sh in background with &; record the exact command in challenge1.txt."
      "Use jobs to list background tasks; save command+output in challenge2.txt."
      "Bring the job to foreground with fg; note command in challenge3.txt."
      "Demonstrate nohup usage by writing the nohup command you would run into challenge4.txt (no need to run)."
      "Explain difference between Ctrl+Z and Ctrl+C in challenge5.txt."
    )
    HINTS=(
      "Append & to run in background."
      "jobs lists current shell jobs."
      "fg brings last job to foreground."
      "nohup prevents hangup; redirects output."
      "Ctrl+Z suspends; Ctrl+C terminates."
    )
    SOLUTIONS=(
      "./bg.sh &"
      "jobs"
      "fg"
      "nohup ./bg.sh &"
      "Ctrl+Z stops/suspends; Ctrl+C sends SIGINT to terminate."
    )
    ;;
  processes-4)
    TITLE="System Services with systemctl"
    DESCRIPTION="Manage system services using systemd."
    COMMANDS=("systemctl start" "systemctl stop" "systemctl enable" "systemctl status" "journalctl")
    OBJECTIVES=(
      "Start and stop services"
      "Enable services at boot"
      "Check service status"
      "View service logs with journalctl"
    )
    TASKS=(
      "Check ssh service status with systemctl status ssh or ssh.service; note command+result in challenge1.txt."
      "List enabled services with systemctl list-unit-files --type=service | head; save output in challenge2.txt."
      "Show last 5 log lines for ssh via journalctl -u ssh -n 5; record command+output in challenge3.txt."
      "Write a command to enable a hypothetical service demo.service (do not run); place in challenge4.txt."
      "Explain in challenge5.txt what systemctl start vs enable does."
    )
    HINTS=(
      "systemctl status shows service state."
      "list-unit-files shows enabled/disabled."
      "journalctl -u SERVICE -n N shows logs."
      "enable registers service for boot."
      "start runs now; enable persists."
    )
    SOLUTIONS=(
      "systemctl status ssh"
      "systemctl list-unit-files --type=service | head"
      "journalctl -u ssh -n 5"
      "systemctl enable demo.service"
      "start launches immediately; enable configures autostart at boot."
    )
    ;;
  networking-1)
    TITLE="Network Configuration Basics"
    DESCRIPTION="View and understand your network configuration."
    COMMANDS=("ip addr" "ip route" "cat /etc/resolv.conf" "hostname")
    OBJECTIVES=(
      "View IP addresses with ip or ifconfig"
      "Understand network interfaces"
      "Check routing table"
      "View DNS configuration"
    )
    TASKS=(
      "Show IP addresses with ip addr and redirect output to challenge1.txt."
      "Display routing table with ip route; append to challenge2.txt."
      "View DNS settings from /etc/resolv.conf; append to challenge3.txt."
      "Show hostname and write it into challenge4.txt."
      "Explain in challenge5.txt difference between interface and route."
    )
    HINTS=(
      "ip addr shows interfaces."
      "ip route prints routes."
      "cat resolv.conf for DNS."
      "hostname prints system name."
      "Interface is NIC; route is path selection."
    )
    SOLUTIONS=(
      "ip addr > challenge1.txt"
      "ip route >> challenge2.txt"
      "cat /etc/resolv.conf >> challenge3.txt"
      "hostname > challenge4.txt"
      "Interfaces are network links; routes define where packets go."
    )
    ;;
  networking-2)
    TITLE="Testing Network Connectivity"
    DESCRIPTION="Diagnose network issues with essential tools."
    COMMANDS=("ping" "traceroute" "ss -tuln" "dig" "nslookup")
    OBJECTIVES=(
      "Test connectivity with ping"
      "Trace routes with traceroute"
      "Check open ports with netstat/ss"
      "Test DNS with dig and nslookup"
    )
    TASKS=(
      "Ping 127.0.0.1 for 3 packets; record command+output in challenge1.txt."
      "Write the traceroute command you would use to 1.1.1.1 (no need to run) into challenge2.txt."
      "List listening TCP/UDP sockets with ss -tuln | head; save output in challenge3.txt."
      "Query DNS for example.com using dig (or nslookup if dig missing); record in challenge4.txt."
      "Explain in challenge5.txt how you’d test if port 22 is reachable."
    )
    HINTS=(
      "Use ping -c 3."
      "traceroute shows hops."
      "ss -tuln lists listening sockets."
      "dig example.com or nslookup example.com."
      "Use nc or ssh with verbose to test port."
    )
    SOLUTIONS=(
      "ping -c 3 127.0.0.1 > challenge1.txt"
      "traceroute 1.1.1.1"
      "ss -tuln | head > challenge3.txt"
      "dig example.com > challenge4.txt || nslookup example.com > challenge4.txt"
      "Use nc -vz host 22 or ssh -v host to test connectivity."
    )
    ;;
  networking-3)
    TITLE="Downloading Files from the Web"
    DESCRIPTION="Use curl and wget to download files and interact with APIs."
    COMMANDS=("wget" "curl" "curl -O" "curl -X POST" "curl -H")
    OBJECTIVES=(
      "Download files with wget"
      "Use curl for HTTP requests"
      "Send POST requests with curl"
      "Handle authentication and headers"
    )
    TASKS=(
      "Use curl to fetch headers from https://example.com with -I; save command+output to challenge1.txt."
      "Download https://example.com into downloads/example.html using curl or wget; record command in challenge2.txt."
      "POST JSON '{"ping":"pong"}' to https://httpbin.org/post and capture the command in challenge3.txt (ok if offline, just command)."
      "Show how to add a custom header X-API-KEY:test with curl; write the command in challenge4.txt."
      "Explain in challenge5.txt when to prefer wget vs curl."
    )
    HINTS=(
      "curl -I fetches headers."
      "Use -o to save files."
      "curl -X POST with -d for JSON plus header."
      "-H sets custom headers."
      "wget is good for recursive/downloads; curl for APIs."
    )
    SOLUTIONS=(
      "curl -I https://example.com > challenge1.txt"
      "curl -o downloads/example.html https://example.com"
      "curl -X POST -H 'Content-Type: application/json' -d '{"ping":"pong"}' https://httpbin.org/post"
      "curl -H 'X-API-KEY: test' https://example.com"
      "Prefer wget for bulk/static downloads; curl for flexible API requests."
    )
    ;;
  networking-4)
    TITLE="SSH Remote Access"
    DESCRIPTION="Connect to remote systems securely with SSH."
    COMMANDS=("ssh" "ssh-keygen" "ssh-copy-id" "scp" "rsync")
    OBJECTIVES=(
      "Connect to remote systems with ssh"
      "Use SSH keys for authentication"
      "Transfer files with scp and rsync"
      "Configure SSH client"
    )
    TASKS=(
      "Generate a new SSH key with ssh-keygen -t ed25519 -f exercises/workspace/ssh/id_ed25519; record the command in challenge1.txt."
      "Show public key contents; append command+output to challenge2.txt."
      "Write the command to copy the key to user@server using ssh-copy-id (do not run); store in challenge3.txt."
      "Use scp syntax to upload file.txt to /tmp on a host; write command in challenge4.txt."
      "Explain in challenge5.txt how to enable verbose SSH debugging."
    )
    HINTS=(
      "ssh-keygen creates key pairs."
      "Public key ends with .pub."
      "ssh-copy-id installs keys."
      "scp source destination syntax."
      "Use -v flag on ssh."
    )
    SOLUTIONS=(
      "ssh-keygen -t ed25519 -f exercises/workspace/ssh/id_ed25519"
      "cat exercises/workspace/ssh/id_ed25519.pub"
      "ssh-copy-id -i exercises/workspace/ssh/id_ed25519.pub user@server"
      "scp file.txt user@server:/tmp/"
      "ssh -v user@server"
    )
    ;;
  scripting-1)
    TITLE="Your First Bash Script"
    DESCRIPTION="Create and run your first shell script."
    COMMANDS=("#!/bin/bash" "chmod +x" "\$1" "\$2" "echo")
    OBJECTIVES=(
      "Create a script with shebang"
      "Make scripts executable"
      "Use variables in scripts"
      "Accept command-line arguments"
    )
    TASKS=(
      "Create bin/hello.sh with shebang and echo 'Hello Lab'; record the creation command in challenge1.txt."
      "Make hello.sh executable; record chmod in challenge2.txt."
      "Run hello.sh and redirect output to challenge3.txt."
      "Add a positional argument to print first arg; note the change in challenge4.txt."
      "Write how to run hello.sh with two args into challenge5.txt."
    )
    HINTS=(
      "Use echo with redirection to create the file."
      "chmod +x makes scripts executable."
      "Run via ./hello.sh."
      "Use \$1 to access first argument."
      "Provide two arguments separated by space."
    )
    SOLUTIONS=(
      "echo -e '#!/bin/bash\necho \"Hello Lab\"' > bin/hello.sh"
      "chmod +x bin/hello.sh"
      "./bin/hello.sh > challenge3.txt"
      "echo -e '#!/bin/bash\necho \"Hello Lab\"\necho \"Arg1: \$1\"' > bin/hello.sh"
      "./bin/hello.sh one two"
    )
    ;;
  scripting-2)
    TITLE="Conditionals and Loops"
    DESCRIPTION="Add logic to your scripts with if statements and loops."
    COMMANDS=("if" "for" "while" "case" "test")
    OBJECTIVES=(
      "Write if-else statements"
      "Use for and while loops"
      "Test conditions with [ ]"
      "Handle multiple conditions with case"
    )
    TASKS=(
      "Write an if statement that checks if fruits.txt exists; place the snippet in challenge1.txt."
      "Write a for loop that echoes each fruit from fruits.txt; place in challenge2.txt."
      "Write a while loop that counts 1 to 3; place in challenge3.txt."
      "Write a case statement handling start|stop|restart; place in challenge4.txt."
      "Explain [[ ]] vs [ ] in challenge5.txt."
    )
    HINTS=(
      "Use -f to test files."
      "for f in \$(cat file); do ...; done"
      "while loop with counter."
      "case var in pattern) ... ;; esac"
      "[[ ]] is more powerful/bash-specific."
    )
    SOLUTIONS=(
      "if [ -f fruits.txt ]; then echo exists; fi"
      "for fruit in \$(cat fruits.txt); do echo \$fruit; done"
      "i=1; while [ \$i -le 3 ]; do echo \$i; i=$((i+1)); done"
      "case \"\$1\" in start) echo start ;; stop) echo stop ;; restart) echo restart ;; *) echo unknown ;; esac"
      "[[ ]] supports pattern matching and is safer with spaces; [ ] is POSIX test."
    )
    ;;
  scripting-3)
    TITLE="Text Processing with awk and sed"
    DESCRIPTION="Master text processing for log analysis and data manipulation."
    COMMANDS=("awk" "sed" "cut" "sort" "uniq")
    OBJECTIVES=(
      "Extract columns with awk"
      "Find and replace with sed"
      "Process log files"
      "Combine awk and sed in pipelines"
    )
    TASKS=(
      "Use awk to print usernames from data/users.csv (column 1); record command in challenge1.txt."
      "Use awk to filter role==admin; record command in challenge2.txt."
      "Use sed to replace WARN with INFO in data/app.log and write result to data/app-clean.log; record command in challenge3.txt."
      "Pipe cat data/app.log | grep ERROR | wc -l and record the command in challenge4.txt."
      "Explain when to pick awk vs sed in challenge5.txt."
    )
    HINTS=(
      "awk -F, sets delimiter."
      "Use a condition on \$2."
      "sed 's/old/new/' with redirection."
      "Pipe grep to wc -l."
      "awk for fields/logic; sed for stream edits."
    )
    SOLUTIONS=(
      "awk -F, '{print \$1}' data/users.csv"
      "awk -F, '\$2==\"admin\" {print \$0}' data/users.csv"
      "sed 's/WARN/INFO/g' data/app.log > data/app-clean.log"
      "cat data/app.log | grep ERROR | wc -l"
      "Use awk for column-based processing; sed for simple substitutions/deletions."
    )
    ;;
  scripting-4)
    TITLE="Automation with Cron Jobs"
    DESCRIPTION="Schedule scripts to run automatically."
    COMMANDS=("crontab -e" "crontab -l" "/etc/crontab")
    OBJECTIVES=(
      "Understand cron syntax"
      "Edit crontab"
      "Set up scheduled tasks"
      "Debug cron job issues"
    )
    TASKS=(
      "Add a cron entry to run exercises/workspace/cron-task.sh every minute (write the crontab line into challenge1.txt, do not install if cron not running)."
      "List current crontab (command only) in challenge2.txt."
      "Show how to log cron output to a file in challenge3.txt."
      "Write a command to remove all cron entries for current user in challenge4.txt."
      "Explain in challenge5.txt the meaning of the five time fields."
    )
    HINTS=(
      "Format: min hour day month weekday command."
      "crontab -l lists entries."
      "Redirect stdout/stderr to a log file."
      "crontab -r removes user crontab."
      "Fields are minute hour day-of-month month day-of-week."
    )
    SOLUTIONS=(
      "* * * * * /home/student/labs/$LAB_ID/exercises/workspace/cron-task.sh"
      "crontab -l"
      "* * * * * /home/student/labs/$LAB_ID/exercises/workspace/cron-task.sh >> /home/student/cron.log 2>&1"
      "crontab -r"
      "Minute, hour, day of month, month, day of week."
    )
    ;;
  security-1)
    TITLE="User and Password Management"
    DESCRIPTION="Manage users and understand Linux authentication."
    COMMANDS=("useradd" "userdel" "passwd" "usermod" "groupadd")
    OBJECTIVES=(
      "Add and remove users"
      "Set and change passwords"
      "Understand /etc/passwd and /etc/shadow"
      "Manage user groups"
    )
    TASKS=(
      "List audituser entry from /etc/passwd using grep; record command+output in challenge1.txt."
      "Set a password for audituser with passwd (you can set 'labpass'); note the command in challenge2.txt."
      "Add audituser to sudo group (or sudoers file) using usermod -aG; record command in challenge3.txt."
      "Show groups for audituser with groups audituser; record output in challenge4.txt."
      "Explain /etc/shadow purpose in challenge5.txt."
    )
    HINTS=(
      "grep username in /etc/passwd."
      "passwd prompts for password."
      "usermod -aG appends groups."
      "groups USER shows memberships."
      "Shadow stores hashed passwords."
    )
    SOLUTIONS=(
      "grep '^audituser:' /etc/passwd"
      "sudo passwd audituser"
      "sudo usermod -aG sudo audituser"
      "groups audituser"
      "/etc/shadow holds hashed passwords with stricter permissions."
    )
    ;;
  security-2)
    TITLE="Basic Firewall with iptables/ufw"
    DESCRIPTION="Configure firewall rules to secure your system."
    COMMANDS=("ufw enable" "ufw allow" "ufw deny" "ufw status")
    OBJECTIVES=(
      "Understand firewall concepts"
      "Use ufw for simple firewall management"
      "Allow and deny specific ports"
      "Check firewall status"
    )
    TASKS=(
      "Enable ufw (if available) or note if unavailable; record command/output in challenge1.txt."
      "Allow SSH on port 22; record command in challenge2.txt."
      "List firewall status; record output in challenge3.txt."
      "Deny port 8080 (command only) in challenge4.txt."
      "Explain default deny vs allow rules in challenge5.txt."
    )
    HINTS=(
      "ufw enable toggles firewall."
      "Use ufw allow <port>."
      "ufw status shows rules."
      "ufw deny <port> blocks."
      "Default deny drops unless explicitly allowed."
    )
    SOLUTIONS=(
      "sudo ufw enable"
      "sudo ufw allow 22"
      "sudo ufw status"
      "sudo ufw deny 8080"
      "Default deny blocks all except allowed; default allow permits unless denied."
    )
    ;;
  security-3)
    TITLE="SSH Remote Access and Key Management"
    DESCRIPTION="Master secure remote access with SSH, including key generation and configuration."
    COMMANDS=(
      "ssh user@hostname"
      "ssh-keygen -t rsa -b 4096"
      "ssh-copy-id user@hostname"
      "ssh -i ~/.ssh/id_rsa user@hostname"
      "ssh-add ~/.ssh/id_rsa"
      "ssh -v user@hostname"
      "scp file.txt user@hostname:/path/"
      "ssh user@hostname \"command\""
      "cat ~/.ssh/authorized_keys"
      "chmod 600 ~/.ssh/id_rsa"
    )
    OBJECTIVES=(
      "Understand SSH protocol and its security benefits"
      "Generate and manage SSH key pairs"
      "Configure SSH client and server settings"
      "Use SSH for secure remote command execution"
      "Set up passwordless SSH authentication"
      "Troubleshoot common SSH connection issues"
    )
    TASKS=(
      "Generate SSH key pair in exercises/workspace/ssh/id_rsa; record command in challenge1.txt."
      "Append public key to ~/.ssh/authorized_keys; record command in challenge2.txt."
      "Set correct perms on ~/.ssh and authorized_keys; record chmod commands in challenge3.txt."
      "Test key-based auth locally with ssh -i (loopback/localhost); record command in challenge4.txt."
      "Explain how to disable password auth in sshd_config in challenge5.txt."
    )
    HINTS=(
      "ssh-keygen creates keys."
      "authorized_keys holds allowed public keys."
      "Typical perms: 700 ~/.ssh, 600 authorized_keys."
      "Use localhost to test."
      "PasswordAuthentication no disables passwords."
    )
    SOLUTIONS=(
      "ssh-keygen -t rsa -b 4096 -f exercises/workspace/ssh/id_rsa"
      "cat exercises/workspace/ssh/id_rsa.pub >> ~/.ssh/authorized_keys"
      "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
      "ssh -i exercises/workspace/ssh/id_rsa localhost"
      "Edit /etc/ssh/sshd_config: set PasswordAuthentication no and restart sshd."
    )
    ;;
  sysadmin-1)
    TITLE="Package Management"
    DESCRIPTION="Install, update, and remove software packages."
    COMMANDS=("apt update" "apt install" "apt remove" "apt search" "dpkg")
    OBJECTIVES=(
      "Update package lists"
      "Install and remove packages"
      "Search for packages"
      "Understand apt vs apt-get"
    )
    TASKS=(
      "Update package lists with sudo apt update; save output to challenge1.txt."
      "Search for curl package with apt search; append command+output to challenge2.txt."
      "Install (or simulate) tree package with sudo apt install -y tree; record command+result in challenge3.txt."
      "List installed version of bash using dpkg -l | grep bash; record in challenge4.txt."
      "Explain in challenge5.txt difference between apt and apt-get."
    )
    HINTS=(
      "apt update refreshes indexes."
      "apt search looks up packages."
      "apt install installs; -y auto-confirms."
      "dpkg -l lists packages."
      "apt is user-friendly front-end to apt-get."
    )
    SOLUTIONS=(
      "sudo apt update > challenge1.txt"
      "apt search curl >> challenge2.txt"
      "sudo apt install -y tree"
      "dpkg -l | grep bash"
      "apt is newer UX wrapper; apt-get is lower-level compatible tool."
    )
    ;;
  sysadmin-2)
    TITLE="System Monitoring and Logs"
    DESCRIPTION="Monitor system health and analyze logs."
    COMMANDS=("uptime" "free -h" "dmesg" "journalctl" "/var/log/")
    OBJECTIVES=(
      "Check system uptime and load"
      "Monitor memory usage"
      "View system logs"
      "Use dmesg for kernel messages"
    )
    TASKS=(
      "Check uptime and redirect output to challenge1.txt."
      "Show memory usage with free -h; append to challenge2.txt."
      "Show last 5 kernel messages with dmesg | tail -5; record in challenge3.txt."
      "List journalctl -n 10 entries; record command+output in challenge4.txt."
      "Describe where auth logs live on Debian in challenge5.txt."
    )
    HINTS=(
      "uptime shows load averages."
      "free -h shows RAM."
      "dmesg prints kernel ring buffer."
      "journalctl -n N shows recent logs."
      "Auth logs typically under /var/log/auth.log."
    )
    SOLUTIONS=(
      "uptime > challenge1.txt"
      "free -h >> challenge2.txt"
      "dmesg | tail -5 > challenge3.txt"
      "journalctl -n 10 > challenge4.txt"
      "/var/log/auth.log (or journalctl -u ssh)."
    )
    ;;
  awk)
    TITLE="AWK Essentials"
    DESCRIPTION="Practice column extraction and text processing with awk."
    COMMANDS=("awk '{print \$1}'" "awk -F, '{print \$2}'" "awk '/error/'" "awk '{sum+=\$1} END {print sum}'")
    OBJECTIVES=(
      "Print specific fields"
      "Filter lines by pattern"
      "Use custom delimiters"
      "Aggregate numeric columns"
    )
    TASKS=(
      "Print first column from data/scores.csv; record awk command in challenge1.txt."
      "Sum second column and output total; record command in challenge2.txt."
      "Filter rows where score > 12; record command in challenge3.txt."
      "Replace comma delimiter with tab using awk -F; record command in challenge4.txt."
      "Explain NR and NF meanings in challenge5.txt."
    )
    HINTS=(
      "Use -F, to split CSV."
      "Aggregate with sum variable."
      "Compare numeric field \$2 > 12."
      "Set OFS to a tab to change output separator."
      "NR is record number; NF is field count."
    )
    SOLUTIONS=(
      "awk -F, '{print \$1}' data/scores.csv"
      "awk -F, '{s+=\$2} END {print s}' data/scores.csv"
      "awk -F, '\$2>12 {print \$0}' data/scores.csv"
      "awk -F, 'BEGIN{OFS=\"\\t\"} {print \$1,\$2}' data/scores.csv"
      "NR = current line number; NF = number of fields in current record."
    )
    ;;
  sed)
    TITLE="sed Stream Editing"
    DESCRIPTION="Perform find/replace and line edits with sed."
    COMMANDS=("sed 's/foo/bar/'" "sed -n '1,5p'" "sed '/pattern/d'" "sed -E 's/([0-9]+)/[&]/g'")
    OBJECTIVES=(
      "Replace text in streams"
      "Print specific line ranges"
      "Delete matching lines"
      "Use extended regex for substitutions"
    )
    TASKS=(
      "Replace foo with bar in text.txt; record sed command in challenge1.txt."
      "Print first two lines of text.txt; record command in challenge2.txt."
      "Delete lines containing baz; record command in challenge3.txt."
      "Highlight digits by wrapping them in []; record command in challenge4.txt."
      "Explain difference between -n with p vs default printing in challenge5.txt."
    )
    HINTS=(
      "Use sed 's/old/new/'."
      "-n with '1,2p' prints range."
      "Use /pattern/d to delete."
      "Capture digits with regex group."
      "-n suppresses default output; p prints selected lines."
    )
    SOLUTIONS=(
      "sed 's/foo/bar/g' text.txt"
      "sed -n '1,2p' text.txt"
      "sed '/baz/d' text.txt"
      "sed -E 's/([0-9]+)/[\1]/g' text.txt"
      "-n stops automatic printing; p prints only matching/selected lines."
    )
    ;;
  grep)
    TITLE="grep Pattern Matching"
    DESCRIPTION="Search files efficiently with grep and regex."
    COMMANDS=("grep pattern file" "grep -r pattern ." "grep -i pattern" "grep -E '[0-9]+'" "grep -n pattern")
    OBJECTIVES=(
      "Search within files"
      "Use recursive search"
      "Apply basic regex"
      "Show line numbers"
    )
    TASKS=(
      "Find lines with error (case-insensitive) in log.txt; record command in challenge1.txt."
      "Show line numbers for matches; record command in challenge2.txt."
      "Count occurrences of alpha/beta/gamma using grep -c; record commands in challenge3.txt."
      "Use grep -E to match lines containing digits; record command in challenge4.txt."
      "Explain difference between grep -r and grep -R in challenge5.txt."
    )
    HINTS=(
      "Use -i for case-insensitive."
      "-n shows numbers."
      "-c counts per pattern."
      "-E enables ERE."
      "-r follows symlinks? actually -R follows; -r doesn't."
    )
    SOLUTIONS=(
      "grep -i 'error' log.txt"
      "grep -in 'error' log.txt"
      "grep -c 'alpha' log.txt; grep -c 'beta' log.txt; grep -c 'gamma' log.txt"
      "grep -E '[0-9]+' log.txt"
      "-r recurses without following symlinks; -R recurses and follows symlinks."
    )
    ;;
  git)
    TITLE="Git Basics"
    DESCRIPTION="Initialize repos, commit changes, and inspect history."
    COMMANDS=("git init" "git status" "git add" "git commit" "git log" "git diff")
    OBJECTIVES=(
      "Initialize a repository"
      "Stage and commit changes"
      "Inspect history and diffs"
      "Understand git status output"
    )
    TASKS=(
      "Initialize repo in repo/; record git init command in challenge1.txt."
      "Create README.md with a line of text and stage it; record commands in challenge2.txt."
      "Commit with message 'init'; record command in challenge3.txt."
      "Show git status output and copy it into challenge4.txt."
      "Explain difference between git diff and git log in challenge5.txt."
    )
    HINTS=(
      "Run git init inside repo/."
      "Use echo > README and git add."
      "git commit -m creates commit."
      "git status shows staging."
      "diff shows changes; log shows history."
    )
    SOLUTIONS=(
      "cd repo && git init"
      "cd repo && echo 'Hello repo' > README.md && git add README.md"
      "cd repo && git commit -m 'init'"
      "cd repo && git status"
      "git diff shows content changes; git log shows commit history."
    )
    ;;
  vim)
    TITLE="Vim Fundamentals"
    DESCRIPTION="Navigate and edit files using Vim." 
    COMMANDS=("vim" ":wq" ":q!" "i" "/pattern" ":set number")
    OBJECTIVES=(
      "Open and close files"
      "Enter insert and normal modes"
      "Search within files"
      "Save or quit safely"
    )
    TASKS=(
      "Open docs/note.txt in vim and add a new line 'edited via vim'; write the :wq command in challenge1.txt."
      "List two normal-mode navigation keys in challenge2.txt."
      "Show how to search for 'vim' inside the file (the / command) in challenge3.txt."
      "Explain :q! purpose in challenge4.txt."
      "Set line numbers via a vim command and note it in challenge5.txt."
    )
    HINTS=(
      "Use vim filename to open."
      "Normal mode arrows or h/j/k/l."
      "Search forward with /."
      ":q! quits without saving."
      "Use :set number."
    )
    SOLUTIONS=(
      "vim docs/note.txt (add line, then :wq to save)"
      "h and l move left/right; j and k move down/up"
      "Type /vim then Enter"
      ":q! quits discarding changes"
      ":set number"
    )
    ;;
  text-processing)
    TITLE="Text Processing Toolkit"
    DESCRIPTION="Combine cut, sort, uniq, and pipelines for data wrangling."
    COMMANDS=("cut -d, -f1" "sort" "uniq -c" "tr" "paste")
    OBJECTIVES=(
      "Slice fields from delimited text"
      "Sort and deduplicate lines"
      "Count occurrences with uniq"
      "Transform characters with tr"
    )
    TASKS=(
      "Use cut to extract the lang column from data/devs.csv; record command in challenge1.txt."
      "Sort the file by lang and save output to data/devs-sorted.csv; record command in challenge2.txt."
      "Count unique langs with sort | uniq -c; record pipeline in challenge3.txt."
      "Use tr to uppercase langs; record command in challenge4.txt."
      "Explain when to use paste vs cut in challenge5.txt."
    )
    HINTS=(
      "cut -d, -f2 extracts second column."
      "sort -t, -k2 sorts by column 2."
      "Pipe sort to uniq -c."
      "tr can translate to uppercase."
      "paste combines files/columns; cut extracts."
    )
    SOLUTIONS=(
      "cut -d, -f2 data/devs.csv"
      "sort -t, -k2 data/devs.csv > data/devs-sorted.csv"
      "cut -d, -f2 data/devs.csv | sort | uniq -c"
      "cut -d, -f2 data/devs.csv | tr '[:lower:]' '[:upper:]'"
      "Use paste to merge columns/files; cut to slice fields from existing lines."
    )
    ;;
  *)
    echo "Unknown LAB_ID: $LAB_ID" >&2
    exit 1
    ;;
esac

# Rebuild lab directory from scratch to enforce minimal hierarchy
rm -rf "$LAB_DIR"
mkdir -p "$WORK_DIR" "$LAB_DIR/hints" "$LAB_DIR/solutions"
cd "$LAB_DIR"

# Seed lab-specific files before writing instructions
prepare_lab_data

cat > README.txt <<EOF
Linux Lab: $TITLE
Lab ID: $LAB_ID

Description:
$DESCRIPTION

Objectives:
EOF
for obj in "${OBJECTIVES[@]}"; do
  echo "- $obj" >> README.txt
done

echo "" >> README.txt
echo "Commands to practice:" >> README.txt
for cmd in "${COMMANDS[@]}"; do
  echo "- $cmd" >> README.txt
done

echo "" >> README.txt
echo "Workspace:" >> README.txt
echo "- Use exercises/workspace as your working directory." >> README.txt
echo "- All seed data lives inside exercises/workspace (nowhere else)." >> README.txt

echo "" >> README.txt
echo "Tasks:" >> README.txt
if [ ${#TASKS[@]} -gt 0 ]; then
  idx=1
  for task in "${TASKS[@]}"; do
    echo "$idx) $task" >> README.txt
    idx=$((idx+1))
  done
else
  cat >> README.txt <<'EOF'
1) Warm-up: try each listed command and note what it does
2) Apply: use the commands to explore /home/student and /tmp
3) Combine: build a one-liner that chains two commands together
4) Troubleshoot: intentionally cause a small error and fix it
5) Document: record your learnings in challenge5.txt
EOF
fi

echo "" >> README.txt
echo "Hierarchy:" >> README.txt
echo "- exercises/exercises.txt (all tasks)" >> README.txt
echo "- hints/hint-<n>.txt (one per exercise)" >> README.txt
echo "- solutions/solution-<n>.txt (one per exercise)" >> README.txt

# Write exercises into a single file and create per-exercise hint/solution files at lab root
mkdir -p "$LAB_DIR/exercises"
: > "$LAB_DIR/exercises/exercises.txt"
for i in 1 2 3 4 5; do
  if [ ${#TASKS[@]} -ge $i ]; then
    task_text=${TASKS[$((i-1))]}
  else
    task_text="See README tasks for details."
  fi
  echo "$i) $task_text" >> "$LAB_DIR/exercises/exercises.txt"

  hint_file="$LAB_DIR/hints/hint-$i.txt"
  solution_file="$LAB_DIR/solutions/solution-$i.txt"

  if [ ${#HINTS[@]} -ge $i ]; then
    hint_text=${HINTS[$((i-1))]}
  else
    hint_text="Hint for exercise $i (add details as you discover them)."
  fi

  if [ ${#SOLUTIONS[@]} -ge $i ]; then
    solution_text=${SOLUTIONS[$((i-1))]}
  else
    solution_text="Write your command/answer for exercise $i here."
  fi

  echo "$hint_text" > "$hint_file"
  echo "$solution_text" > "$solution_file"
done

mkdir -p "$HOME/bin"
cat > "$HOME/bin/finished" <<'EOF'
#!/bin/bash
LAB_DIR="$HOME/labs/$LAB_ID"
missing=0
for i in 1 2 3 4 5; do
  solution_file="$LAB_DIR/solutions/solution-$i.txt"
  legacy="$LAB_DIR/challenge${i}.txt"
  if [ -f "$solution_file" ]; then
    echo "✅ Exercise $i: found $solution_file"
  elif [ -f "$legacy" ]; then
    echo "✅ Exercise $i: found legacy $legacy"
  else
    echo "❌ Exercise $i: missing ($solution_file)"
    missing=$((missing+1))
  fi
done
if [ "$missing" -eq 0 ]; then
  echo "All exercises recorded. Great job!"
else
  echo "$missing exercise(s) need attention."
fi
EOF
chmod +x "$HOME/bin/finished"

# Also install a global copy when permitted (ignore failures)
if command -v sudo >/dev/null 2>&1; then
  sudo cp "$HOME/bin/finished" /usr/local/bin/finished 2>/dev/null || true
  sudo chmod +x /usr/local/bin/finished 2>/dev/null || true
fi

echo "export PATH=\"$HOME/bin:$PATH\"" >> "$HOME/.bashrc"
echo "export PATH=\"$HOME/bin:$PATH\"" >> "$HOME/.profile"
echo "Lab $LAB_ID prepared in $LAB_DIR"
