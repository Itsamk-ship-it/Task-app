import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      <p className="task-title">{task.title}</p>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      <button
        className="task-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        ×
      </button>
    </div>
  );
}
