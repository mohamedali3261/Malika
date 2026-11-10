"""Verify one-time data migrations preserve owner-defined product colours."""
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class PrimaryGoldMigrationTests(unittest.TestCase):
    def test_updates_only_the_previous_builtin_accent(self):
        with tempfile.TemporaryDirectory() as directory:
            db = sqlite3.connect(Path(directory) / "migration.db")
            try:
                migrations = sorted((ROOT / "migrations").glob("*.sql"))
                for migration in migrations:
                    if migration.name == "0012_primary_gold.sql":
                        break
                    db.executescript(migration.read_text())

                products = [
                    ("default", "default", "woody", json.dumps({"accent": "#B89A62"})),
                    ("custom", "custom", "woody", json.dumps({"accent": "#C9B5F7"})),
                ]
                db.executemany("INSERT INTO products(id,slug,category_id,data) VALUES(?,?,?,?)", products)
                db.executescript((ROOT / "migrations" / "0012_primary_gold.sql").read_text())

                result = dict(db.execute("SELECT id,json_extract(data,'$.accent') FROM products"))
                self.assertEqual(result["default"], "#D4A035")
                self.assertEqual(result["custom"], "#C9B5F7")
            finally:
                db.close()


if __name__ == "__main__":
    unittest.main()
