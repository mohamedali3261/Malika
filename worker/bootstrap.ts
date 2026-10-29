import { INITIAL_ADMIN, SEED_IMAGES, SEED_PRODUCTS, SEED_SHIPPING_RATES } from './seedData';

const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS store_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name_en TEXT NOT NULL, name_ar TEXT NOT NULL)`,
  `INSERT OR IGNORE INTO categories VALUES ('fresh','Fresh','منعش'),('floral','Floral','زهري'),('woody','Woody','خشبي'),('oriental','Oriental','شرقي')`,
  `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, category_id TEXT NOT NULL REFERENCES categories(id), data TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'owner' CHECK(role IN ('owner','orders')), must_change_password INTEGER NOT NULL DEFAULT 0 CHECK(must_change_password IN (0, 1)))`,
  `CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, last_seen INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, customer_name TEXT NOT NULL, phone TEXT NOT NULL, city TEXT NOT NULL, address TEXT NOT NULL, note TEXT NOT NULL, subtotal INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, idempotency_key TEXT, request_hash TEXT, stock_reserved INTEGER NOT NULL DEFAULT 0 CHECK(stock_reserved IN (0, 1)), shipping INTEGER NOT NULL DEFAULT 0, discount INTEGER NOT NULL DEFAULT 0, coupon_code TEXT, tracking_hash TEXT)`,
  `CREATE TABLE IF NOT EXISTS order_items (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), product_id TEXT NOT NULL REFERENCES products(id), name TEXT NOT NULL, size INTEGER NOT NULL, unit_price INTEGER NOT NULL, quantity INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS order_items_order ON order_items(order_id)`,
  `CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at DESC)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS order_tracking_hash ON orders(tracking_hash) WHERE tracking_hash IS NOT NULL`,
  `CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, admin_id TEXT NOT NULL, action TEXT NOT NULL, target_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS audit_log_created ON audit_log(created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS inventory (product_id TEXT NOT NULL REFERENCES products(id), size INTEGER NOT NULL CHECK(size > 0), quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0), PRIMARY KEY (product_id, size))`,
  `CREATE TABLE IF NOT EXISTS shipping_rates (city TEXT PRIMARY KEY, amount INTEGER NOT NULL CHECK(amount >= 0), free_threshold INTEGER CHECK(free_threshold IS NULL OR free_threshold >= 0))`,
  `CREATE TABLE IF NOT EXISTS coupons (code TEXT PRIMARY KEY, percent INTEGER NOT NULL CHECK(percent BETWEEN 1 AND 100), max_uses INTEGER NOT NULL CHECK(max_uses > 0), uses INTEGER NOT NULL DEFAULT 0 CHECK(uses >= 0), expires_at TEXT, enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)))`,
  `CREATE TABLE IF NOT EXISTS deleted_images (key TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS images (key TEXT PRIMARY KEY, content_type TEXT NOT NULL CHECK(content_type IN ('image/jpeg', 'image/png', 'image/webp')), data_base64 TEXT NOT NULL CHECK(length(data_base64) BETWEEN 16 AND 1333336), size INTEGER NOT NULL CHECK(size BETWEEN 12 AND 1000000), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
];

const ALTER_COLUMNS = [
  `ALTER TABLE sessions ADD COLUMN last_seen INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE orders ADD COLUMN idempotency_key TEXT`,
  `ALTER TABLE orders ADD COLUMN request_hash TEXT`,
  `ALTER TABLE orders ADD COLUMN stock_reserved INTEGER NOT NULL DEFAULT 0 CHECK(stock_reserved IN (0, 1))`,
  `ALTER TABLE orders ADD COLUMN shipping INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE orders ADD COLUMN discount INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE orders ADD COLUMN coupon_code TEXT`,
  `ALTER TABLE orders ADD COLUMN tracking_hash TEXT`,
  `ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'owner' CHECK(role IN ('owner','orders'))`,
  `ALTER TABLE admins ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0 CHECK(must_change_password IN (0, 1))`,
];

const TRIGGER_STATEMENTS = [
  `DROP TRIGGER IF EXISTS product_inventory_insert`,
  `DROP TRIGGER IF EXISTS product_inventory_update`,
  `CREATE TRIGGER product_inventory_insert AFTER INSERT ON products BEGIN
    INSERT INTO inventory(product_id, size)
    SELECT NEW.id, CAST(json_extract(value, '$.ml') AS INTEGER) FROM json_each(NEW.data, '$.sizes') WHERE 1
    ON CONFLICT(product_id, size) DO NOTHING;
  END`,
  `CREATE TRIGGER product_inventory_update AFTER UPDATE OF data ON products BEGIN
    INSERT INTO inventory(product_id, size)
    SELECT NEW.id, CAST(json_extract(value, '$.ml') AS INTEGER) FROM json_each(NEW.data, '$.sizes') WHERE 1
    ON CONFLICT(product_id, size) DO NOTHING;
  END`,
  `CREATE TRIGGER IF NOT EXISTS validate_and_reserve_order_item BEFORE INSERT ON order_items
  WHEN (SELECT stock_reserved FROM orders WHERE id=NEW.order_id) = 1
  BEGIN
    SELECT CASE WHEN NEW.quantity < 1 OR NOT EXISTS (
      SELECT 1 FROM products p, json_each(p.data, '$.sizes') s
      WHERE p.id=NEW.product_id AND p.archived=0
        AND json_extract(s.value, '$.ml')=NEW.size
        AND json_extract(s.value, '$.price')=NEW.unit_price
    ) THEN RAISE(ABORT, 'product_changed') END;
    SELECT CASE WHEN NOT EXISTS (
      SELECT 1 FROM inventory WHERE product_id=NEW.product_id AND size=NEW.size AND quantity>=NEW.quantity
    ) THEN RAISE(ABORT, 'insufficient_stock') END;
    UPDATE inventory SET quantity=quantity-NEW.quantity WHERE product_id=NEW.product_id AND size=NEW.size;
  END`,
  `CREATE TRIGGER IF NOT EXISTS cancelled_orders_are_final BEFORE UPDATE OF status ON orders
  WHEN OLD.status='cancelled' AND NEW.status != 'cancelled'
  BEGIN SELECT RAISE(ABORT, 'cancelled_order_is_final'); END`,
  `CREATE TRIGGER IF NOT EXISTS restore_cancelled_order_stock AFTER UPDATE OF status ON orders
  WHEN OLD.status != 'cancelled' AND NEW.status='cancelled' AND OLD.stock_reserved=1
  BEGIN
    UPDATE inventory SET quantity=quantity + COALESCE((
      SELECT SUM(quantity) FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND size=inventory.size
    ),0)
    WHERE EXISTS (SELECT 1 FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND size=inventory.size);
  END`,
  `CREATE TRIGGER IF NOT EXISTS validate_checkout BEFORE INSERT ON orders WHEN NEW.tracking_hash IS NOT NULL BEGIN
    SELECT CASE WHEN NEW.subtotal < 0 OR NEW.discount < 0 OR NEW.shipping < 0 THEN RAISE(ABORT, 'invalid_checkout') END;
    SELECT CASE WHEN NEW.coupon_code IS NULL AND NEW.discount != 0 THEN RAISE(ABORT, 'coupon_changed') END;
    SELECT CASE WHEN NEW.coupon_code IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM coupons c WHERE c.code=NEW.coupon_code AND c.enabled=1 AND c.uses<c.max_uses
        AND (c.expires_at IS NULL OR datetime(c.expires_at)>datetime('now'))
        AND NEW.discount=CAST(NEW.subtotal*c.percent/100 AS INTEGER)
    ) THEN RAISE(ABORT, 'coupon_changed') END;
    SELECT CASE WHEN NOT EXISTS (
      SELECT 1 FROM shipping_rates r WHERE r.city=NEW.city AND NEW.shipping = CASE WHEN r.free_threshold IS NOT NULL AND NEW.subtotal-NEW.discount>=r.free_threshold THEN 0 ELSE r.amount END
    ) THEN RAISE(ABORT, 'shipping_changed') END;
  END`,
  `CREATE TRIGGER IF NOT EXISTS consume_coupon AFTER INSERT ON orders WHEN NEW.tracking_hash IS NOT NULL AND NEW.coupon_code IS NOT NULL BEGIN
    UPDATE coupons SET uses=uses+1 WHERE code=NEW.coupon_code;
  END`,
  `CREATE TRIGGER IF NOT EXISTS prevent_deleted_images_insert BEFORE INSERT ON products BEGIN
    SELECT CASE WHEN EXISTS (SELECT 1 FROM deleted_images d, json_each(NEW.data, '$.images') j WHERE instr(j.value, '/api/images/' || d.key)>0) OR EXISTS (SELECT 1 FROM deleted_images d WHERE instr(COALESCE(json_extract(NEW.data,'$.cutout'),''),'/api/images/' || d.key)>0) THEN RAISE(ABORT, 'deleted_image') END;
  END`,
  `CREATE TRIGGER IF NOT EXISTS prevent_deleted_images_update BEFORE UPDATE OF data ON products BEGIN
    SELECT CASE WHEN EXISTS (SELECT 1 FROM deleted_images d, json_each(NEW.data, '$.images') j WHERE instr(j.value, '/api/images/' || d.key)>0) OR EXISTS (SELECT 1 FROM deleted_images d WHERE instr(COALESCE(json_extract(NEW.data,'$.cutout'),''),'/api/images/' || d.key)>0) THEN RAISE(ABORT, 'deleted_image') END;
  END`,
];

let readyDb: D1Database | null = null;
let pendingInit: Promise<void> | null = null;

async function initialize(db: D1Database): Promise<void> {
  try {
    const meta = await db.prepare("SELECT value FROM store_meta WHERE key='seed_v1'").first<{ value: string }>();
    if (meta?.value === '1') {
      readyDb = db;
      return;
    }
  } catch {
    // Base tables or store_meta do not exist yet.
  }

  for (const sql of DDL_STATEMENTS) {
    await db.prepare(sql).run();
  }
  for (const sql of ALTER_COLUMNS) {
    try {
      await db.prepare(sql).run();
    } catch {
      // Column already exists on migrated databases.
    }
  }
  for (const sql of TRIGGER_STATEMENTS) {
    await db.prepare(sql).run();
  }

  // Seed initial bootstrap owner ('admin') only if no admin accounts exist yet.
  const adminCount = (await db.prepare('SELECT COUNT(*) AS n FROM admins').first<{ n: number }>())?.n ?? 0;
  if (adminCount === 0) {
    await db
      .prepare('INSERT OR IGNORE INTO admins(id, username, salt, password_hash, role, must_change_password) VALUES (?, ?, ?, ?, ?, 1)')
      .bind(INITIAL_ADMIN.id, INITIAL_ADMIN.username, INITIAL_ADMIN.salt, INITIAL_ADMIN.passwordHash, 'owner')
      .run();
  }

  // Seed bottle images + 12 perfume products + initial stock only if catalogue is empty.
  const productCount = (await db.prepare('SELECT COUNT(*) AS n FROM products').first<{ n: number }>())?.n ?? 0;
  if (productCount === 0) {
    for (const img of SEED_IMAGES) {
      await db
        .prepare('INSERT OR IGNORE INTO images(key, content_type, data_base64, size) VALUES (?, ?, ?, ?)')
        .bind(img.key, img.contentType, img.base64, img.size)
        .run();
    }
    const productBatch: D1PreparedStatement[] = [];
    SEED_PRODUCTS.forEach((p, idx) => {
      const ts = `2026-10-29 12:${String(59 - idx).padStart(2, '0')}:00`;
      productBatch.push(
        db
          .prepare('INSERT OR IGNORE INTO products(id, slug, category_id, data, archived, updated_at) VALUES (?, ?, ?, ?, 0, ?)')
          .bind(p.id, p.slug, p.category, JSON.stringify(p), ts)
      );
      for (const s of p.sizes) {
        productBatch.push(
          db
            .prepare('INSERT INTO inventory(product_id, size, quantity) VALUES (?, ?, 25) ON CONFLICT(product_id, size) DO UPDATE SET quantity = CASE WHEN inventory.quantity = 0 THEN 25 ELSE inventory.quantity END')
            .bind(p.id, s.ml)
        );
      }
    });
    await db.batch(productBatch);
  }

  // Seed shipping rates for all 27 Egyptian governorates if none are configured yet.
  const shippingCount = (await db.prepare('SELECT COUNT(*) AS n FROM shipping_rates').first<{ n: number }>())?.n ?? 0;
  if (shippingCount === 0) {
    await db.batch(
      SEED_SHIPPING_RATES.map(([city, amount, threshold]) =>
        db.prepare('INSERT OR IGNORE INTO shipping_rates(city, amount, free_threshold) VALUES (?, ?, ?)').bind(city, amount, threshold)
      )
    );
  }

  await db.prepare("INSERT OR REPLACE INTO store_meta(key, value) VALUES ('seed_v1', '1')").run();
  readyDb = db;
}

export async function ensureStoreReady(db: D1Database): Promise<void> {
  if (readyDb === db) return;
  if (!pendingInit) {
    pendingInit = initialize(db).finally(() => {
      pendingInit = null;
    });
  }
  await pendingInit;
}
