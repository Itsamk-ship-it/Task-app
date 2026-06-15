import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Board } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },
    }),
    { name: "auth-storage", partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
  setBoards: (boards: Board[]) => void;
  setCurrentBoard: (board: Board | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
