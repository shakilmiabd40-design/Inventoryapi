import { useState } from "react";
import { api } from "../lib/api";

const types = [
  { value: "RESTOCK", label: "Restock (add)" },
  { value: "SALE", label: "Sale (remove)" },
  { value: "RETURN", label: "Return (add)" },
  { value: "ADJUSTMENT", label: "Adjustment (+/-)" },
];

export default function StockAdjustModal({ product, onClose, onSaved }) {
  const [type, setType] = useState("RESTOCK");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/stock/movements", {
        productId: product.id,
        type,
        quantity: Number(quantity),
        note: note || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.message || "Couldn't record movement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-sm p-6">
        <h2 className="font-display font-bold text-lg mb-1">Adjust stock</h2>
        <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
          {product.name} — currently {product.quantity} on hand
        </p>

        {error && (
          <div
            className="text-sm mb-4 px-3 py-2 rounded"
            style={{ background: "var(--red-soft)", color: "var(--red)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="block">
            <span className="block text-xs font-medium mb-1" style={{ color: "var(--ink-soft)" }}>
              Type
            </span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="stockinput">
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium mb-1" style={{ color: "var(--ink-soft)" }}>
              Quantity {type === "ADJUSTMENT" ? "(use a negative number to subtract)" : ""}
            </span>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="stockinput"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium mb-1" style={{ color: "var(--ink-soft)" }}>
              Note (optional)
            </span>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="stockinput" />
          </label>

          <div className="flex gap-2 mt-2">
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
              style={{ background: "var(--amber)" }}
            >
              {submitting ? "Saving…" : "Record"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .stockinput {
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
