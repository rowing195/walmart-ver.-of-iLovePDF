# Builds dist\WalmartPDF.exe — a single-file Windows executable bundling the
# FastAPI backend and the built React frontend.
#
# Windows only: PyInstaller cannot cross-compile, so a Windows .exe must be
# built on Windows.
$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
Set-Location $Root

function Assert-Command($name, $hint) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] '$name' was not found on PATH. $hint" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[1/4] Checking build prerequisites..." -ForegroundColor Cyan
Assert-Command node   "Install Node.js 18+ from https://nodejs.org"
Assert-Command npm    "Install Node.js 18+ from https://nodejs.org"
Assert-Command python "Install Python 3.10+ from https://python.org and enable 'Add to PATH'"

Write-Host "[2/4] Building frontend..." -ForegroundColor Cyan
Set-Location (Join-Path $Root "frontend")
# npm ci installs from package-lock.json. Do not set NODE_ENV=production here:
# the build needs devDependencies (vite, typescript, tailwind).
npm ci
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] npm ci failed." -ForegroundColor Red; exit 1 }
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Frontend build failed." -ForegroundColor Red; exit 1 }
Set-Location $Root

Write-Host "[3/4] Preparing build virtualenv..." -ForegroundColor Cyan
# A dedicated venv, so packages a developer installed into .venv can't leak
# into the bundle.
$BuildVenv = Join-Path $Root ".build-venv"
$BuildPy = Join-Path $BuildVenv "Scripts\python.exe"
if (-not (Test-Path $BuildPy)) {
    python -m venv $BuildVenv
    if (-not (Test-Path $BuildPy)) {
        Write-Host "[ERROR] Failed to create build virtualenv at $BuildVenv" -ForegroundColor Red
        exit 1
    }
}
& $BuildPy -m pip install --upgrade pip --quiet
& $BuildPy -m pip install -r (Join-Path $Root "backend\requirements.txt")
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Failed to install backend dependencies." -ForegroundColor Red; exit 1 }
& $BuildPy -m pip install pyinstaller
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Failed to install PyInstaller." -ForegroundColor Red; exit 1 }

Write-Host "[4/4] Packaging executable..." -ForegroundColor Cyan
& $BuildPy -m PyInstaller (Join-Path $Root "WalmartPDF.spec") --noconfirm --clean
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] PyInstaller failed." -ForegroundColor Red; exit 1 }

$ExePath = Join-Path $Root "dist\WalmartPDF.exe"
if (-not (Test-Path $ExePath)) {
    Write-Host "[ERROR] Build reported success but $ExePath is missing." -ForegroundColor Red
    exit 1
}
$SizeMB = [math]::Round((Get-Item $ExePath).Length / 1MB, 1)
Write-Host ""
Write-Host "Done: $ExePath ($SizeMB MB)" -ForegroundColor Green
Write-Host "This is unsigned, so first launch shows a SmartScreen warning:" -ForegroundColor Yellow
Write-Host "  More info -> Run anyway" -ForegroundColor Yellow
