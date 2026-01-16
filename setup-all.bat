@echo off
echo ========================================
echo GK Store - Complete Setup
echo ========================================

echo.
echo [1/3] Setting up Backend...
cd backend-hub-b1
call npm install
if not exist .env copy .env.example .env
call npm run db:generate
echo Backend setup complete!

echo.
echo [2/3] Setting up User Website...
cd ..\user-website
call npm install
echo User Website setup complete!

echo.
echo [3/3] Setting up Admin Panel...
cd ..\admin-panel
call npm install
echo Admin Panel setup complete!

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure .env files in each project
echo 2. Start MongoDB and Redis
echo 3. Run: start-all.bat
echo.
pause
