"""Exercise the analytics daily aggregate schema and its view/click semantics."""
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class AnalyticsMigrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = sqlite3.connect(Path(self.tmp.name) / "analytics.db")
        for migration in sorted((ROOT / "migrations").glob("*.sql")):
            self.db.executescript(migration.read_text())

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def test_daily_upsert_counts_views_and_distinct_visitors(self):
        upsert = """INSERT INTO analytics_daily
            (day, event_type, page_path, target_id, visitor_hash, event_count)
            VALUES (?, ?, ?, ?, ?, 1)
            ON CONFLICT(day, event_type, page_path, target_id, visitor_hash)
            DO UPDATE SET event_count = analytics_daily.event_count + 1"""
        events = [
            ("2026-11-08", "page_view", "/", "", "hash-a"),
            ("2026-11-08", "page_view", "/", "", "hash-a"),
            ("2026-11-07", "page_view", "/", "", "hash-a"),
            ("2026-11-08", "page_view", "/", "", "hash-b"),
            ("2026-11-08", "page_view", "/shop", "", "hash-a"),
            ("2026-11-08", "product_click", "/", "vlor-noir", "hash-a"),
            ("2026-11-08", "product_click", "/", "vlor-noir", "hash-a"),
            ("2026-11-08", "product_click", "/shop", "vlor-noir", "hash-b"),
        ]
        self.db.executemany(upsert, events)

        home = self.db.execute(
            """SELECT SUM(event_count), COUNT(DISTINCT visitor_hash)
               FROM analytics_daily
               WHERE event_type='page_view' AND page_path='/' AND day BETWEEN ? AND ?""",
            ("2026-11-07", "2026-11-08"),
        ).fetchone()
        self.assertEqual(home, (4, 2))

        clicks = self.db.execute(
            """SELECT SUM(event_count), COUNT(DISTINCT visitor_hash)
               FROM analytics_daily
               WHERE event_type='product_click' AND target_id='vlor-noir'"""
        ).fetchone()
        self.assertEqual(clicks, (3, 2))

    def test_analytics_event_constraints_reject_invalid_rows(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO analytics_daily(day,event_type,page_path,target_id,visitor_hash) VALUES(?,?,?,?,?)",
                ("2026-11-08", "page_view", "/", "unexpected", "hash-a"),
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO analytics_daily(day,event_type,page_path,target_id,visitor_hash) VALUES(?,?,?,?,?)",
                ("2026-11-08", "product_click", "/", "", "hash-a"),
            )


if __name__ == "__main__":
    unittest.main()
