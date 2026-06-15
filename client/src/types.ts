export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  position: number;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  userId: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}
