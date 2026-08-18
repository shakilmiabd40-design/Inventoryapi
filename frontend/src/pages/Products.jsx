import { useEffect, useState } from "react";
import { api } from "../lib/api";
import StockGauge from "../components/StockGauge";
import SkuTag from "../components/SkuTag";
import ProductModal from "../components/ProductModal";
import StockAdjustModal from "../components/StockAdjustModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", categoryId);
    const [productsRes, categoriesRes] = await Promise.all([
      api.get(`/products?${params.toString()}`),
      api.get("/categories"),
    ]);
    setProducts(productsRes);
    setCategories(categoriesRes);
    setLoading(false);
  }

  useEffect(() => {
    const timeout = setTimeout(load, 200); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId]);

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    await api.del(`/products/${product.id}`);
    load();
  }

  function openNew() {
    setEditingProduct(null);
    setShowModal(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setShowModal(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-extrabold text-2xl">Products</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 rounded text-sm font-medium text-white"
          style={{ background: "var(--ink)" }}
        >
          + New product
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU…"
          className="flex-1 px-3 py-2 rounded border text-sm bg-white"
          style={{ borderColor: "var(--line)" }}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="px-3 py-2 rounded border text-sm bg-white"
          style={{ borderColor: "var(--line)" }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left text-xs uppercase tracking-wide font-mono"
              style={{ color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}
            >
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Public</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--ink-soft)" }}>
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--ink-soft)" }}>
                  No products match. Try adjusting your search or add a new one.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    <SkuTag>{p.sku}</SkuTag>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                    {p.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <StockGauge quantity={p.quantity} reorderLevel={p.reorderLevel} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: p.isPublished ? "var(--green-soft)" : "var(--line)",
                        color: p.isPublished ? "var(--green)" : "var(--ink-soft)",
                      }}
                    >
                      {p.isPublished ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-xs font-medium">
                      <button onClick={() => setAdjustingProduct(p)} style={{ color: "var(--amber)" }}>
                        Adjust
                      </button>
                      <button onClick={() => openEdit(p)} style={{ color: "var(--ink-soft)" }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p)} style={{ color: "var(--red)" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            load();
          }}
        />
      )}

      {adjustingProduct && (
        <StockAdjustModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onSaved={() => {
            setAdjustingProduct(null);
            load();
          }}
        />
      )}
    </div>
  );
}
