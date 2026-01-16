@echo off
echo Starting all GK Store services...

start "Backend API" cmd /k "cd backend-hub-b1 && npm run dev"
timeout /t 3 /nobreak > nul

start "User Website" cmd /k "cd user-website && npm run dev"
timeout /t 2 /nobreak > nul

start "Admin Panel" cmd /k "cd admin-panel && npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo Backend:      http://localhost:6005
echo User Website: http://localhost:3000
echo Admin Panel:  http://localhost:3001
echo ========================================
