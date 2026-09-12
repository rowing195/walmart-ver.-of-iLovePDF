import React, { useRef, useState } from 'react';
import {
  RotateCcw,
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
import { Tooltip } from '../Tooltip';

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
  const hasSelection = selectedCount > 0;

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
    <div className="relative z-20 flex h-[46px] shrink-0 items-center justify-between gap-3 border-b border-[#26292f] bg-[#1a1d22] px-4">
      <input
        ref={addFilesInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp"
        onChange={(e) => e.target.files && onAddFiles(e.target.files)}
        className="hidden"
      />

      {/* Left Group: Insert Files & Selection */}
      <div className="flex items-center gap-1.5">
        <Tooltip label="插入 PDF 或圖片檔案，可一次選取多個">
          <button
            type="button"
            onClick={() => addFilesInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md bg-[#3b9eff] px-2.5 py-1.5 text-xs font-semibold text-[#0b1220] transition-colors hover:bg-[#63b1ff]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Insert</span>
          </button>
        </Tooltip>

        <div className="mx-1 h-5 w-px bg-[#2a2e35]" />

        <Tooltip label="全選 / 取消全選所有頁面">
          <button
            type="button"
            onClick={onSelectAllToggle}
            disabled={totalCount === 0}
            aria-label="全選 / 取消全選所有頁面"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2a2e35] bg-[#21262d] text-[#c7cbd1] transition-colors hover:bg-[#282e36] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allSelected ? <CheckSquare className="h-3.5 w-3.5 text-[#3b9eff]" /> : <Square className="h-3.5 w-3.5" />}
          </button>
        </Tooltip>

        <Tooltip label="輸入頁碼範圍選取，例如 1-5, 8, 12-20">
          <div className="relative flex items-center">
            <Hash
              className={`pointer-events-none absolute left-2 h-3 w-3 ${
                rangeInvalid ? 'text-[#f27272]' : 'text-[#565c65]'
              }`}
            />
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => handleRangeChange(e.target.value)}
              placeholder="e.g. 1-5, 8"
              aria-label="輸入頁碼範圍選取，例如 1-5, 8, 12-20"
              aria-invalid={rangeInvalid}
              className={`w-32 rounded-md border bg-[#21262d] py-1.5 pl-6 pr-2 font-mono text-[11px] text-[#c7cbd1] placeholder:text-[#565c65] transition-colors focus:outline-none focus:ring-1 ${
                rangeInvalid
                  ? 'border-[#3a2a2a] focus:border-[#f27272] focus:ring-[#f27272]/40'
                  : 'border-[#2a2e35] hover:border-[#3a3f47] focus:border-[#3b9eff] focus:ring-[#3b9eff]/40'
              }`}
            />
          </div>
        </Tooltip>

        <div className="mx-1 h-5 w-px bg-[#2a2e35]" />

        <Tooltip label="將選取頁面逆時針旋轉 90°">
          <button
            type="button"
            onClick={() => onRotateSelected(-90)}
            disabled={!hasSelection}
            aria-label="將選取頁面逆時針旋轉 90 度"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2a2e35] bg-[#21262d] text-[#c7cbd1] transition-colors hover:bg-[#282e36] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        <Tooltip label="將選取頁面順時針旋轉 90°">
          <button
            type="button"
            onClick={() => onRotateSelected(90)}
            disabled={!hasSelection}
            aria-label="將選取頁面順時針旋轉 90 度"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2a2e35] bg-[#21262d] text-[#c7cbd1] transition-colors hover:bg-[#282e36] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        <Tooltip label="刪除選取的頁面（無法復原）">
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            aria-label="刪除選取的頁面"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3a2a2a] bg-[#241a1a] text-[#f27272] transition-colors hover:bg-[#2c1f1f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Right Group: Stats & Export Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden font-mono text-[11px] text-[#6b7280] lg:block">
          <span className="text-[#c7cbd1]">{selectedCount}</span> / <span className="text-[#c7cbd1]">{totalCount}</span> selected
        </div>

        <div className="flex items-center gap-1.5">
          <Tooltip label="依目前順序與旋轉狀態，匯出合併後的 PDF">
            <button
              type="button"
              disabled={isExporting || totalCount === 0}
              onClick={() => onExportPdf(selectedCount > 0)}
              className="flex items-center gap-1.5 rounded-md bg-[#1f9d6c] px-2.5 py-1.5 text-xs font-semibold text-[#0b1220] transition-colors hover:bg-[#28b47d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Export PDF{selectedCount > 0 ? ` (${selectedCount})` : ''}</span>
            </button>
          </Tooltip>

          <Tooltip label="將選取頁面另存為 PNG 圖片壓縮包">
            <button
              type="button"
              disabled={isExporting || totalCount === 0}
              onClick={() => onExportImages(selectedCount > 0)}
              className="flex items-center gap-1.5 rounded-md border border-[#2a2e35] bg-[#21262d] px-2.5 py-1.5 text-xs font-semibold text-[#c7cbd1] transition-colors hover:bg-[#282e36] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>ZIP{selectedCount > 0 ? ` (${selectedCount})` : ''}</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
