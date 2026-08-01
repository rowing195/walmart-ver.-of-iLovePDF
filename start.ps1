$ErrorActionPreference = "Stop"
$RootDir = $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "              PDF Craft PowerShell Launcher" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $RootDir

# 1. Virtualenv setup
if (-not (Test-Path ".venv")) {
    Write-Host "[1/3] Creating Python virtual environment (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
}

Write-Host "[2/3] Checking & Installing Python backend dependencies..." -ForegroundColor Yellow
& ".\.venv\Scripts\python.exe" -m pip install -r backend\requirements.txt

# 2. Frontend setup
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[3/3] Installing Frontend npm dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
} else {
    Write-Host "[3/3] Frontend npm dependencies ready." -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Backend (http://localhost:8000) and Frontend (http://localhost:5173)..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootDir\backend'; & '$RootDir\.venv\Scripts\python.exe' -m uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootDir\frontend'; npm run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
