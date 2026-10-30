@echo off
set "PATH=%~dp0.tools\node;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo  Starting SubscriptIQ Backend on http://localhost:4000
echo ========================================================
npm run dev
