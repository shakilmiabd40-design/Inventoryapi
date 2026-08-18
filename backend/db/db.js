const path = require("path");
const Database = require("better-sqlite3");

// The whole database is a single file on disk. To back it up, just copy this
// file. To reset everything, delete it and restart the server.
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "inventory.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN','STAFF')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0,
    cost REAL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reorderLevel INTEGER NOT NULL DEFAULT 5,
    imageUrl TEXT,
    isPublished INTEGER NOT NULL DEFAULT 1,
    categoryId INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('RESTOCK','SALE','ADJUSTMENT','RETURN')),
    quantity INTEGER NOT NULL,
    note TEXT,
    userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId);
  CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(productId);
`);

module.exports = db;
