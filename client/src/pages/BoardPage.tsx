import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { api } from "../api";
import { useBoardStore } from "../store";
import { useBoardSocket } from "../hooks/useBoardSocket";
import { ColumnView } from "../components/ColumnView";
import type { Task } from "../types";

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { currentBoard, setCurrentBoard, loading, setLoading, error, setError } =
    useBoardStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState("");

  useBoardSocket(id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (!id) return;
    loadBoard(id);
  }, [id]);

  const loadBoard = async (boardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const board = await api.getBoard(boardId);
      setCurrentBoard(board);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (columnId: string, title: string) => {
    if (!currentBoard) return;
    try {
      const task = await api.createTask(currentBoard.id, columnId, title);
      setCurrentBoard({
        ...currentBoard,
        columns: currentBoard.columns.map((col) =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, task] }
            : col
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentBoard) return;
    try {
      await api.deleteTask(currentBoard.id, taskId);
      setCurrentBoard({
        ...currentBoard,
        columns: currentBoard.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBoard || !columnTitle.trim()) return;

    try {
      const column = await api.createColumn(
        currentBoard.id,
        columnTitle.trim()
      );
      setCurrentBoard({
        ...currentBoard,
        columns: [...currentBoard.columns, column],
      });
      setColumnTitle("");
      setAddingColumn(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add column");
    }
  };

  const findTask = (taskId: string): Task | undefined => {
    if (!currentBoard) return undefined;
    for (const col of currentBoard.columns) {
      const task = col.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  };

  const findColumnId = (taskId: string): string | undefined => {
    if (!currentBoard) return undefined;
    for (const col of currentBoard.columns) {
      if (col.tasks.some((t) => t.id === taskId)) return col.id;
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTask(event.active.id as string);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !currentBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumnId = findColumnId(activeId);
    let overColumnId = over.data.current?.type === "column"
      ? overId
      : findColumnId(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    setCurrentBoard({
      ...currentBoard,
      columns: currentBoard.columns.map((col) => {
        if (col.id === activeColumnId) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== activeId),
          };
        }
        if (col.id === overColumnId) {
          const activeTask = findTask(activeId);
          if (!activeTask) return col;
          const overTaskIndex = col.tasks.findIndex((t) => t.id === overId);
          const newTasks = [...col.tasks];
          const insertIndex =
            overTaskIndex >= 0 ? overTaskIndex : newTasks.length;
          newTasks.splice(insertIndex, 0, {
            ...activeTask,
            columnId: overColumnId!,
          });
          return { ...col, tasks: newTasks };
        }
        return col;
      }),
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !currentBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const columnId =
      over.data.current?.type === "column" ? overId : findColumnId(overId);

    if (!columnId) return;

    const column = currentBoard.columns.find((c) => c.id === columnId);
    if (!column) return;

    const position = column.tasks.findIndex((t) => t.id === activeId);
    if (position === -1) return;

    try {
      const updated = await api.reorderTask(
        currentBoard.id,
        activeId,
        columnId,
        position
      );
      setCurrentBoard(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task");
      if (id) loadBoard(id);
    }
  };

  if (loading && !currentBoard) {
    return <div className="loading-page">Loading board...</div>;
  }

  if (!currentBoard) {
    return (
      <div className="loading-page">
        <p>Board not found</p>
        <Link to="/">Back to boards</Link>
      </div>
    );
  }

  return (
    <div className="board-page">
      <header className="board-header">
        <div className="header-left">
          <Link to="/" className="back-link">
            ← Boards
          </Link>
          <h1>{currentBoard.title}</h1>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {currentBoard.columns.map((column) => (
            <ColumnView
              key={column.id}
              column={column}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}

          {addingColumn ? (
            <form onSubmit={handleAddColumn} className="add-column-form">
              <input
                autoFocus
                placeholder="Column title..."
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
              />
              <div className="add-task-actions">
                <button type="submit" className="btn btn-primary btn-sm">
                  Add
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setAddingColumn(false);
                    setColumnTitle("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="add-column-btn"
              onClick={() => setAddingColumn(true)}
            >
              + Add column
            </button>
          )}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="task-card dragging-overlay">
              <p className="task-title">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
