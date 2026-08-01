import React, { useRef } from 'react';
import {
  RotateCw,
  Plus,
  CheckSquare,
  Square,
  FileDown,
  Archive,
  Trash,
} from 'lucide-react';
import { PageNode } from '../../types';

interface ActionsToolbarProps {
  pageNodes: PageNode[];
  selectedCount: number;
  onAddFiles: (files: FileList) => void;
  onSelectAllToggle: () => void;
  onRotateSelected: (deltaAngle: number) => void;
  onDeleteSelected: () => void;
  onExportPdf: (onlySelected: boolean) => void;
  onExportImages: (onlySelected: boolean) => void;
  isExporting: boolean;
}

export const ActionsToolbar: React.FC<ActionsToolbarProps> = ({
  pageNodes,
  selectedCount,
  onAddFiles,
  onSelectAllToggle,
  onRotateSelected,
  onDeleteSelected,
  onExportPdf,
  onExportImages,
  isExporting,
}) => {
  const addFilesInputRef = useRef<HTMLInputElement>(null);
  const totalCount = pageNodes.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div className="sticky top-4 z-40 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 shadow-2xl glass-panel">
      <input
        ref={addFilesInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp"
        onChange={(e) => e.target.files && onAddFiles(e.target.files)}
        className="hidden"
      />

      {/* Left Group: Insert Files & Selection */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => addFilesInputRef.current?.click()}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/30"
        >
          <Plus className="h-4 w-4" />
          <span>Insert PDF / Images</span>
        </button>

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        <button
          type="button"
          onClick={onSelectAllToggle}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800"
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4 text-indigo-400" />
          ) : (
            <Square className="h-4 w-4 text-slate-400" />
          )}
          <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
        </button>

        {selectedCount > 0 && (
          <>
            <button
              type="button"
              onClick={() => onRotateSelected(90)}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800"
            >
              <RotateCw className="h-4 w-4 text-indigo-400" />
              <span>Rotate ({selectedCount})</span>
            </button>

            <button
              type="button"
              onClick={onDeleteSelected}
              className="flex items-center space-x-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-300 transition-all hover:bg-rose-900/60"
            >
              <Trash className="h-4 w-4 text-rose-400" />
              <span>Delete ({selectedCount})</span>
            </button>
          </>
        )}
      </div>

      {/* Right Group: Stats & Export Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs text-slate-400 hidden lg:block">
          <span className="font-semibold text-indigo-400">{selectedCount}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalCount}</span> pages selected
        </div>

        <div className="flex items-center space-x-2">
          {/* Export PDF Button */}
          <button
            type="button"
            disabled={isExporting || totalCount === 0}
            onClick={() => onExportPdf(selectedCount > 0)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30"
          >
            <FileDown className="h-4 w-4" />
            <span>
              {selectedCount > 0
                ? `Export PDF (${selectedCount} Selected)`
                : 'Export Merged PDF'}
            </span>
          </button>

          {/* Export ZIP Images Button */}
          <button
            type="button"
            disabled={isExporting || totalCount === 0}
            onClick={() => onExportImages(selectedCount > 0)}
            className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Archive className="h-4 w-4 text-amber-400" />
            <span>
              {selectedCount > 0
                ? `Extract Images ZIP (${selectedCount})`
                : 'Extract Images ZIP'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
