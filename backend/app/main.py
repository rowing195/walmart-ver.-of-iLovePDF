import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.cleanup import workspace_cleanup_loop

app = FastAPI(
    title="PDF Craft API",
    description="High-performance PDF and Image workbench API powered by PyMuPDF",
    version="1.0.0"
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

@app.on_event("startup")
async def startup_event():
    # Launch background workspace cleanup task
    asyncio.create_task(workspace_cleanup_loop())

@app.get("/")
def read_root():
    return {"message": "PDF Craft API Service is running."}
