"""Ensure the one-pound rollout updates product variants and delivery settings."""
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class OnePoundMigrationTests(unittest.TestCase):
    def test_all_current_product_and_shipping_amounts_become_one(self):
        with tempfile.TemporaryDirectory() as directory:
            db = sqlite3.connect(Path(directory) / "prices.db")
            try:
                migrations = sorted((ROOT / "migrations").glob("*.sql"))
                for migration in migrations:
                    if migration.name == "0013_one_egp_everything.sql":
                        break
                    db.executescript(migration.read_text())

                data = json.dumps({
                    "price": 2500,
                    "compareAt": 3000,
                    "sizes": [{"ml": 30, "price": 1500}, {"ml": 50, "price": 2500}],
                })
                db.execute("INSERT INTO products(id,slug,category_id,data) VALUES(?,?,?,?)", ("test", "test", "woody", data))
                db.execute("INSERT INTO shipping_rates(city,amount,free_threshold) VALUES(?,?,?)", ("Cairo", 60, 2000))
                db.executescript((ROOT / "migrations" / "0013_one_egp_everything.sql").read_text())

                updated = db.execute("SELECT data FROM products WHERE id='test'").fetchone()[0]
                product = json.loads(updated)
                self.assertEqual(product["price"], 1)
                self.assertEqual(product["compareAt"], 1)
                self.assertEqual([size["ml"] for size in product["sizes"]], [30, 50])
                self.assertEqual([size["price"] for size in product["sizes"]], [1, 1])
                self.assertEqual(db.execute("SELECT amount,free_threshold FROM shipping_rates WHERE city='Cairo'").fetchone(), (1, 1))
            finally:
                db.close()

    def test_reset_after_earlier_migration_preserves_stock_orders_and_shipping(self):
        db = sqlite3.connect(":memory:")
        try:
            for migration in sorted((ROOT / "migrations").glob("*.sql")):
                if migration.name == "0014_reset_product_prices_to_one_egp.sql":
                    break
                db.executescript(migration.read_text())

            for product_id, archived in [("active", 0), ("archived", 1)]:
                data = json.dumps({
                    "name": {"en": product_id}, "price": 250,
                    "compareAt": 300, "sizes": [{"ml": 30, "price": 200}, {"ml": 50, "price": 250}],
                })
                db.execute("INSERT INTO products(id,slug,category_id,data,archived) VALUES(?,?,?,?,?)",
                           (product_id, product_id, "woody", data, archived))
            db.execute("UPDATE inventory SET quantity=7 WHERE product_id='active' AND size=30")
            db.execute("INSERT INTO shipping_rates(city,amount,free_threshold) VALUES('Cairo',60,500)")
            db.execute("INSERT INTO orders(id,customer_name,phone,city,address,note,subtotal) VALUES('order1','Name','123','Cairo','Address','',250)")
            db.execute("INSERT INTO order_items(id,order_id,product_id,name,size,unit_price,quantity) VALUES('item1','order1','active','Name',50,250,1)")
            db.executescript((ROOT / "migrations" / "0014_reset_product_prices_to_one_egp.sql").read_text())

            for product_id, data in db.execute("SELECT id,data FROM products"):
                product = json.loads(data)
                self.assertEqual(product["name"]["en"], product_id)
                self.assertEqual((product["price"], product["compareAt"]), (1, 1))
                self.assertEqual(product["sizes"], [{"ml": 30, "price": 1}, {"ml": 50, "price": 1}])
            self.assertEqual(db.execute("SELECT quantity FROM inventory WHERE product_id='active' AND size=30").fetchone(), (7,))
            self.assertEqual(db.execute("SELECT amount,free_threshold FROM shipping_rates WHERE city='Cairo'").fetchone(), (60, 500))
            self.assertEqual(db.execute("SELECT subtotal FROM orders WHERE id='order1'").fetchone(), (250,))
            self.assertEqual(db.execute("SELECT unit_price FROM order_items WHERE id='item1'").fetchone(), (250,))
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
