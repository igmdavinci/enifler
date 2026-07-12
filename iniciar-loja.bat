@echo off
cd /d "%~dp0"
title Enifler - Servidor local
where npm >nul 2>nul
if %errorlevel%==0 (
  npm start
) else (
  py server.py
  if errorlevel 1 python server.py
)
pause
