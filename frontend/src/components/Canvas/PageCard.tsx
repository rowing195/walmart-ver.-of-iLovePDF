import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RotateCw, RotateCcw, Trash2, GripVertical, CheckCircle2, Image as ImageIcon, FileText } from 'lucide-react';
import { PageNode } from '../../types';
import { getThumbnailUrl } from '../../services/api';
import { Tooltip } from '../Tooltip';

interface PageCardProps {
  node: PageNode;
  sessionId: string;
  displayIndex: number;
  onToggleSelect: (id: string) => void;
  onRotate: (id: string, deltaAngle: number) => void;
  onDelete: (id: string) => void;
}

export const PageCard: React.FC<PageCardProps> = ({
  node,
  sessionId,
  displayIndex,
  onToggleSelect,
  onRotate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Only the dragged card should get its own stacking context: giving every
    // card a z-index (even 1) makes each one a grid-item stacking context, which
    // traps its tooltip bubble at that context's rank — a later, unrelated card
    // then paints over a tooltip that overflows into its space. Leaving it
    // "auto" otherwise lets the bubble's own z-index (80) win globally.
    zIndex: isDragging ? 50 : undefined,
  };

  const thumbnailUrl = getThumbnailUrl(sessionId, node.saved_name, node.page_index);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex flex-col gap-1.5 rounded-lg border bg-[#1c1f24] p-1.5 transition-colors ${
        node.selected ? 'border-[#3b9eff] shadow-[0_0_0_2px_rgba(59,158,255,0.25)]' : 'border-[#2a2e35] hover:border-[#3a3f47]'
      } ${isDragging ? 'opacity-50 scale-105' : ''}`}
    >
      {/* Top Bar: Drag Handle, Filename, Checkbox */}
      <div className="flex items-center justify-between">
        <Tooltip label="拖曳以重新排序頁面">
          <div
            {...attributes}
            {...listeners}
            className="flex cursor-grab p-0.5 text-[#565c65] hover:text-[#8b929c] active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </Tooltip>

        <div className="flex items-center gap-1 overflow-hidden px-1 font-mono text-[9px] text-[#6b7280]">
          {node.is_image ? (
            <ImageIcon className="h-3 w-3 shrink-0 text-[#3b9eff]" />
          ) : (
            <FileText className="h-3 w-3 shrink-0 text-[#6b7280]" />
          )}
          <span className="max-w-[70px] truncate" title={node.source_filename}>
            {node.source_filename}
          </span>
        </div>

        <Tooltip label="選取 / 取消選取此頁">
          <button
            type="button"
            onClick={() => onToggleSelect(node.id)}
            aria-label="選取 / 取消選取此頁"
            className={`flex h-[13px] w-[13px] items-center justify-center rounded-[3px] border transition-colors ${
              node.selected
                ? 'border-[#3b9eff] bg-[#3b9eff] text-[#0b1220]'
                : 'border-[#3a3f47] bg-transparent text-transparent hover:border-[#565c65]'
            }`}
          >
            <CheckCircle2 className="h-2.5 w-2.5 stroke-[3]" />
          </button>
        </Tooltip>
      </div>

      {/* Thumbnail View Container */}
      <div
        className="relative flex h-[90px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-md bg-[#131518]"
        onClick={() => onToggleSelect(node.id)}
      >
        <img
          src={thumbnailUrl}
          alt={`Page ${displayIndex}`}
          style={{ transform: `rotate(${node.rotation}deg)` }}
          className="max-h-full max-w-full object-contain transition-transform duration-300 ease-in-out"
        />

        <span className="absolute bottom-1 left-1 rounded border border-[#2a2e35] bg-[#131518]/90 px-1.5 py-0.5 font-mono text-[8px] font-medium text-[#9aa0a8]">
          {String(displayIndex).padStart(2, '0')}
        </span>

        {node.rotation % 360 !== 0 && (
          <span className="absolute bottom-1 right-1 rounded border border-[#3b9eff]/35 bg-[#3b9eff]/10 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-[#3b9eff]">
            {node.rotation % 360}°
          </span>
        )}
      </div>

      {/* Bottom Action Bar: Rotate, Delete */}
      <div className="flex items-center justify-between border-t border-[#24272d] pt-1">
        <div className="flex items-center gap-1.5">
          <Tooltip label="將此頁逆時針旋轉 90°" position="above">
            <button
              type="button"
              onClick={() => onRotate(node.id, -90)}
              aria-label="將此頁逆時針旋轉 90 度"
              className="flex text-[#565c65] hover:text-[#c7cbd1]"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </Tooltip>
          <Tooltip label="將此頁順時針旋轉 90°" position="above">
            <button
              type="button"
              onClick={() => onRotate(node.id, 90)}
              aria-label="將此頁順時針旋轉 90 度"
              className="flex text-[#565c65] hover:text-[#c7cbd1]"
            >
              <RotateCw className="h-3 w-3" />
            </button>
          </Tooltip>
        </div>

        <Tooltip label="刪除此頁" position="above">
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            aria-label="刪除此頁"
            className="flex text-[#565c65] hover:text-[#f27272]"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
