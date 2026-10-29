"""Exercise inventory triggers using isolated SQLite databases; no Cloudflare account needed."""
import concurrent.futures
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class InventoryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'test.db'
        self.db = sqlite3.connect(self.path)
        for migration in sorted((ROOT / 'migrations').glob('*.sql')):
            self.db.executescript(migration.read_text())
        data = json.dumps({'sizes': [{'ml': 50, 'price': 100}]})
        self.db.execute('INSERT INTO products(id,slug,category_id,data) VALUES(?,?,?,?)', ('p','p','woody',data))
        self.db.execute('UPDATE inventory SET quantity=1 WHERE product_id=?', ('p',))
        self.db.commit()

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    @staticmethod
    def insert_order(db, name, price=100):
        db.execute("INSERT INTO orders(id,customer_name,phone,city,address,note,subtotal,stock_reserved) VALUES (?,?,?,?,?,?,?,1)", (name,'a','1','c','a','',price))
        db.execute('INSERT INTO order_items VALUES (?,?,?,?,?,?,?)', ('item-'+name,name,'p','name',50,price,1))

    def test_concurrent_orders_do_not_oversell(self):
        def place(name):
            conn = sqlite3.connect(self.path, timeout=5)
            try:
                with conn:
                    self.insert_order(conn, name)
                return True
            except sqlite3.IntegrityError:
                return False
            finally:
                conn.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            results=list(pool.map(place, ['one','two']))
        self.assertEqual(sorted(results), [False, True])
        self.assertEqual(self.db.execute('SELECT quantity FROM inventory').fetchone()[0], 0)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM orders').fetchone()[0], 1)

    def test_price_change_rolls_back_order_and_stock(self):
        self.db.execute('UPDATE products SET data=? WHERE id=?', (json.dumps({'sizes':[{'ml':50,'price':200}]}),'p'))
        self.db.commit()
        with self.assertRaises(sqlite3.IntegrityError):
            with self.db:
                self.insert_order(self.db, 'stale')
        self.assertEqual(self.db.execute('SELECT count(*) FROM orders').fetchone()[0],0)
        self.assertEqual(self.db.execute('SELECT quantity FROM inventory').fetchone()[0],1)

    def test_product_upsert_preserves_inventory(self):
        data = json.dumps({'sizes':[{'ml':50,'price':200}]})
        self.db.execute("INSERT INTO products(id,slug,category_id,data) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data", ('p','p','woody',data))
        self.assertEqual(self.db.execute('SELECT quantity FROM inventory WHERE product_id=?', ('p',)).fetchone()[0], 1)

    def test_coupon_and_shipping_rechecked_and_rolled_back(self):
        self.db.execute("INSERT INTO shipping_rates VALUES ('Cairo',30,200)")
        self.db.execute("INSERT INTO coupons(code,percent,max_uses) VALUES ('SAVE',10,1)")
        self.db.commit()
        def order(order_id, shipping, discount, size):
            self.db.execute("INSERT INTO orders(id,customer_name,phone,city,address,note,subtotal,stock_reserved,shipping,discount,coupon_code,tracking_hash) VALUES (?,?,?,?,?,?,?,1,?,?,?,?)",(order_id,'a','1','Cairo','a','',100,shipping,discount,'SAVE','hash-'+order_id))
            self.db.execute('INSERT INTO order_items VALUES (?,?,?,?,?,?,?)', ('item-'+order_id,order_id,'p','name',size,100,1))
        with self.assertRaises(sqlite3.IntegrityError):
            with self.db: order('bad-shipping', 0, 10, 50)
        with self.assertRaises(sqlite3.IntegrityError):
            with self.db: order('bad-stock', 30, 10, 100)
        self.assertEqual(self.db.execute("SELECT uses FROM coupons WHERE code='SAVE'").fetchone()[0],0)
        with self.db: order('good',30,10,50)
        self.assertEqual(self.db.execute("SELECT uses FROM coupons WHERE code='SAVE'").fetchone()[0],1)
        with self.assertRaises(sqlite3.IntegrityError):
            with self.db: order('second',30,10,50)
        self.assertEqual(self.db.execute('SELECT count(*) FROM orders').fetchone()[0],1)

    def test_cancellation_restores_stock_once(self):
        with self.db:
            self.insert_order(self.db,'one')
            self.db.execute("UPDATE orders SET status='cancelled' WHERE id='one'")
            self.db.execute("UPDATE orders SET status='cancelled' WHERE id='one'")
        self.assertEqual(self.db.execute('SELECT quantity FROM inventory').fetchone()[0],1)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE orders SET status='new' WHERE id='one'")

    def test_d1_image_constraints_and_tombstone(self):
        key = '11111111-1111-4111-8111-111111111111'
        self.db.execute("INSERT INTO images(key,content_type,data_base64,size) VALUES(?,?,?,?)", (key, 'image/png', 'iVBORw0KGgoAAAANSUhEUg==', 16))
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO images(key,content_type,data_base64,size) VALUES(?,?,?,?)", ('bad-type', 'image/svg+xml', 'iVBORw0KGgoAAAANSUhEUg==', 16))
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO images(key,content_type,data_base64,size) VALUES(?,?,?,?)", ('too-big', 'image/png', 'A' * 16, 1_000_001))
        self.db.execute("INSERT INTO deleted_images(key) VALUES(?)", (key,))
        self.db.execute("DELETE FROM images WHERE key=?", (key,))
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE products SET data=? WHERE id='p'", (json.dumps({'sizes': [{'ml': 50, 'price': 100}], 'images': ['/api/images/' + key]}),))

if __name__ == '__main__':
    unittest.main()
