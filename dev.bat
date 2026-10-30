@echo off
set "PATH=%~dp0.tools\node;%PATH%"
cd /d "%~dp0frontend"
echo ========================================================
echo  Starting SubscriptIQ Frontend on http://localhost:3000
echo ========================================================
npm run dev
