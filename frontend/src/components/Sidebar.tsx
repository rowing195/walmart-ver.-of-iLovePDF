import { FileText, LayoutGrid, Layers, History, Settings } from 'lucide-react';
import { Tooltip } from './Tooltip';

export function Sidebar() {
  return (
    <div className="relative z-20 flex w-[60px] shrink-0 flex-col items-center gap-1.5 border-r border-[#26292f] bg-[#131518] py-4">
      <div className="mb-3.5 flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[#3b9eff] text-[#0b1220]">
        <FileText className="h-4 w-4" />
      </div>

      <Tooltip label="頁面總覽 — 目前工作區的所有頁面" position="right">
        <button
          type="button"
          aria-label="頁面總覽"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#21262d] text-[#3b9eff]"
        >
          <LayoutGrid className="h-[18px] w-[18px]" />
        </button>
      </Tooltip>

      <Tooltip label="圖層排序（即將推出）" position="right">
        <button
          type="button"
          disabled
          aria-label="圖層排序（即將推出）"
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg text-[#6b7280]"
        >
          <Layers className="h-[18px] w-[18px]" />
        </button>
      </Tooltip>

      <Tooltip label="版本記錄（即將推出）" position="right">
        <button
          type="button"
          disabled
          aria-label="版本記錄（即將推出）"
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg text-[#6b7280]"
        >
          <History className="h-[18px] w-[18px]" />
        </button>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip label="工作區設定（即將推出）" position="right">
        <button
          type="button"
          disabled
          aria-label="工作區設定（即將推出）"
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg text-[#6b7280]"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
      </Tooltip>
    </div>
  );
}
