const express = require("express");
const db = require("../../db/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/categories
router.get("/", (req, res) => {
  const categories = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.categoryId = c.id) as productCount
       FROM categories c ORDER BY c.name ASC`
    )
    .all();
  res.json(categories);
});

// POST /api/categories
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  try {
    const info = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
    res.status(201).json({ id: info.lastInsertRowid, name });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE" || err.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({ error: "A category with that name already exists" });
    }
    throw err;
  }
});

// PUT /api/categories/:id
router.put("/:id", (req, res) => {
  const { name } = req.body;
  db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, req.params.id);
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });
  res.json(category);
});

// DELETE /api/categories/:id
router.delete("/:id", (req, res) => {
  db.prepare("UPDATE products SET categoryId = NULL WHERE categoryId = ?").run(req.params.id);
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
