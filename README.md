# Trello Lite

A lightweight task management app inspired by Trello. Organize work with boards, columns, and draggable tasks.

## Features

- **Login / Register** — JWT-based authentication with bcrypt password hashing
- **Boards** — Create, view, and delete project boards
- **Columns & Tasks** — Add custom columns and tasks to any board
- **Drag & Drop** — Move tasks between columns and reorder within a column
- **Real-time Updates** — Socket.io broadcasts changes to all clients on the same board
- **Relational Database** — SQLite with Prisma ORM (User → Board → Column → Task)
- **State Management** — Zustand stores for auth and board state

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript |
| State | Zustand |
| Drag & Drop | @dnd-kit |
| Routing | React Router |
| Backend | Express 5, TypeScript |
| Database | SQLite + Prisma |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |

## Getting Started

### Prerequisites

- Node.js 18+

### 1. Install dependencies

```bash
# Server
cd server
npm install
npx prisma generate
npx prisma db push

# Client
cd ../client
npm install
```

### 2. Run the app

Open two terminals:

```bash
# Terminal 1 — API server (port 3001)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Use the app

1. Register a new account
2. Create a board (comes with To Do, In Progress, Done columns)
3. Add tasks to columns
4. Drag tasks between columns or reorder them
5. Open the same board in another tab to see real-time sync

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/boards` | List user's boards |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/:id` | Get board with columns & tasks |
| DELETE | `/api/boards/:id` | Delete board |
| POST | `/api/boards/:id/columns` | Add column |
| POST | `/api/boards/:id/columns/:colId/tasks` | Add task |
| PUT | `/api/boards/:id/tasks/reorder` | Move/reorder task |
| DELETE | `/api/boards/:id/tasks/:taskId` | Delete task |

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── api.ts          # API client
│       ├── store.ts        # Zustand stores
│       ├── components/     # TaskCard, ColumnView
│       ├── pages/          # Auth, Dashboard, Board
│       └── hooks/          # Socket.io hook
└── server/                 # Express backend
    ├── prisma/schema.prisma
    └── src/
        ├── routes/         # auth, boards
        └── middleware/     # JWT auth
```

## Database Schema

```
User ──< Board ──< Column ──< Task
```

Each user owns multiple boards. Each board has ordered columns. Each column has ordered tasks with title and description.
