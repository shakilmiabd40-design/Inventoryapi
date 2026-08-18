const express = require("express");
const db = require("../../db/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function attachCategory(product) {
  if (!product) return product;
  if (product.categoryId) {
    product.category = db.prepare("SELECT id, name FROM categories WHERE id = ?").get(product.categoryId);
  } else {
    product.category = null;
  }
  product.isPublished = Boolean(product.isPublished);
  return product;
}

// GET /api/products?search=&categoryId=&lowStock=true
router.get("/", (req, res) => {
  const { search, categoryId, lowStock } = req.query;

  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (search) {
    sql += " AND (name LIKE ? OR sku LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categoryId) {
    sql += " AND categoryId = ?";
    params.push(categoryId);
  }
  sql += " ORDER BY updatedAt DESC";

  let products = db.prepare(sql).all(...params).map(attachCategory);

  if (lowStock === "true") {
    products = products.filter((p) => p.quantity <= p.reorderLevel);
  }

  res.json(products);
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  attachCategory(product);
  product.movements = db
    .prepare("SELECT * FROM stock_movements WHERE productId = ? ORDER BY createdAt DESC LIMIT 20")
    .all(req.params.id);
  res.json(product);
});

// POST /api/products
router.post("/", (req, res) => {
  const {
    sku, name, description, price, cost,
    quantity, reorderLevel, imageUrl, categoryId, isPublished,
  } = req.body;

  if (!sku || !name) {
    return res.status(400).json({ error: "SKU and name are required" });
  }

  const existing = db.prepare("SELECT id FROM products WHERE sku = ?").get(sku);
  if (existing) {
    return res.status(409).json({ error: "A product with that SKU already exists" });
  }

  const finalQuantity = Number(quantity) || 0;

  const info = db
    .prepare(
      `INSERT INTO products (sku, name, description, price, cost, quantity, reorderLevel, imageUrl, isPublished, categoryId)
       VALUES (@sku, @name, @description, @price, @cost, @quantity, @reorderLevel, @imageUrl, @isPublished, @categoryId)`
    )
    .run({
      sku,
      name,
      description: description || null,
      price: Number(price) || 0,
      cost: cost !== undefined && cost !== "" ? Number(cost) : null,
      quantity: finalQuantity,
      reorderLevel: Number(reorderLevel) || 5,
      imageUrl: imageUrl || null,
      isPublished: isPublished === undefined ? 1 : isPublished ? 1 : 0,
      categoryId: categoryId ? Number(categoryId) : null,
    });

  if (finalQuantity > 0) {
    db.prepare(
      `INSERT INTO stock_movements (productId, type, quantity, note, userId) VALUES (?, 'RESTOCK', ?, ?, ?)`
    ).run(info.lastInsertRowid, finalQuantity, "Initial stock on product creation", req.user.id);
  }

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(attachCategory(product));
});

// PUT /api/products/:id (details only — use /api/stock/movements for quantity changes)
router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found" });

  const {
    sku = existing.sku,
    name = existing.name,
    description = existing.description,
    price = existing.price,
    cost = existing.cost,
    reorderLevel = existing.reorderLevel,
    imageUrl = existing.imageUrl,
    categoryId = existing.categoryId,
    isPublished = existing.isPublished,
  } = req.body;

  if (sku !== existing.sku) {
    const dupe = db.prepare("SELECT id FROM products WHERE sku = ? AND id != ?").get(sku, req.params.id);
    if (dupe) return res.status(409).json({ error: "A product with that SKU already exists" });
  }

  db.prepare(
    `UPDATE products SET sku=?, name=?, description=?, price=?, cost=?, reorderLevel=?, imageUrl=?, categoryId=?, isPublished=?, updatedAt=datetime('now')
     WHERE id=?`
  ).run(
    sku, name, description, Number(price), cost === "" || cost === null ? null : Number(cost),
    Number(reorderLevel), imageUrl, categoryId ? Number(categoryId) : null, isPublished ? 1 : 0,
    req.params.id
  );

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json(attachCategory(product));
});

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM stock_movements WHERE productId = ?").run(req.params.id);
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
