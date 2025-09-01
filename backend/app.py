import sqlite3
from flask import Flask
from flask_cors import CORS
from routes.menu_routes import menu_bp
from routes.orders_routes import orders_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(menu_bp,url_prefix = "/menu")
app.register_blueprint(orders_bp,url_prefix = "/orders")

if __name__ == "__main__":
    app.run(port=5000, debug=True)
