@echo off
echo ===============================
echo     QUICKTALK INSTALLER
echo ===============================
echo.

echo Installing server dependencies...
cd server
npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Installing client dependencies...
cd ../client
npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo ===============================
echo   INSTALLATION COMPLETE!
echo ===============================
echo.
echo Next steps:
echo 1. Create server/.env file with your API key
echo 2. Run run_quicktalk.bat to start the application
echo.
pause