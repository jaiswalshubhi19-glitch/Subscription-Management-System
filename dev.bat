@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo Starting SubscriptIQ Frontend on http://localhost:3000...
npm run dev
