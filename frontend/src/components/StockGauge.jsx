// Small warehouse-bin-style gauge: a horizontal fill showing quantity relative
// to 2x the reorder level, colored by status. Used everywhere stock appears.
export default function StockGauge({ quantity, reorderLevel }) {
  const ceiling = Math.max(reorderLevel * 2, 1);
  const pct = Math.max(0, Math.min(100, (quantity / ceiling) * 100));

  let color = "var(--green)";
  let label = "In stock";
  if (quantity <= 0) {
    color = "var(--red)";
    label = "Out of stock";
  } else if (quantity <= reorderLevel) {
    color = "var(--amber)";
    label = "Low stock";
  }

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div
        className="relative h-2 flex-1 rounded-full overflow-hidden"
        style={{ background: "var(--line)" }}
        title={`${label} — ${quantity} on hand (reorder at ${reorderLevel})`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums" style={{ color: "var(--ink-soft)" }}>
        {quantity}
      </span>
    </div>
  );
}
