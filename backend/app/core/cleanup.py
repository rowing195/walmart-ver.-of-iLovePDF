import time
import shutil
import asyncio
from pathlib import Path
from app.core.config import WORKSPACES_DIR, WORKSPACE_TTL_SECONDS

async def workspace_cleanup_loop():
    """
    Background loop checking for workspaces older than WORKSPACE_TTL_SECONDS and deleting them.
    """
    while True:
        try:
            now = time.time()
            if WORKSPACES_DIR.exists():
                for item in WORKSPACES_DIR.iterdir():
                    if item.is_dir():
                        mtime = item.stat().st_mtime
                        if now - mtime > WORKSPACE_TTL_SECONDS:
                            try:
                                shutil.rmtree(item)
                                print(f"[Cleanup] Purged expired workspace: {item.name}")
                            except Exception as e:
                                print(f"[Cleanup] Error deleting workspace {item.name}: {e}")
        except Exception as e:
            print(f"[Cleanup] Error in cleanup loop: {e}")

        # Sleep for 10 minutes before checking again
        await asyncio.sleep(600)
