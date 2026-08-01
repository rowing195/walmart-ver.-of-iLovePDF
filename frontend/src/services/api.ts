import { UploadedDocument, ExportRecipe } from '../types';

export async function uploadFile(file: File, sessionId: string | null): Promise<UploadedDocument & { session_id: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (sessionId) {
    formData.append('session_id', sessionId);
  }

  const res = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }

  return res.json();
}

export function getThumbnailUrl(sessionId: string, savedName: string, pageIndex: number): string {
  return `/api/documents/${sessionId}/${savedName}/pages/${pageIndex}/thumbnail`;
}

export async function exportPdf(recipe: ExportRecipe): Promise<Blob> {
  const res = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || 'Failed to generate PDF');
  }

  return res.blob();
}

export async function exportImagesZip(recipe: ExportRecipe): Promise<Blob> {
  const res = await fetch('/api/export/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || 'Failed to extract images ZIP');
  }

  return res.blob();
}
