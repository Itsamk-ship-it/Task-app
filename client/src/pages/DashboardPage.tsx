import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuthStore, useBoardStore } from "../store";

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { boards, setBoards, loading, setLoading, error, setError } =
    useBoardStore();
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBoards();
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const board = await api.createBoard(newTitle.trim());
      setBoards([board, ...boards]);
      setNewTitle("");
      navigate(`/board/${board.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this board?")) return;

    try {
      await api.deleteBoard(id);
      setBoards(boards.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board");
    }
  };

  return (
    <div className="dashboard">
      <header className="app-header">
        <div className="header-left">
          <span className="logo-small">📋</span>
          <h1>My Boards</h1>
        </div>
        <div className="header-right">
          <span className="user-name">Hi, {user?.name}</span>
          <button className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <form onSubmit={handleCreate} className="create-board-form">
          <input
            type="text"
            placeholder="Create a new board..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={creating || !newTitle.trim()}
          >
            {creating ? "Creating..." : "Create Board"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading boards...</div>
        ) : (
          <div className="board-grid">
            {boards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="board-card"
              >
                <h3>{board.title}</h3>
                <p>{board.columns.length} columns</p>
                <button
                  className="board-delete"
                  onClick={(e) => handleDelete(board.id, e)}
                  title="Delete board"
                >
                  ×
                </button>
              </Link>
            ))}
            {boards.length === 0 && (
              <div className="empty-state">
                <p>No boards yet. Create your first board above!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
