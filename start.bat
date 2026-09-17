@echo off
setlocal
title Prompt Gallery
pushd "%~dp0"
if errorlevel 1 exit /b 1

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is missing. Install Node.js 22.13 or newer, then try again.
    goto :failed
)
node -e "const [major,minor]=process.versions.node.split('.').map(Number); process.exit(major>22 || major===22 && minor>=13 ? 0 : 1)"
if errorlevel 1 (
    echo [ERROR] Node.js 22.13 or newer is required. Current version:
    node --version
    goto :failed
)
where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is missing. Reinstall Node.js with npm included.
    goto :failed
)

echo [1/2] Installing or updating dependencies...
call npm.cmd install --include=dev --no-audit --no-fund
if errorlevel 1 goto :failed

echo [2/2] Starting Prompt Gallery...
echo Open http://localhost:5173 after Vite is ready.
echo Keep this window open. Press Ctrl+C to stop the servers.
call npm.cmd run dev
if errorlevel 1 goto :failed
popd
exit /b 0

:failed
echo.
echo [ERROR] Startup failed. See the message above.
pause
popd
exit /b 1
