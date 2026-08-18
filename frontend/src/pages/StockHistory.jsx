import { useEffect, useState } from "react";
import { api } from "../lib/api";
import SkuTag from "../components/SkuTag";

const typeColors = {
  RESTOCK: "var(--green)",
  RETURN: "var(--green)",
  SALE: "var(--red)",
  ADJUSTMENT: "var(--amber)",
};

export default function StockHistory() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stock/movements")
      .then(setMovements)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-6">Stock history</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left text-xs uppercase tracking-wide font-mono"
              style={{ color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}
            >
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Change</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium">By</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--ink-soft)" }}>
                  Loading…
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--ink-soft)" }}>
                  No stock movements recorded yet.
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.productName}</div>
                    <SkuTag>{m.productSku}</SkuTag>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono font-medium"
                      style={{ color: typeColors[m.type] }}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono" style={{ color: typeColors[m.type] }}>
                    {m.quantity > 0 ? "+" : ""}
                    {m.quantity}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                    {m.note || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                    {m.userName || "system"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--ink-soft)" }}>
                    {new Date(m.createdAt + "Z").toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
