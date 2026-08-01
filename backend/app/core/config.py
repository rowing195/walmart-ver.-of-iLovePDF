import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
WORKSPACES_DIR = DATA_DIR / "workspaces"

# Create storage directory if it doesn't exist
WORKSPACES_DIR.mkdir(parents=True, exist_ok=True)

# Workspace TTL in seconds (1 hour)
WORKSPACE_TTL_SECONDS = 3600

# Allowed file extensions
ALLOWED_PDF_EXTENSIONS = {".pdf"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
