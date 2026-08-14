import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.router import api_router
from app.core.cleanup import workspace_cleanup_loop
from app.core.config import STATIC_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Hold a reference so the task isn't garbage collected, and cancel it on
    # shutdown so quitting doesn't print "Task was destroyed but it is pending!"
    task = asyncio.create_task(workspace_cleanup_loop())
    yield
    task.cancel()


app = FastAPI(
    title="Walmart Version of iLovePDF API",
    description="High-performance PDF and Image workbench API powered by PyMuPDF",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for local development.
# No cookies/session auth are used, so credentials aren't needed here — that
# combined with a wildcard origin would violate the CORS spec anyway.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/api/health")
def health():
    return {"message": "Walmart Version of iLovePDF API Service is running."}

# Packaged/production mode: serve the built SPA from the same origin as the API,
# so the frontend's relative /api/... calls work without a proxy. Must be
# registered last — a mount at "/" claims every path not already routed.
# Absent in dev (no frontend/dist), where Vite serves the app and proxies /api.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
