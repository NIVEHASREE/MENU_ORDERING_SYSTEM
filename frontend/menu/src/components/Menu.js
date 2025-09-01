import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const tableId = params.get("tableId") || "Guest";

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch("http://localhost:5000/menu/");
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error("Error fetching menu:", err);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, qty) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: qty } : i))
        .filter((i) => i.quantity > 0) 
    );
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, items: cart }),
      });
      if (!res.ok) throw new Error("Failed to place order");

      alert(" Order placed successfully!");
      setCart([]);
    } catch (err) {
      console.error(err);
      alert(" Failed to place order!");
    }
  };

  const calculateTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  return (
    <div className="content">
      <h2 className="section-title">🍽️ Menu - Table {tableId}</h2>

      <div className="menu-grid">
        {menu.map((item) => {
          const inCart = cart.find((i) => i.id === item.id);
          const quantity = inCart ? inCart.quantity : 0;

          return (
            <div key={item.id} className="card menu-card">
              {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="menu-image"
              />
            )}


              <div className="menu-info">
                <h3 className="menu-name">{item.name}</h3>
                <span className="menu-price">
                  ₹{Number(item.price).toFixed(2)}
                </span>
              </div>

              <div
                className="menu-footer"
                style={{ justifyContent: "center", gap: "10px" }}
              >
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  disabled={quantity === 0}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="cart-fixed">
          <div className="cart-header">
            <h3>🛒 Your Order</h3>
          </div>
          <div className="cart-total">Total: ₹{calculateTotal()}</div>
          <button
            onClick={placeOrder}
            disabled={cart.length === 0}
            className="place-order-button"
          >
            🍽️ Place Order
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
