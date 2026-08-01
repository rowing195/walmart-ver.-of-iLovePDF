export interface DocumentPage {
  page_index: number;
  width: number;
  height: number;
}

export interface UploadedDocument {
  doc_id: string;
  filename: string;
  saved_name: string;
  is_image: boolean;
  page_count: number;
  pages: DocumentPage[];
}

export interface PageNode {
  id: string; // unique ID for React & dnd-kit (e.g. `${doc_id}_p${page_index}_${randomId}`)
  doc_id: string;
  saved_name: string;
  source_filename: string;
  page_index: number;
  rotation: number; // 0, 90, 180, 270
  is_image: boolean;
  selected: boolean;
}

export interface ExportRecipe {
  session_id: string;
  page_nodes: {
    saved_name: string;
    page_index: number;
    rotation: number;
  }[];
}
