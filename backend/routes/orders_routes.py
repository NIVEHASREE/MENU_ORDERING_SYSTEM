from flask import Blueprint, request, jsonify
from db import get_db
import json

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/active", methods=["GET"])
def active_orders():
    conn = get_db()
    orders = conn.execute("SELECT * FROM orders WHERE status='open'").fetchall()
    return jsonify([dict(row) for row in orders])

@orders_bp.route("/close", methods=["POST"])
def close_order():
    table_id = request.json.get("tableId")
    conn = get_db()
    order = conn.execute(
        "SELECT * FROM orders WHERE table_id=? AND status='open'", 
        (table_id,)
    ).fetchone()

    if order:
        items = json.loads(order["items"])
        total_amount = sum(item.get("price", 0) * item.get("quantity", 0) for item in items)

        conn.execute(
            "INSERT INTO bills (table_id, items, total_amount) VALUES (?, ?, ?)",
            (order["table_id"], order["items"], total_amount)
        )

        # Delete the closed order
        conn.execute("DELETE FROM orders WHERE id=?", (order["id"],))
        conn.commit()

        return jsonify({"message": "Bill closed and saved", "total_amount": total_amount})
    else:
        return jsonify({"message": "No open order found"}), 404

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
        for new_item in items:
            found = False
            for old_item in old_items:
                if old_item["name"] == new_item["name"]:
                    old_item["quantity"] += new_item["quantity"]
                    found = True
                    break
            if not found:
                old_items.append(new_item)

        conn.execute(
            "UPDATE orders SET items=? WHERE id=?",
            (json.dumps(old_items), existing_order["id"])
        )
    else:
        conn.execute(
            "INSERT INTO orders (table_id, items, status) VALUES (?,?,?)",
            (table_id, json.dumps(items), "open")
        )

    conn.commit()

    return jsonify({"message": "Order placed/updated successfully"})

@orders_bp.route("/bills", methods=["GET"])
def get_bills():
    conn = get_db()
    bills = conn.execute("SELECT * FROM bills").fetchall()
    return jsonify([dict(row) for row in bills])
