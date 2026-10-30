@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo Starting SubscriptIQ Express Backend on http://localhost:4000...
cd backend
npm run dev
