FROM debian:latest

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8

RUN apt-get update -qq \
    && apt-get install -y -qq locales \
    && sed -i 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen \
    && apt-get install -y -qq \
        openssh-server \
        sudo \
        vim \
        nano \
        curl \
        wget \
        net-tools \
        iputils-ping \
        procps \
        grep \
        sed \
        gawk \
        git \
        python3 \
        build-essential \
        zsh \
        ca-certificates \
        less \
        man-db \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/run/sshd /run/sshd \
    && echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config \
    && echo 'PermitRootLogin no' >> /etc/ssh/sshd_config

RUN useradd -m -s /bin/bash student \
    && echo 'student:student123' | chpasswd \
    && echo 'student ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN mkdir -p /home/student/.ssh \
    && chmod 700 /home/student/.ssh \
    && chown -R student:student /home/student

RUN cat <<'ZRC' > /home/student/.zshrc
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

RUN chown student:student /home/student/.zshrc

RUN cat <<'LOGO_EOF' > /home/student/.bash_profile
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

RUN chown student:student /home/student/.bash_profile \
    && grep -qxF 'source ~/.bash_profile' /home/student/.bashrc || echo 'source ~/.bash_profile' >> /home/student/.bashrc \
    && chown student:student /home/student/.bashrc

EXPOSE 22

CMD ["/bin/bash"]
