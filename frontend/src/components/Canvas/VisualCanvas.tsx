import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { PageNode } from '../../types';
import { PageCard } from './PageCard';

interface VisualCanvasProps {
  pageNodes: PageNode[];
  sessionId: string;
  onPageNodesChange: (newNodes: PageNode[]) => void;
  onToggleSelect: (id: string) => void;
  onRotate: (id: string, deltaAngle: number) => void;
  onDelete: (id: string) => void;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  pageNodes,
  sessionId,
  onPageNodesChange,
  onToggleSelect,
  onRotate,
  onDelete,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pageNodes.findIndex((node) => node.id === active.id);
      const newIndex = pageNodes.findIndex((node) => node.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(pageNodes, oldIndex, newIndex);
        onPageNodesChange(reordered);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pageNodes.map((n) => n.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {pageNodes.map((node, index) => (
            <PageCard
              key={node.id}
              node={node}
              sessionId={sessionId}
              displayIndex={index + 1}
              onToggleSelect={onToggleSelect}
              onRotate={onRotate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
