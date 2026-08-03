import logging
from typing import List, Dict, Any
from pydantic import BaseModel, field_validator
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.core.config import is_valid_saved_name
from app.services.workspace_service import WorkspaceService
from app.services.pdf_service import PDFService

logger = logging.getLogger(__name__)
router = APIRouter()

class PageNodeModel(BaseModel):
    saved_name: str
    page_index: int = 0
    rotation: int = 0

    @field_validator("saved_name")
    @classmethod
    def validate_saved_name(cls, v: str) -> str:
        if not is_valid_saved_name(v):
            raise ValueError("saved_name must be a server-generated document filename")
        return v

class ExportRequest(BaseModel):
    session_id: str
    page_nodes: List[PageNodeModel]

@router.post("/pdf")
async def export_pdf(req: ExportRequest):
    """
    Compile ordered PageNodes into a single merged PDF.
    """
    ws_path = WorkspaceService.get_workspace_path(req.session_id)
    if not ws_path:
        raise HTTPException(status_code=404, detail="Session workspace not found")

    if not req.page_nodes:
        raise HTTPException(status_code=400, detail="No pages provided for export")

    try:
        nodes = [node.dict() for node in req.page_nodes]
        out_pdf_path = PDFService.compile_pdf(ws_path, nodes)
        return FileResponse(
            out_pdf_path,
            media_type="application/pdf",
            filename="compiled_output.pdf"
        )
    except Exception:
        logger.exception("Failed to export PDF for session %s", req.session_id)
        raise HTTPException(status_code=500, detail="Failed to export PDF")

@router.post("/images")
async def export_images(req: ExportRequest):
    """
    Render selected PageNodes as PNGs and export as a ZIP file.
    """
    ws_path = WorkspaceService.get_workspace_path(req.session_id)
    if not ws_path:
        raise HTTPException(status_code=404, detail="Session workspace not found")

    if not req.page_nodes:
        raise HTTPException(status_code=400, detail="No pages selected for image extraction")

    try:
        nodes = [node.dict() for node in req.page_nodes]
        zip_path = PDFService.compile_images_zip(ws_path, nodes)
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename="extracted_pages.zip"
        )
    except Exception:
        logger.exception("Failed to export images ZIP for session %s", req.session_id)
        raise HTTPException(status_code=500, detail="Failed to export images")
