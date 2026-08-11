import { useState } from 'react';
import { FileUploader } from './components/Upload/FileUploader';
import { VisualCanvas } from './components/Canvas/VisualCanvas';
import { ActionsToolbar } from './components/Toolbar/ActionsToolbar';
import { PageNode } from './types';
import { uploadFile, exportPdf, exportImagesZip } from './services/api';
import { Layers, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pageNodes, setPageNodes] = useState<PageNode[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white font-heading">
                Walmart Version of iLovePDF
              </h1>
              <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest">
                Visual PDF & Image Workbench
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Powered by PyMuPDF</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col">
        {/* Toast Notification Banner */}
        {notification && (
          <div
            className={`mb-6 flex items-center space-x-2 rounded-xl p-4 text-sm font-medium shadow-lg transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-800 text-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* View State A: No Documents Uploaded */}
        {pageNodes.length === 0 ? (
          <div className="my-auto py-12 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold tracking-tight text-white font-heading">
                  Visual Page Manipulation & Conversion
                </h2>
                <p className="mt-3 text-slate-400 text-base">
                  Reorder, rotate, split, merge, insert images, and extract pages with real-time PyMuPDF visual preview grid.
                </p>
              </div>

              <FileUploader onFilesSelected={handleFilesSelected} isUploading={isUploading} />
            </div>
          </div>
        ) : (
          /* View State B: Active Visual Canvas Workspace */
          <div className="flex-1 flex flex-col">
            <ActionsToolbar
              pageNodes={pageNodes}
              selectedCount={selectedCount}
              onAddFiles={handleFilesSelected}
              onSelectAllToggle={handleSelectAllToggle}
              onRotateSelected={handleRotateSelected}
              onDeleteSelected={handleDeleteSelected}
              onExportPdf={handleExportPdf}
              onExportImages={handleExportImages}
              isExporting={isExporting}
            />

            {sessionId && (
              <VisualCanvas
                pageNodes={pageNodes}
                sessionId={sessionId}
                onPageNodesChange={setPageNodes}
                onToggleSelect={handleToggleSelect}
                onRotate={handleRotate}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-400">
        Walmart Version of iLovePDF &copy; 2026. Ephemeral Local Workspace.
      </footer>
    </div>
  );
}

export default App;
