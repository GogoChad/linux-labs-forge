@echo off
REM Batch script to restart Linux Lab Forge servers with auto-reload

echo ========================================
echo   Linux Lab Forge - Server Restart
echo   (With Auto-Reload)
echo ========================================
echo.

echo Stopping existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Stopped all node processes
echo.

echo Starting backend server with auto-reload...
cd /d "%~dp0server"
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo [OK] Backend server started on http://localhost:3001
echo     (Auto-reloads when you change server files)
echo.

echo Starting frontend server...
cd /d "%~dp0"
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo [OK] Frontend server started on http://localhost:8080
echo     (Hot Module Replacement enabled)
echo.

echo ========================================
echo   Servers running with auto-reload!
echo ========================================
echo.
echo Frontend: http://localhost:8080 (HMR)
echo Backend:  http://localhost:3001 (nodemon)
echo.
echo Both servers auto-reload on changes!
echo No manual restarts needed!
echo.
echo Press any key to exit (servers will continue running)...
pause >nul
