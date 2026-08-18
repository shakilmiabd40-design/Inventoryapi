require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

const passwordHash = bcrypt.hashSync("admin123", 10);

const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@example.com");
if (!existingAdmin) {
  db.prepare("INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, 'ADMIN')").run(
    "Admin",
    "admin@example.com",
    passwordHash
  );
  console.log("Created admin user: admin@example.com / admin123");
} else {
  console.log("Admin user already exists, skipping.");
}

function upsertCategory(name) {
  const existing = db.prepare("SELECT id FROM categories WHERE name = ?").get(name);
  if (existing) return existing.id;
  return db.prepare("INSERT INTO categories (name) VALUES (?)").run(name).lastInsertRowid;
}

const apparelId = upsertCategory("Apparel");
const accessoriesId = upsertCategory("Accessories");

function upsertProduct(p) {
  const existing = db.prepare("SELECT id FROM products WHERE sku = ?").get(p.sku);
  if (existing) return;
  db.prepare(
    `INSERT INTO products (sku, name, description, price, cost, quantity, reorderLevel, categoryId)
     VALUES (@sku, @name, @description, @price, @cost, @quantity, @reorderLevel, @categoryId)`
  ).run(p);
}

upsertProduct({
  sku: "TSHIRT-BLK-M",
  name: "Black T-Shirt (M)",
  description: "Classic fit cotton tee.",
  price: 24.99,
  cost: 8.5,
  quantity: 40,
  reorderLevel: 10,
  categoryId: apparelId,
});

upsertProduct({
  sku: "CAP-NAVY",
  name: "Navy Cap",
  description: "Adjustable strap-back cap.",
  price: 19.99,
  cost: 6,
  quantity: 3,
  reorderLevel: 5,
  categoryId: accessoriesId,
});

console.log("Seed complete.");
