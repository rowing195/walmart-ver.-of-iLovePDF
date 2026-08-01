# 4. One-Command Startup Script for Local Development

Date: 2026-08-01

## Status

Accepted

## Context

To run the application locally, both the Python FastAPI backend (uvicorn) and Vite React frontend (npm run dev) need to be launched simultaneously without requiring the user to manually manage multiple terminal windows.

## Decision

We will provide one-command startup scripts (`start.bat` for Windows double-click, `start.ps1` for PowerShell, `start.sh` for Unix/macOS) in the root directory.

- The startup script will set up Python virtualenv / install python dependencies if missing.
- Install frontend npm dependencies if missing.
- Spawn backend (`uvicorn backend.app.main:app --reload --port 8000`) and frontend (`npm run dev`) in parallel.

## Consequences

### Positive
- Double-click `start.bat` on Windows or run `./start.sh` on Linux/macOS to launch the entire stack instantly.
- Smooth local onboarding experience.

### Negative
- Needs script maintenance for Windows PowerShell and Unix Bash environments.
