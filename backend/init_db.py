import sqlite3

conn = sqlite3.connect("restaurant.db")
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,s
    price REAL NOT NULL,
    available INTEGER DEFAULT 1
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id TEXT NOT NULL,
    items TEXT NOT NULL,
    status TEXT DEFAULT 'open'
)
""")

sample_items = [
    ("Pizza", 250, 1),
    ("Pasta", 180, 1),
    ("Burger", 120, 1),
    ("Sandwich", 90, 1),
    ("Coffee", 60, 1)
]

cur.executemany("INSERT INTO menu (name, price, available) VALUES (?, ?, ?)", sample_items)
conn.commit()
conn.close()
