# Linux Lab Forge

![Linux Lab Forge Logo](src/assets/wmremove-transformed_text.png)

Hands-on Linux training platform with a real SSH-ready container backend, curated lab catalog, and a custom lab builder. The frontend is a Vite/React app with a cinematic terminal hero, while the backend exposes REST + WebSocket APIs that orchestrate Docker containers for each exercise.

## Highlights

- **Real terminal** – `src/components/RealSSHTerminal.tsx` streams from the Node server over WebSockets, so users run the exact commands referenced in each lab.
- **Structured curriculum** – 30+ labs grouped into categories (`src/data/labs.ts`) with metadata for difficulty, duration, and hints.
- **Lab Builder** – Quickly create or preview custom labs through `src/pages/LabBuilder.tsx`, which persists definitions to `server/custom-labs.json` and generates shell scripts.
- **Responsive UI** – Built with Tailwind, ShadCN-inspired primitives.

## Tech Stack

| Layer | Details |
|-------|---------|
| Frontend | Vite, React 18, TypeScript, TailwindCSS, Lucide icons |
| Backend | Node 18, Express, WebSockets, Docker CLI orchestration |
| Tooling | ESLint, Vitest, Supabase integration hooks (placeholder), npm scripts |

## Repository Layout

```text
.
├── public/                     # Static assets served as-is (favicons, robots, original logo)
├── src/
│   ├── components/             # Reusable UI blocks + RealSSHTerminal
│   ├── pages/                  # Route-level components (Index, Labs, LabBuilder, etc.)
│   ├── data/                   # Lab catalog + custom lab ingestion
│   ├── assets/                 # Embedded assets (ASCII + PNG logo)
│   └── ...
├── server/
│   ├── index.js                # REST + WebSocket API
│   ├── exercises/              # Shell scripts that run inside containers
│   ├── generate-exercises.sh   # Scripted lab generation helper
│   └── Dockerfile              # Container image used for labs
├── setup.bat                   # Windows onboarding
├── setup.sh                    # Linux onboarding (WSL / native)
└── restart-servers.*           # Helper scripts to launch frontend + backend together
```

## Prerequisites

- Node.js **18.x** or newer and npm 10+
- Docker Engine / Docker Desktop (ensure the daemon is running)
- Git
- On Linux: user added to the `docker` group (`sudo usermod -aG docker $USER` → reconnect login)

## Initial Setup

### Windows

```powershell
.\setup.bat
```

The script checks Docker, installs npm dependencies in both the root and `server/`, then explains how to launch the dev servers.

### Linux / WSL / macOS

```bash
chmod +x setup.sh
./setup.sh
```

This script verifies Docker + Node, copies `.env` templates when missing, ensures shell scripts are executable, and installs dependencies.

## Running the App

Open **two** terminals (or use the helper script):

**Terminal A – Frontend**

```bash
npm run dev     # http://localhost:5173 by default
```

**Terminal B – Backend**

```bash
npm run dev:server   # runs server/index.js on http://localhost:3001
```

Or launch both with watchers:

```bash
./restart-servers.sh      # bash / Linux
./restart-servers.bat     # Windows
```

> If you prefer a single command and have `concurrently` installed globally, run `npm run dev:all`.

## Environment Variables

- Root `.env` – optional overrides for the Vite client.
- `server/.env` – defines backend port and other secrets (template: `server/.env.example`). The setup scripts copy templates when missing.

## Useful npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:server` | Run backend API with auto-reload |
| `npm run dev:all` | Uses `concurrently` to start both services |
| `npm run build` | Production build of the frontend |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint (TypeScript + React rules) |
| `npm test`, `npm run test:watch` | Vitest suites |

## Production Build

1. Frontend: `npm run build` → deploy `dist/` behind any static host.
2. Backend: `cd server && npm install --production && npm start` (or containerize via `server/Dockerfile`).
3. Ensure the frontend points to the deployed backend URL via environment variables (`VITE_API_URL`, etc., if you add them).

## Branding Assets

- `src/assets/wmremove-transformed_text.png` – PNG logo ready for React imports (`import logo from '@/assets/wmremove-transformed_text.png';`).
- `src/assets/ascii-art.txt` – ASCII variant used inside the hero terminal (toggled via the penguin button).

## Troubleshooting

- **Blank terminal** – Backend probably isn’t running or port `3001` is already in use. Stop stray Node processes (`Get-Process node` on Windows or `pkill node` on Linux) and relaunch `npm run dev:server`.
- **Docker permission denied (Linux)** – Add your user to the `docker` group and re-login.
- **`EADDRINUSE` errors** – Check for lingering dev servers occupying ports `5173` or `3001`.
- **`npm run dev` crash on Linux** – Ensure Node ≥ 18 (`node -v`). Use `nvm` if necessary.

## Contributing

1. Fork + clone
2. Create a feature branch
3. Run `npm run lint && npm test`
4. Open a PR with screenshots or terminal captures when relevant

Enjoy hacking on Linux Lab Forge! Let the penguin guide your labs 🐧
