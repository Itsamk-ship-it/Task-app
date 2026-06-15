const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  register: (data: { email: string; password: string; name: string }) =>
    request<{ user: import("./types").User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: import("./types").User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBoards: () => request<import("./types").Board[]>("/boards"),

  getBoard: (id: string) => request<import("./types").Board>(`/boards/${id}`),

  createBoard: (title: string) =>
    request<import("./types").Board>("/boards", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  deleteBoard: (id: string) =>
    request<void>(`/boards/${id}`, { method: "DELETE" }),

  createColumn: (boardId: string, title: string) =>
    request<import("./types").Column>(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  createTask: (boardId: string, columnId: string, title: string) =>
    request<import("./types").Task>(
      `/boards/${boardId}/columns/${columnId}/tasks`,
      { method: "POST", body: JSON.stringify({ title }) }
    ),

  updateTask: (
    boardId: string,
    taskId: string,
    data: { title?: string; description?: string }
  ) =>
    request<import("./types").Task>(`/boards/${boardId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteTask: (boardId: string, taskId: string) =>
    request<void>(`/boards/${boardId}/tasks/${taskId}`, { method: "DELETE" }),

  reorderTask: (
    boardId: string,
    taskId: string,
    columnId: string,
    position: number
  ) =>
    request<import("./types").Board>(`/boards/${boardId}/tasks/reorder`, {
      method: "PUT",
      body: JSON.stringify({ taskId, columnId, position }),
    }),
};
