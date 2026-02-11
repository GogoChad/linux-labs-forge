@echo off
echo ========================================
echo  Linux Lab Forge - Real SSH Setup
echo ========================================
echo.

echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [OK] Docker found
echo.

echo Checking if Docker is running...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo  1. Open TWO terminals
echo.
echo  Terminal 1 (Frontend):
echo    npm run dev
echo.
echo  Terminal 2 (Backend):
echo    cd server
echo    npm start
echo.
echo  Then open: http://localhost:8080
echo.
echo Or install concurrently and run:
echo   npm install -g concurrently
echo   npm run dev:all
echo.
pause
