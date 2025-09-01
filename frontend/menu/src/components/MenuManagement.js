import React, { useEffect, useState } from "react";
import "./Menu.css";

function MenuManagement() {
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", image: null });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", price: "", category: "", image: null });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  const handleAdd = async () => {
    if (!newItem.name || !newItem.price || !newItem.category || !newItem.image) {
      alert("Fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("price", newItem.price);
    formData.append("category", newItem.category);
    formData.append("image", newItem.image);

    try {
      await fetch("http://localhost:5000/menu/add", {
        method: "POST",
        body: formData,
      });
      setNewItem({ name: "", price: "", category: "", image: null });
      fetchMenu();
    } catch (err) {
      console.error("Error adding menu item:", err);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("price", editData.price);
      formData.append("category", editData.category);
      if (editData.image) {
        formData.append("image", editData.image);
      }

      await fetch(`http://localhost:5000/menu/${id}`, {
        method: "PUT",
        body: formData,
      });

      setEditingId(null);
      fetchMenu();
    } catch (err) {
      console.error("Error updating menu item:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/menu/${id}`, { method: "DELETE" });
      setConfirmDeleteId(null);
      fetchMenu();
    } catch (err) {
      console.error("Error deleting menu item:", err);
    }
  };

  return (
    <div className="menu-management">
      <h2>Menu Management</h2>

      <div className="add-menu-item">
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
        />
        <button onClick={handleAdd}>Add Menu Item</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menu.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>

              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                ) : (
                  item.name
                )}
              </td>

              <td>
                {editingId === item.id ? (
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                  />
                ) : (
                  `₹${item.price}`
                )}
              </td>

              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  />
                ) : (
                  item.category
                )}
              </td>

              <td>
                {editingId === item.id ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditData({ ...editData, image: e.target.files[0] })}
                    />
                    {item.image && !editData.image && (
                      <img
                        src={`http://localhost:5000/menu/image/${item.image.split("/").pop()}`}
                        alt={item.name}
                        width="50"
                      />
                    )}
                  </>
                ) : item.image ? (
                  <img
                    src={`http://localhost:5000/menu/image/${item.image.split("/").pop()}`}
                    alt={item.name}
                    width="50"
                  />
                ) : (
                  <span>No Image</span>
                )}
              </td>

              <td style={{ position: "relative" }}>
                {editingId === item.id ? (
                  <>
                    <button className="btn-save" onClick={() => handleUpdate(item.id)}>
                      Save
                    </button>
                    <button className="btn-cancel" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditData({
                          name: item.name,
                          price: item.price,
                          category: item.category,
                          image: null, 
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => setConfirmDeleteId(item.id)}>
                      Remove
                    </button>
                  </>
                )}

                {confirmDeleteId === item.id && (
                  <div className="delete-confirm-box">
                    <p>Are you sure you want to delete "{item.name}"?</p>
                    <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                      Yes
                    </button>
                    <button className="btn-cancel" onClick={() => setConfirmDeleteId(null)}>
                      No
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MenuManagement;
