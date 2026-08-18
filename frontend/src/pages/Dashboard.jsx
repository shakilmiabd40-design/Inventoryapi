import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import StockGauge from "../components/StockGauge";
import SkuTag from "../components/SkuTag";

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-4">
      <div
        className="text-[0.65rem] font-mono font-medium uppercase tracking-wider mb-2"
        style={{ color: "var(--ink-soft)" }}
      >
        {label}
      </div>
      <div className="font-display font-extrabold text-2xl" style={{ color: accent || "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/stock/summary"),
      api.get("/products?lowStock=true"),
      api.get("/stock/movements"),
    ])
      .then(([summaryRes, lowStockRes, movementsRes]) => {
        setSummary(summaryRes);
        setLowStock(lowStockRes);
        setMovements(movementsRes.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: "var(--ink-soft)" }}>Loading…</div>;
  }

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Products" value={summary.totalProducts} />
        <StatCard label="Units on hand" value={summary.totalUnits} />
        <StatCard
          label="Inventory value"
          value={`$${summary.inventoryValue.toFixed(2)}`}
        />
        <StatCard
          label="Low stock"
          value={summary.lowStock}
          accent={summary.lowStock > 0 ? "var(--red)" : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-sm uppercase tracking-wide">
              Needs reordering
            </h2>
            <Link to="/products" className="text-xs font-medium underline" style={{ color: "var(--ink-soft)" }}>
              View all products
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Nothing below its reorder level right now.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <SkuTag>{p.sku}</SkuTag>
                  </div>
                  <StockGauge quantity={p.quantity} reorderLevel={p.reorderLevel} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">
            Recent activity
          </h2>
          {movements.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              No stock movements logged yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {movements.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium">{m.productName}</span>{" "}
                    <span style={{ color: "var(--ink-soft)" }}>
                      · {m.type.toLowerCase()} by {m.userName || "system"}
                    </span>
                  </div>
                  <span
                    className="font-mono text-xs shrink-0"
                    style={{ color: m.quantity < 0 ? "var(--red)" : "var(--green)" }}
                  >
                    {m.quantity > 0 ? "+" : ""}
                    {m.quantity}
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
