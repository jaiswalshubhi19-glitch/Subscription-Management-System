@echo off
set "PATH=%~dp0.tools\node;%PATH%"
cd /d "%~dp0frontend"
echo ========================================================
echo  Building SubscriptIQ Frontend for Production...
echo ========================================================
npm run build
