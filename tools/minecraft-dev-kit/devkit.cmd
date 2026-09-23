@echo off
setlocal
where py >nul 2>nul
if not errorlevel 1 goto use_py
python "%~dp0scripts\devkit.py" %*
exit /b %errorlevel%
:use_py
py -3 "%~dp0scripts\devkit.py" %*
exit /b %errorlevel%
