import io
import zipfile
from pathlib import Path
from typing import List, Dict, Any, Tuple
import fitz  # PyMuPDF
from PIL import Image

class PDFService:
    @staticmethod
    def is_image_file(file_path: Path) -> bool:
        ext = file_path.suffix.lower()
        return ext in {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

    @staticmethod
    def get_document_info(file_path: Path) -> Dict[str, Any]:
        """
        Extract page count and dimensions for PDF or Image.
        """
        if PDFService.is_image_file(file_path):
            with Image.open(file_path) as img:
                w, h = img.size
            return {
                "page_count": 1,
                "is_image": True,
                "pages": [{"page_index": 0, "width": w, "height": h}]
            }
        
        # It's a PDF
        doc = fitz.open(file_path)
        pages = []
        for i in range(len(doc)):
            page = doc[i]
            rect = page.rect
            pages.append({
                "page_index": i,
                "width": float(rect.width),
                "height": float(rect.height)
            })
        doc.close()
        return {
            "page_count": len(pages),
            "is_image": False,
            "pages": pages
        }

    @staticmethod
    def render_thumbnail(file_path: Path, page_index: int, target_thumbnail_path: Path) -> Path:
        """
        Render page index to WebP/PNG thumbnail using PyMuPDF.
        """
        if target_thumbnail_path.exists():
            return target_thumbnail_path

        if PDFService.is_image_file(file_path):
            # Convert image to resized thumbnail PNG
            with Image.open(file_path) as img:
                img.thumbnail((300, 400))
                img.save(target_thumbnail_path, format="PNG")
            return target_thumbnail_path

        # Render PDF page thumbnail
        doc = fitz.open(file_path)
        if page_index < 0 or page_index >= len(doc):
            doc.close()
            raise ValueError(f"Page index {page_index} out of range (0-{len(doc)-1})")
        
        page = doc[page_index]
        # Scale to max ~300px width/height for fast thumbnail
        rect = page.rect
        max_dim = max(rect.width, rect.height)
        zoom = 300.0 / max_dim if max_dim > 0 else 0.5
        mat = fitz.Matrix(zoom, zoom)
        
        pix = page.get_pixmap(matrix=mat, alpha=False)
        pix.save(str(target_thumbnail_path))
        doc.close()
        
        return target_thumbnail_path

    @staticmethod
    def compile_pdf(workspace_path: Path, page_nodes: List[Dict[str, Any]]) -> Path:
        """
        Compile a new PDF document based on user-ordered PageNodes.
        Each node format: {"saved_name": "xxx.pdf", "page_index": 0, "rotation": 90}
        """
        out_doc = fitz.open()
        uploads_dir = workspace_path / "uploads"

        for node in page_nodes:
            saved_name = node["saved_name"]
            page_index = node.get("page_index", 0)
            rotation = node.get("rotation", 0) % 360

            file_path = uploads_dir / saved_name
            if not file_path.exists():
                continue

            if PDFService.is_image_file(file_path):
                # Convert image to single page PDF
                img_doc = fitz.open(file_path)
                pdf_bytes = img_doc.convert_to_pdf()
                img_doc.close()
                
                src_pdf = fitz.open("pdf", pdf_bytes)
                out_doc.insert_pdf(src_pdf, from_page=0, to_page=0)
                src_pdf.close()
            else:
                src_pdf = fitz.open(file_path)
                if 0 <= page_index < len(src_pdf):
                    out_doc.insert_pdf(src_pdf, from_page=page_index, to_page=page_index)
                src_pdf.close()

            # Apply rotation to newly inserted last page
            if rotation != 0 and len(out_doc) > 0:
                last_page = out_doc[-1]
                current_rot = last_page.rotation
                last_page.set_rotation((current_rot + rotation) % 360)

        output_path = workspace_path / "exports" / "compiled.pdf"
        out_doc.save(str(output_path), garbage=4, deflate=True)
        out_doc.close()
        return output_path

    @staticmethod
    def compile_images_zip(workspace_path: Path, page_nodes: List[Dict[str, Any]]) -> Path:
        """
        Render selected page_nodes into PNG images and pack into a ZIP file.
        """
        zip_path = workspace_path / "exports" / "extracted_images.zip"
        uploads_dir = workspace_path / "uploads"

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for idx, node in enumerate(page_nodes):
                saved_name = node["saved_name"]
                page_index = node.get("page_index", 0)
                rotation = node.get("rotation", 0) % 360

                file_path = uploads_dir / saved_name
                if not file_path.exists():
                    continue

                if PDFService.is_image_file(file_path):
                    with Image.open(file_path) as img:
                        if rotation != 0:
                            # PIL rotate counter-clockwise, so negative for clockwise
                            img = img.rotate(-rotation, expand=True)
                        img_byte_arr = io.BytesIO()
                        img.save(img_byte_arr, format="PNG")
                        img_bytes = img_byte_arr.getvalue()
                else:
                    src_pdf = fitz.open(file_path)
                    if 0 <= page_index < len(src_pdf):
                        page = src_pdf[page_index]
                        if rotation != 0:
                            page.set_rotation((page.rotation + rotation) % 360)
                        # Render high quality 150 DPI image
                        pix = page.get_pixmap(dpi=150)
                        img_bytes = pix.tobytes("png")
                    else:
                        img_bytes = b""
                    src_pdf.close()

                if img_bytes:
                    file_name_in_zip = f"page_{idx + 1:03d}.png"
                    zip_file.writestr(file_name_in_zip, img_bytes)

        return zip_path
