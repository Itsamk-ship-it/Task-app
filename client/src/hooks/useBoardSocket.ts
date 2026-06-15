import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useBoardStore } from "../store";
import type { Board, Column, Task } from "../types";

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, { autoConnect: false });
  }
  return socket;
}

export function useBoardSocket(boardId: string | undefined) {
  const setCurrentBoard = useBoardStore((s) => s.setCurrentBoard);
  const currentBoard = useBoardStore((s) => s.currentBoard);

  useEffect(() => {
    if (!boardId) return;

    const s = getSocket();
    s.connect();
    s.emit("join-board", boardId);

    const handleBoardUpdate = (board: Board) => {
      if (board.id === boardId) {
        setCurrentBoard(board);
      }
    };

    const handleTaskCreated = (task: Task) => {
      if (!currentBoard || currentBoard.id !== boardId) return;
      const updated = {
        ...currentBoard,
        columns: currentBoard.columns.map((col) =>
          col.id === task.columnId
            ? { ...col, tasks: [...col.tasks, task] }
            : col
        ),
      };
      setCurrentBoard(updated);
    };

    const handleTaskUpdated = (task: Task) => {
      if (!currentBoard || currentBoard.id !== boardId) return;
      const updated = {
        ...currentBoard,
        columns: currentBoard.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === task.id ? task : t)),
        })),
      };
      setCurrentBoard(updated);
    };

    const handleTaskDeleted = ({ id }: { id: string }) => {
      if (!currentBoard || currentBoard.id !== boardId) return;
      const updated = {
        ...currentBoard,
        columns: currentBoard.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== id),
        })),
      };
      setCurrentBoard(updated);
    };

    const handleColumnCreated = (column: Column) => {
      if (!currentBoard || currentBoard.id !== boardId) return;
      setCurrentBoard({
        ...currentBoard,
        columns: [...currentBoard.columns, column],
      });
    };

    s.on("board:updated", handleBoardUpdate);
    s.on("task:created", handleTaskCreated);
    s.on("task:updated", handleTaskUpdated);
    s.on("task:deleted", handleTaskDeleted);
    s.on("column:created", handleColumnCreated);

    return () => {
      s.emit("leave-board", boardId);
      s.off("board:updated", handleBoardUpdate);
      s.off("task:created", handleTaskCreated);
      s.off("task:updated", handleTaskUpdated);
      s.off("task:deleted", handleTaskDeleted);
      s.off("column:created", handleColumnCreated);
    };
  }, [boardId, setCurrentBoard]);
}
