@echo off
cd /d "%~dp0"
echo Launching anchor signing tool...
node signMessage.js
pause
