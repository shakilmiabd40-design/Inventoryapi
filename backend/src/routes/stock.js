const express = require("express");
const db = require("../../db/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// POST /api/stock/movements — record a restock, sale, adjustment, or return
// Body: { productId, type: "RESTOCK"|"SALE"|"ADJUSTMENT"|"RETURN", quantity, note }
// Pass `quantity` as a positive number — the sign is applied automatically
// based on `type`, so the API is easy to call from anywhere.
router.post("/movements", (req, res) => {
  const { productId, type, quantity, note } = req.body;

  if (!productId || !type || !quantity) {
    return res.status(400).json({ error: "productId, type, and quantity are required" });
  }

  const validTypes = ["RESTOCK", "SALE", "ADJUSTMENT", "RETURN"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `type must be one of ${validTypes.join(", ")}` });
  }

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const signedQty = type === "SALE" ? -Math.abs(Number(quantity)) : Number(quantity);
  const newQuantity = product.quantity + signedQty;

  if (newQuantity < 0) {
    return res.status(400).json({ error: "This would take stock below zero" });
  }

  const runTransaction = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO stock_movements (productId, type, quantity, note, userId) VALUES (?, ?, ?, ?, ?)`
      )
      .run(productId, type, signedQty, note || null, req.user.id);
    db.prepare("UPDATE products SET quantity = ?, updatedAt = datetime('now') WHERE id = ?").run(
      newQuantity,
      productId
    );
    return info.lastInsertRowid;
  });

  const movementId = runTransaction();
  const movement = db.prepare("SELECT * FROM stock_movements WHERE id = ?").get(movementId);
  const updatedProduct = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);

  res.status(201).json({ movement, product: updatedProduct });
});

// GET /api/stock/movements?productId=
router.get("/movements", (req, res) => {
  const { productId } = req.query;

  let sql = `
    SELECT m.*, p.name as productName, p.sku as productSku, u.name as userName
    FROM stock_movements m
    JOIN products p ON p.id = m.productId
    LEFT JOIN users u ON u.id = m.userId
  `;
  const params = [];
  if (productId) {
    sql += " WHERE m.productId = ?";
    params.push(productId);
  }
  sql += " ORDER BY m.createdAt DESC LIMIT 200";

  const movements = db.prepare(sql).all(...params);
  res.json(movements);
});

// GET /api/stock/summary — quick counts for the dashboard
router.get("/summary", (req, res) => {
  const products = db.prepare("SELECT quantity, reorderLevel, price, cost FROM products").all();
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const inventoryValue = products.reduce((sum, p) => sum + p.quantity * (p.cost ?? p.price), 0);
  const lowStock = products.filter((p) => p.quantity <= p.reorderLevel).length;

  res.json({ totalProducts, totalUnits, inventoryValue, lowStock });
});

module.exports = router;
