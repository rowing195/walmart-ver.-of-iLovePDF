import os
import re
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

# Maximum upload size (50MB)
MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024

# session_id and saved_name are always server-generated UUIDs (see
# WorkspaceService/save_upload_file). Any value that doesn't match this shape
# is rejected outright to prevent path traversal via user-controlled input.
UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
)
SAVED_NAME_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
    r"\.(pdf|jpg|jpeg|png|webp|bmp)$"
)


def is_valid_session_id(session_id: str) -> bool:
    return bool(session_id) and bool(UUID_RE.match(session_id))


def is_valid_saved_name(saved_name: str) -> bool:
    return bool(saved_name) and bool(SAVED_NAME_RE.match(saved_name))
