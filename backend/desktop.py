"""Desktop entry point: serves the API and the built SPA on one port, then
opens the browser. This is what gets frozen into WalmartPDF.exe."""
import socket
import threading
import time
import webbrowser

import uvicorn

from app.main import app

PREFERRED_PORT = 8000


def pick_port() -> int:
    # Fall back to an OS-assigned port so a busy 8000 isn't a dead end — the
    # browser is opened programmatically, so the user never types the port.
    for port in (PREFERRED_PORT, 0):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
            except OSError:
                continue
            return s.getsockname()[1]


def open_browser_when_ready(url: str, port: int) -> None:
    # uvicorn starts listening only after the lifespan startup hook, so an
    # accepted connection means the app is genuinely ready.
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.25)
            if s.connect_ex(("127.0.0.1", port)) == 0:
                webbrowser.open(url)
                return
        time.sleep(0.25)


if __name__ == "__main__":
    port = pick_port()
    url = f"http://127.0.0.1:{port}"
    print("=" * 56)
    print(f"  Walmart Version of iLovePDF is running at {url}")
    print("  Your browser should open automatically.")
    print("  Close this window to quit.")
    print("=" * 56)
    threading.Thread(
        target=open_browser_when_ready, args=(url, port), daemon=True
    ).start()
    # Server stays on the main thread so Ctrl+C works, and takes the app object
    # directly so it doesn't depend on sys.path shape inside the bundle.
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning", access_log=False)
