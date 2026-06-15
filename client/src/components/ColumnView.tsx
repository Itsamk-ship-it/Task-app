import { useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Column } from "../types";
import { TaskCard } from "./TaskCard";

interface Props {
  column: Column;
  onAddTask: (columnId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function ColumnView({ column, onAddTask, onDeleteTask }: Props) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(column.id, title.trim());
    setTitle("");
    setAdding(false);
  };

  return (
    <div className={`column ${isOver ? "column-over" : ""}`}>
      <div className="column-header">
        <h3>{column.title}</h3>
        <span className="task-count">{column.tasks.length}</span>
      </div>

      <div ref={setNodeRef} className="column-tasks">
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="add-task-form">
          <textarea
            autoFocus
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setAdding(false);
                setTitle("");
              }
            }}
          />
          <div className="add-task-actions">
            <button type="submit" className="btn btn-primary btn-sm">
              Add
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setAdding(false);
                setTitle("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="add-task-btn" onClick={() => setAdding(true)}>
          + Add a task
        </button>
      )}
    </div>
  );
}
