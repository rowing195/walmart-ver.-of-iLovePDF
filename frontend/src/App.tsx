import { useEffect, useRef, useState } from 'react';
import { FileUploader } from './components/Upload/FileUploader';
import { VisualCanvas } from './components/Canvas/VisualCanvas';
import { ActionsToolbar } from './components/Toolbar/ActionsToolbar';
import { Sidebar } from './components/Sidebar';
import { PageNode } from './types';
import { uploadFile, exportPdf, exportImagesZip } from './services/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

const WORKSPACE_TTL_SECONDS = 3600;

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pageNodes, setPageNodes] = useState<PageNode[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(WORKSPACE_TTL_SECONDS);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    if (sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }
    const tick = () => {
      const elapsed = (Date.now() - (sessionStartRef.current ?? Date.now())) / 1000;
      setSecondsLeft(Math.max(0, Math.round(WORKSPACE_TTL_SECONDS - elapsed)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    setIsUploading(true);
    let currentSessionId = sessionId;

    try {
      const newNodes: PageNode[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const doc = await uploadFile(file, currentSessionId);

        if (!currentSessionId) {
          currentSessionId = doc.session_id;
          setSessionId(doc.session_id);
        }

        // Generate PageNode for each page in document
        for (let pIdx = 0; pIdx < doc.page_count; pIdx++) {
          newNodes.push({
            id: `${doc.doc_id}_p${pIdx}_${Math.random().toString(36).substring(2, 7)}`,
            doc_id: doc.doc_id,
            saved_name: doc.saved_name,
            source_filename: doc.filename,
            page_index: pIdx,
            rotation: 0,
            is_image: doc.is_image,
            selected: false,
          });
        }
      }

      setPageNodes((prev) => [...prev, ...newNodes]);
      showNotification('success', `Successfully processed ${files.length} document(s).`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setPageNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, selected: !n.selected } : n))
    );
  };

  const handleRotate = (id: string, deltaAngle: number) => {
    setPageNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, rotation: (n.rotation + deltaAngle + 360) % 360 } : n
      )
    );
  };

  const handleDelete = (id: string) => {
    setPageNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSelectAllToggle = () => {
    const selectedCount = pageNodes.filter((n) => n.selected).length;
    const shouldSelectAll = selectedCount !== pageNodes.length;

    setPageNodes((prev) => prev.map((n) => ({ ...n, selected: shouldSelectAll })));
  };

  const handleSelectPages = (pageNumbers: Set<number>) => {
    // Page numbers are 1-based canvas positions, matching the "Page N" badge.
    setPageNodes((prev) =>
      prev.map((n, i) => ({ ...n, selected: pageNumbers.has(i + 1) }))
    );
  };

  const handleRotateSelected = (deltaAngle: number) => {
    setPageNodes((prev) =>
      prev.map((n) =>
        n.selected ? { ...n, rotation: (n.rotation + deltaAngle + 360) % 360 } : n
      )
    );
  };

  const handleDeleteSelected = () => {
    setPageNodes((prev) => prev.filter((n) => !n.selected));
  };

  const getTargetNodesForExport = (onlySelected: boolean) => {
    if (onlySelected) {
      const selected = pageNodes.filter((n) => n.selected);
      return selected.length > 0 ? selected : pageNodes;
    }
    return pageNodes;
  };

  const handleExportPdf = async (onlySelected: boolean) => {
    if (!sessionId || pageNodes.length === 0) return;
    setIsExporting(true);

    try {
      const targetNodes = getTargetNodesForExport(onlySelected);
      const recipe = {
        session_id: sessionId,
        page_nodes: targetNodes.map((n) => ({
          saved_name: n.saved_name,
          page_index: n.page_index,
          rotation: n.rotation,
        })),
      };

      const blob = await exportPdf(recipe);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pdf_craft_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotification('success', 'PDF compiled and download started!');
    } catch (err: any) {
      showNotification('error', err.message || 'Export PDF failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImages = async (onlySelected: boolean) => {
    if (!sessionId || pageNodes.length === 0) return;
    setIsExporting(true);

    try {
      const targetNodes = getTargetNodesForExport(onlySelected);
      const recipe = {
        session_id: sessionId,
        page_nodes: targetNodes.map((n) => ({
          saved_name: n.saved_name,
          page_index: n.page_index,
          rotation: n.rotation,
        })),
      };

      const blob = await exportImagesZip(recipe);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted_pages_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotification('success', 'Images ZIP extracted and download started!');
    } catch (err: any) {
      showNotification('error', err.message || 'Export Images ZIP failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = pageNodes.filter((n) => n.selected).length;

  return (
    <div className="flex h-screen overflow-x-hidden bg-[#17191d] text-[#c7cbd1]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-[#26292f] px-5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[13px] font-semibold text-[#e5e7eb]">Walmart Version of iLovePDF</span>
            {sessionId && (
              <span className="font-mono text-[11px] text-[#6b7280]">/ workspace / {sessionId.slice(0, 8)}</span>
            )}
          </div>
          {sessionId ? (
            <div className="font-mono text-[11px] text-[#6b7280]">
              TTL <b className="text-[#3b9eff]">{formatCountdown(secondsLeft)}</b> remaining
            </div>
          ) : (
            <div className="text-[11px] text-[#6b7280]">Powered by PyMuPDF</div>
          )}
        </header>

        {/* Toast Notification Banner: fixed overlay so it never shifts layout when it appears/disappears */}
        {notification && (
          <div
            className={`fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit max-w-[calc(100vw-48px)] items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
              notification.type === 'success'
                ? 'border-[#1f9d6c]/40 bg-[#0f2019] text-[#5fd6a4]'
                : 'border-[#f27272]/40 bg-[#241a1a] text-[#f5a3a3]'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-[#1f9d6c]" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-[#f27272]" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Main Content Area */}
        {pageNodes.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col p-6">
            <div className="mb-5 shrink-0 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#e5e7eb]">
                Visual Page Manipulation &amp; Conversion
              </h2>
              <p className="mt-3 text-sm text-[#8b929c]">
                Reorder, rotate, split, merge, insert images, and extract pages with real-time PyMuPDF visual preview grid.
              </p>
            </div>

            <FileUploader onFilesSelected={handleFilesSelected} isUploading={isUploading} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <ActionsToolbar
              pageNodes={pageNodes}
              selectedCount={selectedCount}
              onAddFiles={handleFilesSelected}
              onSelectAllToggle={handleSelectAllToggle}
              onSelectPages={handleSelectPages}
              onRotateSelected={handleRotateSelected}
              onDeleteSelected={handleDeleteSelected}
              onExportPdf={handleExportPdf}
              onExportImages={handleExportImages}
              isExporting={isExporting}
            />

            {sessionId && (
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                <VisualCanvas
                  pageNodes={pageNodes}
                  sessionId={sessionId}
                  onPageNodesChange={setPageNodes}
                  onToggleSelect={handleToggleSelect}
                  onRotate={handleRotate}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
