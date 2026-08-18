import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setUsers(await api.get("/auth/users"));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/users", form);
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-6">Team</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">
            Add teammate
          </h2>

          {error && (
            <div
              className="text-sm mb-4 px-3 py-2 rounded"
              style={{ background: "var(--red-soft)", color: "var(--red)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              placeholder="Name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 rounded border text-sm bg-white"
              style={{ borderColor: "var(--line)" }}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="px-3 py-2 rounded border text-sm bg-white"
              style={{ borderColor: "var(--line)" }}
            />
            <input
              type="password"
              placeholder="Temporary password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="px-3 py-2 rounded border text-sm bg-white"
              style={{ borderColor: "var(--line)" }}
            />
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="px-3 py-2 rounded border text-sm bg-white"
              style={{ borderColor: "var(--line)" }}
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="py-2 rounded text-sm font-medium text-white disabled:opacity-60"
              style={{ background: "var(--ink)" }}
            >
              {submitting ? "Adding…" : "Add teammate"}
            </button>
          </form>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">
            Current team
          </h2>
          {loading ? (
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Loading…
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div style={{ color: "var(--ink-soft)" }}>{u.email}</div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: u.role === "ADMIN" ? "var(--amber-soft)" : "var(--line)",
                      color: u.role === "ADMIN" ? "var(--amber)" : "var(--ink-soft)",
                    }}
                  >
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
