@echo off
chcp 65001 >nul
title Walmart Version of iLovePDF Launcher
echo ========================================================
echo               Walmart Version of iLovePDF Startup Script
echo ========================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: 1. Python Environment Setup
if not exist ".venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create Python virtual environment!
        pause
        exit /b 1
    )
)

echo [2/3] Checking and Installing Python backend dependencies...
"%ROOT_DIR%.venv\Scripts\python.exe" -m pip install --upgrade pip >nul 2>&1
"%ROOT_DIR%.venv\Scripts\python.exe" -m pip install -r "%ROOT_DIR%backend\requirements.txt"
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies!
    pause
    exit /b 1
)

:: 2. Frontend Node Dependencies Setup
if not exist "frontend\node_modules" (
    echo [3/3] Installing Frontend npm dependencies...
    cd /d "%ROOT_DIR%frontend"
    call npm.cmd install
    if errorlevel 1 (
        echo [ERROR] Failed to install npm dependencies!
        pause
        exit /b 1
    )
    cd /d "%ROOT_DIR%"
) else (
    echo [3/3] Frontend npm dependencies ready.
)

echo.
echo ========================================================
echo Starting Backend FastAPI and Frontend Vite React...
echo - Backend:  http://localhost:8000
echo - Frontend: http://localhost:5173
echo ========================================================
echo.

:: Launch Backend and Frontend. `start /d` sets the working directory, which
:: avoids nesting quoted paths inside `cmd /k` — that broke on any path
:: containing a space.
set "PY=%ROOT_DIR%.venv\Scripts\python.exe"

:: `cmd /s /k` keeps the window open on crash so the traceback stays readable;
:: /s makes cmd strip only the outer quotes, leaving the quoted exe path intact.
start "Walmart Version of iLovePDF Backend" /d "%ROOT_DIR%backend" cmd /s /k ""%PY%" -m uvicorn app.main:app --reload --port 8000"

start "Walmart Version of iLovePDF Frontend" /d "%ROOT_DIR%frontend" cmd /s /k "npm.cmd run dev"

:: Delay for servers to initialize
ping 127.0.0.1 -n 4 >nul

:: Open Browser
start http://localhost:5173

echo Walmart Version of iLovePDF is running! You can minimize this window.
echo.
pause
