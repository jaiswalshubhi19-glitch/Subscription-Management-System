@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo Building SubscriptIQ for Production...
npm run build
