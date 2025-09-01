from flask import Blueprint, request, jsonify
from db import get_db
import json

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/active", methods=["GET"])
def active_orders():
    conn = get_db()
    orders = conn.execute("SELECT * FROM orders WHERE status='open'").fetchall()
    return jsonify([dict(row) for row in orders])

'''@orders_bp.route("/close", methods=["POST"])
def close_order():
    table_id = request.json.get("tableId")
    conn = get_db()
    # move to bills
    order = conn.execute("SELECT * FROM orders WHERE table_id=? AND status='open'",(table_id,)).fetchone()
    if order:
        conn.execute("INSERT INTO bills (table_id, items) VALUES (?,?)",(order["table_id"], order["items"]))
        conn.execute("DELETE FROM orders WHERE id=?",(order["id"],))
        conn.commit()
    return jsonify({"message":"Bill closed and saved"})'''

@orders_bp.route("/", methods=["POST"])
def create_or_update_order():
    data = request.get_json()
    table_id = data.get("tableId")
    items = data.get("items", [])
    conn = get_db()
    existing_order = conn.execute(
        "SELECT * FROM orders WHERE table_id=? AND status='open'",
        (table_id,)
    ).fetchone()

    if existing_order:
        old_items = json.loads(existing_order["items"])
        merged_items = old_items + items 
        conn.execute(
            "UPDATE orders SET items=? WHERE id=?",
            (json.dumps(merged_items), existing_order["id"])
        )
    else:
        conn.execute(
            "INSERT INTO orders (table_id, items, status) VALUES (?,?,?)",
            (table_id, json.dumps(items), "open")
        )

    conn.commit()
    return jsonify({"message": "Order placed/updated successfully"})
