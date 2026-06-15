import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import { Server } from "socket.io";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export function createBoardRouter(io: Server) {
  const router = Router();

  router.get("/", async (req: AuthRequest, res) => {
    const boards = await prisma.board.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: { orderBy: { position: "asc" } },
          },
        },
      },
    });
    res.json(boards);
  });

  router.get("/:id", async (req: AuthRequest, res) => {
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.id), userId: req.userId },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: { orderBy: { position: "asc" } },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    res.json(board);
  });

  router.post("/", async (req: AuthRequest, res) => {
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        userId: req.userId!,
        columns: {
          create: [
            { title: "To Do", position: 0 },
            { title: "In Progress", position: 1 },
            { title: "Done", position: 2 },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: { tasks: true },
        },
      },
    });

    res.status(201).json(board);
  });

  router.patch("/:id", async (req: AuthRequest, res) => {
    const { title } = req.body;
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.id), userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    const updated = await prisma.board.update({
      where: { id: board.id },
      data: { title: title?.trim() || board.title },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: { tasks: { orderBy: { position: "asc" } } },
        },
      },
    });

    io.to(`board:${board.id}`).emit("board:updated", updated);
    res.json(updated);
  });

  router.delete("/:id", async (req: AuthRequest, res) => {
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.id), userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    await prisma.board.delete({ where: { id: board.id } });
    io.to(`board:${board.id}`).emit("board:deleted", { id: board.id });
    res.status(204).send();
  });

  // Columns
  router.post("/:boardId/columns", async (req: AuthRequest, res) => {
    const { title } = req.body;
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.boardId), userId: req.userId },
      include: { columns: true },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    const column = await prisma.column.create({
      data: {
        title: title?.trim() || "New Column",
        position: board.columns.length,
        boardId: board.id,
      },
      include: { tasks: true },
    });

    io.to(`board:${board.id}`).emit("column:created", column);
    res.status(201).json(column);
  });

  router.patch("/:boardId/columns/:columnId", async (req: AuthRequest, res) => {
    const { title } = req.body;
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.boardId), userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    const column = await prisma.column.update({
      where: { id: param(req.params.columnId) },
      data: { title: title?.trim() },
      include: { tasks: { orderBy: { position: "asc" } } },
    });

    io.to(`board:${board.id}`).emit("column:updated", column);
    res.json(column);
  });

  router.delete("/:boardId/columns/:columnId", async (req: AuthRequest, res) => {
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.boardId), userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    await prisma.column.delete({ where: { id: param(req.params.columnId) } });
    io.to(`board:${board.id}`).emit("column:deleted", { id: param(req.params.columnId) });
    res.status(204).send();
  });

  // Tasks
  router.post("/:boardId/columns/:columnId/tasks", async (req: AuthRequest, res) => {
    const { title, description } = req.body;
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.boardId), userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    const taskCount = await prisma.task.count({
      where: { columnId: param(req.params.columnId) },
    });

    const task = await prisma.task.create({
      data: {
        title: title?.trim() || "New Task",
        description: description?.trim() || "",
        position: taskCount,
        columnId: param(req.params.columnId),
      },
    });

    io.to(`board:${board.id}`).emit("task:created", task);
    res.status(201).json(task);
  });

  router.patch("/:boardId/tasks/:taskId", async (req: AuthRequest, res) => {
    const { title, description } = req.body;
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.boardId), userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    const task = await prisma.task.update({
      where: { id: param(req.params.taskId) },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
    });

    io.to(`board:${board.id}`).emit("task:updated", task);
    res.json(task);
  });

  router.delete("/:boardId/tasks/:taskId", async (req: AuthRequest, res) => {
    const board = await prisma.board.findFirst({
      where: { id: param(req.params.boardId), userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    await prisma.task.delete({ where: { id: param(req.params.taskId) } });
    io.to(`board:${board.id}`).emit("task:deleted", { id: param(req.params.taskId) });
    res.status(204).send();
  });

  router.put("/:boardId/tasks/reorder", async (req: AuthRequest, res) => {
    const { taskId, columnId, position } = req.body;

    if (!taskId || !columnId || position === undefined) {
      return res.status(400).json({ error: "taskId, columnId, and position are required" });
    }

    const board = await prisma.board.findFirst({
      where: { id: param(req.params.boardId), userId: req.userId },
      include: {
        columns: {
          include: { tasks: { orderBy: { position: "asc" } } },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const sourceColumnId = task.columnId;
    const isSameColumn = sourceColumnId === columnId;

    await prisma.$transaction(async (tx) => {
      if (isSameColumn) {
        const tasks = await tx.task.findMany({
          where: { columnId },
          orderBy: { position: "asc" },
        });

        const filtered = tasks.filter((t) => t.id !== taskId);
        filtered.splice(position, 0, task);

        for (let i = 0; i < filtered.length; i++) {
          await tx.task.update({
            where: { id: filtered[i].id },
            data: { position: i, columnId },
          });
        }
      } else {
        const sourceTasks = await tx.task.findMany({
          where: { columnId: sourceColumnId },
          orderBy: { position: "asc" },
        });
        const destTasks = await tx.task.findMany({
          where: { columnId },
          orderBy: { position: "asc" },
        });

        const reorderedSource = sourceTasks.filter((t) => t.id !== taskId);
        for (let i = 0; i < reorderedSource.length; i++) {
          await tx.task.update({
            where: { id: reorderedSource[i].id },
            data: { position: i },
          });
        }

        destTasks.splice(position, 0, { ...task, columnId });
        for (let i = 0; i < destTasks.length; i++) {
          await tx.task.update({
            where: { id: destTasks[i].id },
            data: { position: i, columnId },
          });
        }
      }
    });

    const updatedBoard = await prisma.board.findUnique({
      where: { id: board.id },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: { tasks: { orderBy: { position: "asc" } } },
        },
      },
    });

    io.to(`board:${board.id}`).emit("board:updated", updatedBoard);
    res.json(updatedBoard);
  });

  return router;
}
