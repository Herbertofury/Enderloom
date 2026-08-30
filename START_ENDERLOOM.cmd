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

if not exist "node_modules\electron\dist\electron.exe" (
  echo Installing the locked Enderloom JavaScript runtime...
  call npm ci
  if errorlevel 1 goto :failed
)

if not exist "launcher\dist\index.html" (
  echo Building the Enderloom launcher workspace...
  call npm run build:launcher
  if errorlevel 1 goto :failed
)

if not exist "native\target\debug\enderloom-service.exe" (
  echo Building the Enderloom native launcher service...
  call npm run build:launcher-service
  if errorlevel 1 goto :failed
)

echo Starting Enderloom...
call npm start
exit /b %errorlevel%

:failed
echo.
echo Enderloom could not finish its prerequisite build. The error is shown above.
pause
exit /b 1
