@echo off
title Quicktalk Development Tools Setup
echo ===============================
echo  QUICKTALK DEVELOPMENT SETUP
echo ===============================
echo Installing additional development tools...
echo.

echo Installing global development tools...
echo.

echo Installing nodemon globally (for auto-restart)...
npm install -g nodemon
if errorlevel 1 (
    echo Warning: Failed to install nodemon globally
    echo You might need to run as administrator
)

echo.
echo Installing concurrently globally (for running both services)...
npm install -g concurrently
if errorlevel 1 (
    echo Warning: Failed to install concurrently globally
    echo You might need to run as administrator
)

echo.
echo Installing gh-pages globally (for deployment)...
npm install -g gh-pages
if errorlevel 1 (
    echo Warning: Failed to install gh-pages globally
    echo You might need to run as administrator
)

echo.
echo Installing project dependencies...
call install.bat

echo.
echo ===============================
echo   DEVELOPMENT SETUP COMPLETE!
echo ===============================
echo.
echo Global tools installed:
echo  ✓ nodemon (auto-restart server on changes)
echo  ✓ concurrently (run multiple commands)  
echo  ✓ gh-pages (deploy to GitHub Pages)
echo.
echo Available scripts in server/:
echo  npm run dev        - Start with auto-restart
echo  npm run dev:full   - Start both client and server
echo.
echo Available scripts in client/:
echo  npm run deploy     - Deploy to GitHub Pages
echo.
pause