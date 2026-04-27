"""SQLite database layer with WAL mode and async access."""
import os
import uuid
import aiosqlite

from config import DB_PATH, DATA_DIR, UPLOADS_DIR

SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📂',
  image_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  sale_price INTEGER CHECK (sale_price IS NULL OR sale_price >= 0),
  description TEXT DEFAULT '',
  sizes TEXT DEFAULT '[]',
  colors TEXT DEFAULT '[]',
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  featured INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT DEFAULT '',
  url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  ref TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_wilaya TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery_fee INTEGER DEFAULT 0 CHECK (delivery_fee >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'delivering', 'delivered', 'cancelled')),
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT DEFAULT '',
  color TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount INTEGER DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  code TEXT DEFAULT '',
  expires_at TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  login_attempts INTEGER DEFAULT 0,
  locked_until TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = 1;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = 1;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(active) WHERE active = 1;
"""


def new_id() -> str:
    return str(uuid.uuid4())


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    db = await aiosqlite.connect(DB_PATH)
    for statement in SCHEMA.split(";"):
        stmt = statement.strip()
        if stmt:
            await db.execute(stmt)
    await db.commit()
    await db.close()
