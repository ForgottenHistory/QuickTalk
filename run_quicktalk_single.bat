@echo off
echo Starting Quicktalk...
echo.

echo Installing/checking dependencies...
cd server
if not exist node_modules (
    echo Installing server dependencies...
    npm install
)

cd ../client
if not exist node_modules (
    echo Installing client dependencies...
    npm install
)

echo.
echo Starting both server and client...
echo Server will be at: http://localhost:5000
echo Client will be at: http://localhost:3000
echo.
echo Press Ctrl+C to stop both processes
echo.

cd ../server
start /b npm run dev

cd ../client
npm start