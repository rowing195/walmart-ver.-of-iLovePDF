# PyInstaller spec for the desktop build. Run via build.ps1, or directly:
#   pyinstaller WalmartPDF.spec --noconfirm --clean
# Requires frontend/dist to exist first (npm run build).
from PyInstaller.utils.hooks import collect_submodules

a = Analysis(
    ['backend/desktop.py'],
    pathex=['backend'],
    binaries=[],
    # The built SPA, served by StaticFiles from sys._MEIPASS/dist at runtime.
    datas=[('frontend/dist', 'dist')],
    # uvicorn resolves its loop/protocol/lifespan classes from strings at
    # Config.load() time, so static analysis can't see them.
    hiddenimports=collect_submodules('uvicorn'),
    hookspath=[],
    runtime_hooks=[],
    # Nothing here uses tkinter; excluding it also drops PIL.ImageTk (~10MB).
    excludes=['tkinter'],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='WalmartPDF',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    # UPX is the biggest single source of antivirus false positives and has a
    # history of corrupting native DLLs like PyMuPDF's and Pillow's.
    upx=False,
    console=True,
)
