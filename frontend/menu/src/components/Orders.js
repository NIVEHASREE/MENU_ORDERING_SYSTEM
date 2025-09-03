import React, { useEffect, useState } from "react";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [servedItems, setServedItems] = useState({}); 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5000/orders/active");
    const data = await res.json();
    setOrders(data);
  };

  const closeBill = async (order) => {
    alert(`Generating bill for table ${order.table_id}...`);

    await fetch("http://localhost:5000/orders/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: order.table_id }),
    });

    fetchOrders();
  };

  const toggleServed = (orderId, itemName) => {
    setServedItems((prev) => {
      const orderServed = prev[orderId] || {};
      return {
        ...prev,
        [orderId]: {
          ...orderServed,
          [itemName]: !orderServed[itemName], 
        },
      };
    });
  };

  return (
    <div className="orders">
      <h2>Active Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Table</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
  const items = Array.isArray(o.items)
    ? o.items
    : JSON.parse(o.items || "[]");

  const mergedItems = items.reduce((acc, item) => {
    const existing = acc.find((i) => i.name === item.name);
    if (existing) {
      existing.quantity += item.quantity; 
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  return (
    <tr key={o.id}>
      <td>{o.table_id}</td>
      <td>
        <ul>
          {mergedItems.map((item, idx) => {
            const isServed = servedItems[o.id]?.[item.name] || false;
            return (
              <li
                key={idx}
                style={{
                  textDecoration: isServed ? "line-through" : "none",
                  color: isServed ? "green" : "black",
                }}
              >
                {item.name} - {item.quantity}{" "}
                <button onClick={() => toggleServed(o.id, item.name)}>
                  {isServed ? "Undo" : "Mark Served"}
                </button>
              </li>
            );
          })}
        </ul>
      </td>
      <td>
        <button onClick={() => closeBill(o)}>Close Bill</button>
      </td>
    </tr>
      );
    })}

        </tbody>
      </table>
    </div>
  );
}

export default Orders;
