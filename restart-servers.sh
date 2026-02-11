#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_LOG="$ROOT_DIR/.logs/frontend.log"
BACKEND_LOG="$ROOT_DIR/.logs/backend.log"

mkdir -p "$ROOT_DIR/.logs"

echo "[+] Killing old vite/nodemon processes (if any)..."
if command -v pkill >/dev/null 2>&1; then
  pkill -f "vite" >/dev/null 2>&1 || true
  pkill -f "node.*server/index.js" >/dev/null 2>&1 || true
  pkill -f "nodemon" >/dev/null 2>&1 || true
fi

echo "[+] Starting backend (server)..."
(cd "$ROOT_DIR" && npm run dev:server) >"$BACKEND_LOG" 2>&1 &
BACK_PID=$!

echo "[+] Starting frontend (Vite)..."
(cd "$ROOT_DIR" && npm run dev) >"$FRONTEND_LOG" 2>&1 &
FRONT_PID=$!

cat <<EOF
========================================
 Linux Lab Forge dev servers running
----------------------------------------
Frontend : http://localhost:5173 (log: $FRONTEND_LOG)
Backend  : http://localhost:3001 (log: $BACKEND_LOG)
----------------------------------------
Press Ctrl+C to stop both. To tail logs:
  tail -f "$FRONTEND_LOG" "$BACKEND_LOG"
========================================
EOF

wait $BACK_PID $FRONT_PID
