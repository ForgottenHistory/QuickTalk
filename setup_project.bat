@echo off
title Quicktalk Project Setup
echo ===============================
echo    QUICKTALK PROJECT SETUP
echo ===============================
echo This will install dependencies and set up your environment
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: 18 or higher
    echo.
    pause
    exit /b 1
)

echo Node.js version: 
node --version
echo npm version:
npm --version
echo.

REM Check if directories exist
if not exist "server" (
    echo ERROR: server directory not found!
    echo Make sure you're running this from the project root directory
    pause
    exit /b 1
)

if not exist "client" (
    echo ERROR: client directory not found!
    echo Make sure you're running this from the project root directory
    pause
    exit /b 1
)

echo Installing server dependencies...
cd server
npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)
echo Server dependencies installed successfully!

echo.
echo Installing client dependencies...
cd ../client
npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)
echo Client dependencies installed successfully!

echo.
echo Setting up environment file...
cd ../server
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo .env file created from template
        echo.
        echo IMPORTANT: Edit server/.env and add your Featherless API key!
        echo Example: FEATHERLESS_API_KEY=your_api_key_here
    ) else (
        echo Creating basic .env file...
        echo FEATHERLESS_API_KEY=your_api_key_here> .env
        echo PORT=5000>> .env
        echo NODE_ENV=development>> .env
        echo.
        echo IMPORTANT: Edit server/.env and add your real Featherless API key!
    )
) else (
    echo .env file already exists
)

echo.
echo ===============================
echo     SETUP COMPLETE!
echo ===============================
echo.
echo What's been set up:
echo  ✓ Server dependencies installed
echo  ✓ Client dependencies installed  
echo  ✓ Environment file created
echo.
echo Next steps:
echo  1. Get your API key from: https://featherless.ai
echo  2. Edit server/.env and replace 'your_api_key_here' with your real key
echo  3. Run run_quicktalk.bat to start the application
echo.
echo Useful commands:
echo  install.bat          - Reinstall dependencies
echo  install_clean.bat    - Clean install (removes node_modules first)
echo  run_quicktalk.bat    - Start the application
echo.

set /p openEnv="Open .env file now? (y/n): "
if /i "%openEnv%"=="y" (
    notepad server\.env
)

pause