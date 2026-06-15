import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import { createBoardRouter } from "./routes/boards.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.redirect("http://localhost:5173");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/boards", authMiddleware, createBoardRouter(io));

io.on("connection", (socket) => {
  socket.on("join-board", (boardId: string) => {
    socket.join(`board:${boardId}`);
  });

  socket.on("leave-board", (boardId: string) => {
    socket.leave(`board:${boardId}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
