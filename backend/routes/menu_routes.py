from flask import Blueprint, jsonify, request, send_from_directory
from db import get_db
import os, json
from werkzeug.utils import secure_filename

menu_bp = Blueprint("menu", __name__)
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".",1)[1].lower() in ALLOWED_EXTENSIONS

@menu_bp.route("/", methods=["GET"])
def get_menu():
    conn = get_db()
    menu = conn.execute("SELECT * FROM menu").fetchall()
    data = []
    for row in menu:
        item = dict(row)
        if item.get("image"):
            item["image"] = f"http://localhost:5000/menu/image/{item['image']}"
        data.append(item)
    return jsonify(data)


@menu_bp.route("/add", methods=["POST"])
def add_menu():
    name = request.form.get("name")
    price = request.form.get("price")
    category = request.form.get("category")
    file = request.files.get("image")

    if not file or not allowed_file(file.filename):
        return jsonify({"error": "invalid image"}), 400

    filename = secure_filename(file.filename)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    conn = get_db()
    conn.execute(
        "INSERT INTO menu (name, price, category, image) VALUES (?,?,?,?)",
        (name, price, category, filename) 
    )
    conn.commit()
    return jsonify({"message": "Menu added"})


@menu_bp.route("/<int:id>", methods=["PUT"])
def update_menu(id):
    conn = get_db()
    name = request.form.get("name")
    price = request.form.get("price")
    category = request.form.get("category")
    image = request.files.get("image")

    if image:
        filename = secure_filename(image.filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        image.save(filepath)

        conn.execute(
            "UPDATE menu SET name=?, price=?, category=?, image=? WHERE id=?",
            (name, price, category, filename, id)
        )
    else:
        conn.execute(
            "UPDATE menu SET name=?, price=?, category=? WHERE id=?",
            (name, price, category, id)
        )
    conn.commit()
    return jsonify({"message": "Menu updated"})


@menu_bp.route("/<int:id>", methods=["DELETE"])
def delete_menu(id):
    conn = get_db()
    conn.execute("DELETE FROM menu WHERE id=?",(id,))
    conn.commit()
    return jsonify({"message":"Menu deleted"})


@menu_bp.route("/image/<filename>")
def get_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
