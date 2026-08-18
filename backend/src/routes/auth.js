const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me — used by the dashboard to check the current session
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/users — admin-only: add a teammate
router.post("/users", requireAuth, (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Only admins can add teammates" });
  }
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "A user with that email already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const finalRole = role === "ADMIN" ? "ADMIN" : "STAFF";
  const info = db
    .prepare("INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)")
    .run(name, email, passwordHash, finalRole);

  res.status(201).json({ id: info.lastInsertRowid, name, email, role: finalRole });
});

// GET /api/auth/users — admin-only: list teammates
router.get("/users", requireAuth, (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Only admins can view teammates" });
  }
  const users = db.prepare("SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt ASC").all();
  res.json(users);
});

module.exports = router;
