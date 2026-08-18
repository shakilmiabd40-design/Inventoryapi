import { useEffect, useState } from "react";
import { api } from "../lib/api";

const empty = {
  sku: "",
  name: "",
  description: "",
  price: "",
  cost: "",
  quantity: "",
  reorderLevel: 5,
  categoryId: "",
  isPublished: true,
};

export default function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        price: product.price,
        cost: product.cost ?? "",
        quantity: product.quantity,
        reorderLevel: product.reorderLevel,
        categoryId: product.categoryId || "",
        isPublished: Boolean(product.isPublished),
      });
    } else {
      setForm(empty);
    }
  }, [product]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        cost: form.cost === "" ? null : Number(form.cost),
        reorderLevel: Number(form.reorderLevel) || 0,
        categoryId: form.categoryId || null,
      };

      if (isEdit) {
        await api.put(`/products/${product.id}`, payload);
      } else {
        payload.quantity = Number(form.quantity) || 0;
        await api.post("/products", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Couldn't save product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display font-bold text-lg mb-4">
          {isEdit ? "Edit product" : "New product"}
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU">
              <input
                required
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                className="input font-mono"
                placeholder="SKU-001"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                className="input"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="input"
              rows={2}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price ($)">
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Cost ($)">
              <input
                type="number"
                step="0.01"
                value={form.cost}
                onChange={(e) => update("cost", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Reorder at">
              <input
                type="number"
                value={form.reorderLevel}
                onChange={(e) => update("reorderLevel", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          {!isEdit && (
            <Field label="Starting quantity">
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                className="input"
              />
            </Field>
          )}

          <label className="flex items-center gap-2 text-sm mt-1">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => update("isPublished", e.target.checked)}
            />
            Show on public API (visible to your website)
          </label>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded border text-sm font-medium"
              style={{ borderColor: "var(--line)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 rounded text-sm font-medium text-white disabled:opacity-60"
              style={{ background: "var(--ink)" }}
            >
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.875rem;
          background: white;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1" style={{ color: "var(--ink-soft)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
