import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setCategories(await api.get("/categories"));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    try {
      await api.post("/categories", { name: newName.trim() });
      setNewName("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRename(id) {
    if (!editingName.trim()) return;
    try {
      await api.put(`/categories/${id}`, { name: editingName.trim() });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(category) {
    if (
      !confirm(
        `Delete "${category.name}"? Products in this category will become uncategorized.`
      )
    )
      return;
    await api.del(`/categories/${category.id}`);
    load();
  }

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-6">Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6 max-w-sm">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 px-3 py-2 rounded border text-sm bg-white"
          style={{ borderColor: "var(--line)" }}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded text-sm font-medium text-white"
          style={{ background: "var(--ink)" }}
        >
          Add
        </button>
      </form>

      {error && (
        <div
          className="text-sm mb-4 px-3 py-2 rounded max-w-sm"
          style={{ background: "var(--red-soft)", color: "var(--red)" }}
        >
          {error}
        </div>
      )}

      <div className="card max-w-lg overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-soft)" }}>
            Loading…
          </div>
        ) : categories.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-soft)" }}>
            No categories yet.
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              {editingId === c.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRename(c.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(c.id)}
                  className="px-2 py-1 rounded border text-sm"
                  style={{ borderColor: "var(--line)" }}
                />
              ) : (
                <div>
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs ml-2" style={{ color: "var(--ink-soft)" }}>
                    {c.productCount} product{c.productCount === 1 ? "" : "s"}
                  </span>
                </div>
              )}
              <div className="flex gap-3 text-xs font-medium">
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditingName(c.name);
                  }}
                  style={{ color: "var(--ink-soft)" }}
                >
                  Rename
                </button>
                <button onClick={() => handleDelete(c)} style={{ color: "var(--red)" }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
