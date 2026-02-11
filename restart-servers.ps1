#!/usr/bin/env pwsh
# Script to restart Linux Lab Forge servers with auto-reload

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Linux Lab Forge - Server Restart" -ForegroundColor Cyan
Write-Host "  (With Auto-Reload)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop all node processes
Write-Host "Stopping existing servers..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✓ Stopped all node processes" -ForegroundColor Green
Write-Host ""

# Start backend server with nodemon (auto-reload)
Write-Host "Starting backend server with auto-reload..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "server"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "✓ Backend server started with nodemon on http://localhost:3001" -ForegroundColor Green
Write-Host "  (Auto-reloads when you change server files)" -ForegroundColor Cyan
Write-Host ""

# Start frontend server (Vite already has hot reload)
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "✓ Frontend server started with Vite HMR on http://localhost:8080" -ForegroundColor Green
Write-Host "  (Hot Module Replacement already enabled)" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers are running with auto-reload!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:8080 (HMR enabled)" -ForegroundColor White
Write-Host "Backend:  http://localhost:3001 (nodemon watching)" -ForegroundColor White
Write-Host ""
Write-Host "Both servers will auto-reload when you make changes!" -ForegroundColor Yellow
Write-Host "No need to restart manually anymore!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
