const express = require("express");
const db = require("../../db/db");

const router = express.Router();

// This router is intentionally NOT behind requireAuth — it's what your website's
// frontend or backend calls to show live product/stock info to customers.
// It only ever returns published products, and never exposes cost, or internal
// stock-movement history.

function shapePublicProduct(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    category: p.categoryId ? { id: p.categoryId, name: p.categoryName } : null,
    inStock: p.quantity > 0,
    stockStatus: p.quantity === 0 ? "out_of_stock" : p.quantity <= 5 ? "low_stock" : "in_stock",
  };
}

// GET /api/public/products?categoryId=&search=
router.get("/products", (req, res) => {
  const { categoryId, search } = req.query;

  let sql = `
    SELECT p.*, c.name as categoryName
    FROM products p LEFT JOIN categories c ON c.id = p.categoryId
    WHERE p.isPublished = 1
  `;
  const params = [];

  if (categoryId) {
    sql += " AND p.categoryId = ?";
    params.push(categoryId);
  }
  if (search) {
    sql += " AND (p.name LIKE ? OR p.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += " ORDER BY p.updatedAt DESC";

  const products = db.prepare(sql).all(...params).map(shapePublicProduct);
  res.json(products);
});

// GET /api/public/products/:id
router.get("/products/:id", (req, res) => {
  const product = db
    .prepare(
      `SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON c.id = p.categoryId
       WHERE p.id = ? AND p.isPublished = 1`
    )
    .get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(shapePublicProduct(product));
});

// GET /api/public/categories
router.get("/categories", (req, res) => {
  const categories = db
    .prepare(
      `SELECT DISTINCT c.id, c.name FROM categories c
       JOIN products p ON p.categoryId = c.id
       WHERE p.isPublished = 1 ORDER BY c.name ASC`
    )
    .all();
  res.json(categories);
});

module.exports = router;
