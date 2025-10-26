import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import MenuManagement from "./components/MenuManagement";
import Orders from "./components/Orders";
import Menu from "./components/Menu"; 
import HomePage from "./components/HomePage";
import "./App.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminDashboard />  
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/home" />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="home" element={<HomePage/>} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<Orders />} />
        </Route>
        <Route path="/menu" element={<Menu />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
