@echo off
title Quicktalk Clean Install
echo ===============================
echo   QUICKTALK CLEAN INSTALLER
echo ===============================
echo This will delete existing node_modules and reinstall everything
echo.

set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo Installation cancelled.
    pause
    exit /b 0
)

echo.
echo Cleaning server dependencies...
cd server
if exist "node_modules" (
    echo Removing server/node_modules...
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    echo Removing server/package-lock.json...
    del package-lock.json
)

echo Installing fresh server dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Cleaning client dependencies...
cd ../client
if exist "node_modules" (
    echo Removing client/node_modules...
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    echo Removing client/package-lock.json...
    del package-lock.json
)

echo Installing fresh client dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo ===============================
echo  CLEAN INSTALLATION COMPLETE!
echo ===============================
echo.
echo Next steps:
echo 1. Create server/.env file with your API key
echo 2. Run run_quicktalk.bat to start the application
echo.
pause