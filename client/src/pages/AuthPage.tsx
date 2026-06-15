import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuthStore } from "../store";

interface Props {
  mode: "login" | "register";
}

export function AuthPage({ mode }: Props) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result =
        mode === "login"
          ? await api.login({ email, password })
          : await api.register({ email, password, name });

      setAuth(result.user, result.token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">📋</div>
          <h1>Trello Lite</h1>
          <p>{mode === "login" ? "Welcome back" : "Create your account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account? <Link to="/register">Sign up</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
