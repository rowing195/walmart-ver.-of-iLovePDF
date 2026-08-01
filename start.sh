#!/usr/bin/env bash
set -e

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$ROOT_DIR"

echo "========================================================"
echo "              PDF Craft Bash Launcher"
echo "========================================================"

if [ ! -d ".venv" ]; then
    echo "[1/3] Creating Python virtual environment (.venv)..."
    python3 -m venv .venv
fi

echo "[2/3] Installing Python backend dependencies..."
source .venv/bin/activate
pip install -r backend/requirements.txt

if [ ! -d "frontend/node_modules" ]; then
    echo "[3/3] Installing Frontend npm dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "Starting Backend & Frontend servers..."
python3 -m uvicorn app.main:app --reload --port 8000 --app-dir backend &
BACKEND_PID=$!

cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

echo "Backend running at http://localhost:8000"
echo "Frontend running at http://localhost:5173"

wait
