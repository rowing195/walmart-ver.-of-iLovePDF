import uuid
import shutil
from pathlib import Path
from typing import Optional
from app.core.config import WORKSPACES_DIR

class WorkspaceService:
    @staticmethod
    def get_or_create_workspace(session_id: Optional[str] = None) -> tuple[str, Path]:
        if not session_id:
            session_id = str(uuid.uuid4())
        
        ws_path = WORKSPACES_DIR / session_id
        ws_path.mkdir(parents=True, exist_ok=True)
        (ws_path / "uploads").mkdir(exist_ok=True)
        (ws_path / "thumbnails").mkdir(exist_ok=True)
        (ws_path / "exports").mkdir(exist_ok=True)
        
        return session_id, ws_path

    @staticmethod
    def get_workspace_path(session_id: str) -> Optional[Path]:
        ws_path = WORKSPACES_DIR / session_id
        if ws_path.exists():
            return ws_path
        return None

    @staticmethod
    def save_upload_file(session_id: str, file_name: str, content: bytes) -> tuple[str, Path]:
        _, ws_path = WorkspaceService.get_or_create_workspace(session_id)
        doc_id = str(uuid.uuid4())
        ext = Path(file_name).suffix.lower()
        saved_name = f"{doc_id}{ext}"
        target_path = ws_path / "uploads" / saved_name
        
        with open(target_path, "wb") as f:
            f.write(content)
            
        return doc_id, target_path
