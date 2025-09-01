import React from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-buttons">
        <button onClick={() => navigate("/admin/home")}>🏠 Home</button>
        <button onClick={() => navigate("/admin/menu")}>📋 Menu Management</button>
        <button onClick={() => navigate("/admin/orders")}>🛒 Orders</button>
      </div>
    </div>
  );
}

export default AdminDashboard;
