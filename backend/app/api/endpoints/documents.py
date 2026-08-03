import io
import logging
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from fastapi.responses import FileResponse
from PIL import Image, UnidentifiedImageError

from app.core.config import MAX_UPLOAD_SIZE_BYTES
from app.services.workspace_service import WorkspaceService, InvalidWorkspaceReference
from app.services.pdf_service import PDFService

logger = logging.getLogger(__name__)
router = APIRouter()


def _validate_file_content(content: bytes, ext: str) -> None:
    """Sniff the actual file content so a renamed file can't smuggle in as PDF/image."""
    if ext == ".pdf":
        if not content.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail="File is not a valid PDF")
        return
    try:
        with Image.open(io.BytesIO(content)) as img:
            img.verify()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="File is not a valid image")


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None)
):
    """
    Upload a PDF or Image document.
    Returns session_id, doc_id, filename, saved_name, and page info.
    """
    ext = Path(file.filename).suffix.lower()
    allowed = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}")

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds maximum upload size (50MB)")
    _validate_file_content(content, ext)

    try:
        sid, ws_path = WorkspaceService.get_or_create_workspace(session_id)
    except InvalidWorkspaceReference:
        raise HTTPException(status_code=400, detail="Invalid session_id")

    doc_id, saved_path = WorkspaceService.save_upload_file(sid, file.filename, content)

    # Extract metadata using PDFService
    try:
        info = PDFService.get_document_info(saved_path)
    except Exception:
        logger.exception("Failed to parse uploaded document %s", saved_path)
        raise HTTPException(status_code=500, detail="Failed to parse document")

    return {
        "session_id": sid,
        "doc_id": doc_id,
        "filename": file.filename,
        "saved_name": saved_path.name,
        "is_image": info["is_image"],
        "page_count": info["page_count"],
        "pages": info["pages"]
    }

@router.get("/{session_id}/{saved_name}/pages/{page_index}/thumbnail")
async def get_page_thumbnail(session_id: str, saved_name: str, page_index: int):
    """
    Get WebP thumbnail for a specific page of a document.
    """
    ws_path = WorkspaceService.get_workspace_path(session_id)
    if not ws_path:
        raise HTTPException(status_code=404, detail="Session workspace not found")

    file_path = WorkspaceService.resolve_upload_path(ws_path, saved_name)
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    thumb_name = f"{saved_name}_p{page_index}.png"
    target_thumb_path = ws_path / "thumbnails" / thumb_name

    try:
        thumb_path = PDFService.render_thumbnail(file_path, page_index, target_thumb_path)
        return FileResponse(thumb_path, media_type="image/png")
    except Exception:
        logger.exception("Failed to render thumbnail for %s page %s", saved_name, page_index)
        raise HTTPException(status_code=500, detail="Failed to render thumbnail")
