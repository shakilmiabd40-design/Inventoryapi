import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Couldn't sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--paper)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-mono text-base font-bold text-white"
            style={{ background: "var(--amber)" }}
          >
            #
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">Stockroom</span>
        </div>

        <form onSubmit={handleSubmit} className="card p-6">
          <h1 className="font-display font-bold text-lg mb-1">Sign in</h1>
          <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
            Use your team credentials to access the inventory.
          </p>

          {error && (
            <div
              className="text-sm mb-4 px-3 py-2 rounded"
              style={{ background: "var(--red-soft)", color: "var(--red)" }}
            >
              {error}
            </div>
          )}

          <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-soft)" }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded border text-sm bg-white"
            style={{ borderColor: "var(--line)" }}
            placeholder="you@company.com"
          />

          <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-soft)" }}>
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-5 px-3 py-2 rounded border text-sm bg-white"
            style={{ borderColor: "var(--line)" }}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded font-medium text-sm text-white disabled:opacity-60"
            style={{ background: "var(--ink)" }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-center mt-4" style={{ color: "var(--ink-soft)" }}>
          First time? Run <code className="font-mono">npm run seed</code> in the backend to create
          the default admin login.
        </p>
      </div>
    </div>
  );
}
