@echo off
setlocal
cd /d "%~dp0"

where node.exe >nul 2>nul
if errorlevel 1 (
  echo Enderloom needs Node.js 22 or newer to run from source.
  echo Install Node.js, then run this file again.
  pause
  exit /b 2
)

echo Preparing current Enderloom source build...
node scripts\prepare-source.js
if errorlevel 1 goto :failed

echo Starting Enderloom...
call npm start
exit /b %errorlevel%

:failed
echo.
echo Enderloom could not finish its prerequisite build. The error is shown above.
pause
exit /b 1
