@echo off
echo ========================================
echo Auto-Debater Startup Script
echo ========================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Installing backend dependencies...
cd backend
if not exist node_modules (
    echo Installing Node.js packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo [2/3] Building frontend...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
echo Building frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)
cd ..

echo [3/3] Starting backend server...
cd backend
start "Auto-Debater Backend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Backend is running on http://localhost:8000
echo.
echo To create a public tunnel, run:
echo   cloudflared tunnel --url http://localhost:8000
echo.
pause
