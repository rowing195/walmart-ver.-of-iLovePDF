import React, { useRef, useState } from 'react';
import {
  RotateCw,
  Plus,
  CheckSquare,
  Square,
  FileDown,
  Archive,
  Trash,
  Hash,
} from 'lucide-react';
import { PageNode } from '../../types';

/**
 * Parse a page range expression like "1-5, 8, 12-20" into 1-based page numbers
 * matching the "Page N" badge on each card.
 *
 * Numbers outside 1..maxPage are clamped away and reversed ranges ("8-3") are
 * read as ascending. A token that is still being typed ("5-") is skipped rather
 * than reported as invalid, so the input doesn't flash red mid-keystroke.
 */
function parsePageRanges(
  input: string,
  maxPage: number
): { indices: Set<number>; invalid: boolean } {
  const indices = new Set<number>();
  let invalid = false;

  const addRange = (from: number, to: number) => {
    const lo = Math.max(1, Math.min(from, to));
    const hi = Math.min(maxPage, Math.max(from, to));
    for (let i = lo; i <= hi; i++) indices.add(i);
  };

  for (const rawToken of input.split(',')) {
    const token = rawToken.trim();
    if (!token) continue;

    const single = token.match(/^(\d+)$/);
    if (single) {
      addRange(Number(single[1]), Number(single[1]));
      continue;
    }

    const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      addRange(Number(range[1]), Number(range[2]));
      continue;
    }

    if (/^\d+\s*-$/.test(token)) continue;

    invalid = true;
  }

  return { indices, invalid };
}

interface ActionsToolbarProps {
  pageNodes: PageNode[];
  selectedCount: number;
  onAddFiles: (files: FileList) => void;
  onSelectAllToggle: () => void;
  onSelectPages: (pageNumbers: Set<number>) => void;
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
  onSelectPages,
  onRotateSelected,
  onDeleteSelected,
  onExportPdf,
  onExportImages,
  isExporting,
}) => {
  const addFilesInputRef = useRef<HTMLInputElement>(null);
  const [rangeInput, setRangeInput] = useState('');
  const [rangeInvalid, setRangeInvalid] = useState(false);
  const totalCount = pageNodes.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  const handleRangeChange = (value: string) => {
    setRangeInput(value);

    const { indices, invalid } = parsePageRanges(value, totalCount);
    setRangeInvalid(invalid);

    // Apply live so the grid highlights as you type. An empty box is left alone
    // rather than clearing, so it doesn't undo Select All or manual clicks.
    if (!invalid && value.trim()) {
      onSelectPages(indices);
    }
  };

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

        <div className="relative flex items-center">
          <Hash
            className={`pointer-events-none absolute left-2.5 h-3.5 w-3.5 ${
              rangeInvalid ? 'text-rose-400' : 'text-slate-500'
            }`}
          />
          <input
            type="text"
            value={rangeInput}
            onChange={(e) => handleRangeChange(e.target.value)}
            placeholder="Select pages, e.g. 1-5, 8"
            aria-label="Select pages by number, for example 1-5, 8, 12-20"
            aria-invalid={rangeInvalid}
            title="Type page numbers to select them, e.g. 1-5, 8, 12-20"
            className={`w-52 rounded-xl border bg-slate-800/80 py-2 pl-8 pr-3 text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 ${
              rangeInvalid
                ? 'border-rose-800 focus:border-rose-700 focus:ring-rose-500/30'
                : 'border-slate-700 hover:border-slate-600 focus:border-indigo-600 focus:ring-indigo-500/30'
            }`}
          />
        </div>

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
