@echo off
setlocal
cd /d "%~dp0.."
echo ==========================================
echo QMOOSA MASTER HEALER - ONE CLICK
echo ==========================================
where node >nul 2>&1 || (echo Node.js is required.& exit /b 1)
node scripts/master-healer.mjs
set "RC=%ERRORLEVEL%"
echo.
echo Report: .qmoosa\master-healing-report.json
if "%RC%"=="0" echo HEALED: all configured deterministic gates passed.
if not "%RC%"=="0" echo NOT FULLY HEALED: inspect the report; reality mode is fail-closed.
exit /b %RC%
