#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

banner() {
  printf '\n========================================\n'
  printf ' Linux Lab Forge - Linux Setup\n'
  printf '========================================\n\n'
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf '[ERROR] Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

ensure_node_version() {
  local required="18.0.0"
  local version
  version="$(node -v | sed 's/^v//')"
  if [ "$(printf '%s\n%s' "$required" "$version" | sort -V | head -n1)" != "$required" ]; then
    printf '[ERROR] Node.js %s or newer is required (detected %s).\n' "$required" "$version" >&2
    printf 'Install via your package manager or https://nodejs.org/en/download/package-manager\n'
    exit 1
  fi
}

ensure_env_file() {
  local target="$1"
  local example="$2"
  if [ ! -f "$target" ] && [ -f "$example" ]; then
    cp "$example" "$target"
    printf '[INFO] Created %s from template.\n' "$target"
  fi
}

ensure_exec_bits() {
  find "$ROOT_DIR/server" -type f -name '*.sh' -print0 | while IFS= read -r -d '' file; do
    chmod +x "$file"
  done
}

ensure_docker_running() {
  if ! docker info >/dev/null 2>&1; then
    printf '[ERROR] Docker daemon is not reachable.\n'
    printf 'Please start Docker (systemctl start docker) or ensure your user is in the docker group.\n'
    exit 1
  fi
}

warn_if_not_in_docker_group() {
  if getent group docker >/dev/null 2>&1; then
    if ! id -nG "$USER" | tr ' ' '\n' | grep -qx docker; then
      printf '[WARN] User %s is not in the docker group. You may need sudo for docker commands.\n' "$USER"
      printf '       Fix with: sudo usermod -aG docker %s && newgrp docker\n' "$USER"
    fi
  fi
}

install_deps() {
  printf '[1/3] Installing root dependencies...\n'
  (cd "$ROOT_DIR" && npm install)
  printf '[2/3] Installing server dependencies...\n'
  (cd "$ROOT_DIR/server" && npm install)
  printf '[3/3] Ensuring shell scripts are executable...\n'
  ensure_exec_bits
}

print_next_steps() {
  cat <<'EONEXT'

Setup complete! Next steps:

  # Start frontend + backend with auto reload
  ./restart-servers.sh

  # Or run them separately
  npm run dev          # frontend (port 8080)
  npm run dev:server   # backend (port 3001)

Docker tips for Linux:
  - Ensure your user belongs to the `docker` group (sudo usermod -aG docker $USER)
  - Restart your shell after modifying group membership
  - Run `docker ps` to confirm you can talk to the daemon without sudo
EONEXT
}

banner
require_cmd docker
require_cmd npm
require_cmd node
ensure_docker_running
warn_if_not_in_docker_group
ensure_node_version
ensure_env_file "$ROOT_DIR/.env" "$ROOT_DIR/.env.example"
ensure_env_file "$ROOT_DIR/server/.env" "$ROOT_DIR/server/.env.example"
install_deps
print_next_steps
