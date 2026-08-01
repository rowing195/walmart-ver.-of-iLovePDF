import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RotateCw, RotateCcw, Trash2, GripVertical, CheckCircle2, Image as ImageIcon, FileText } from 'lucide-react';
import { PageNode } from '../../types';
import { getThumbnailUrl } from '../../services/api';

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
    zIndex: isDragging ? 50 : 1,
  };

  const thumbnailUrl = getThumbnailUrl(sessionId, node.saved_name, node.page_index);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col rounded-xl border bg-slate-900/80 p-3 shadow-lg transition-all ${
        node.selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-900/95'
          : 'border-slate-800 hover:border-slate-700'
      } ${isDragging ? 'opacity-50 scale-105' : ''}`}
    >
      {/* Top Bar: Drag Handle, Badge, Checkbox */}
      <div className="flex items-center justify-between pb-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-500 hover:text-slate-300 active:cursor-grabbing p-1"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex items-center space-x-1.5 overflow-hidden text-xs text-slate-400 px-1">
          {node.is_image ? (
            <ImageIcon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          )}
          <span className="truncate max-w-[110px]" title={node.source_filename}>
            {node.source_filename}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleSelect(node.id)}
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
            node.selected
              ? 'border-indigo-500 bg-indigo-600 text-white'
              : 'border-slate-600 bg-slate-800 text-transparent hover:border-slate-400'
          }`}
          title={node.selected ? 'Deselect page' : 'Select page'}
        >
          <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Thumbnail View Container */}
      <div
        className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-950 p-2 cursor-pointer"
        onClick={() => onToggleSelect(node.id)}
      >
        <img
          src={thumbnailUrl}
          alt={`Page ${displayIndex}`}
          style={{ transform: `rotate(${node.rotation}deg)` }}
          className="max-h-full max-w-full object-contain transition-transform duration-300 ease-in-out shadow-md"
        />

        {/* Page Badge */}
        <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/90 px-2 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
          Page {displayIndex}
        </span>

        {/* Rotation Badge if rotated */}
        {node.rotation % 360 !== 0 && (
          <span className="absolute bottom-2 right-2 rounded-md bg-indigo-900/90 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-700">
            {node.rotation % 360}°
          </span>
        )}
      </div>

      {/* Bottom Action Bar: Rotate, Delete */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onRotate(node.id, -90)}
            className="rounded p-1 hover:bg-slate-800 hover:text-slate-200"
            title="Rotate Left 90°"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRotate(node.id, 90)}
            className="rounded p-1 hover:bg-slate-800 hover:text-slate-200"
            title="Rotate Right 90°"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDelete(node.id)}
          className="rounded p-1 hover:bg-rose-950 hover:text-rose-400"
          title="Delete Page"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
