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


if __name__ == "__main__":
    unittest.main()
