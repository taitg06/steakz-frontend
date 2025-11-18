import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';
import './MenuPage.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

interface NewMenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
}

const MenuManagement: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchWithAuth } = useAdminFetch();
  const currentUserRole = localStorage.getItem('role');

  // Form states
  const [newItem, setNewItem] = useState<NewMenuItem>({
    name: '',
    description: '',
    price: '',
    category: 'Main Course'
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const data = await fetchWithAuth('/menu');
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemData = {
        ...newItem,
        price: parseFloat(newItem.price),
      };

      const response = await fetchWithAuth('/menu', {
        method: 'POST',
        body: JSON.stringify(itemData)
      });

      setItems(prevItems => [...prevItems, response]);
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'Main Course'
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchWithAuth(`/menu/${id}`, {
        method: 'DELETE'
      });
      setItems(prevItems => prevItems.filter((item: MenuItem) => item.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <AdminPage title="Menu Management">
        <div className="admin-loading">Loading menu items...</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Menu Management">
      {error && <div className="admin-error">{error}</div>}
      
      {(currentUserRole === 'BRANCH_MANAGER' || currentUserRole === 'CHEF' || currentUserRole === 'CASHIER') && (
        <div className="admin-info" style={{ backgroundColor: '#2c3e50', color: '#ffd700', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
          ℹ️ You can view the menu items available at your branch. Contact management to modify the menu.
        </div>
      )}

      <div className="menu-grid">
        {/* Existing Menu Items */}
        <div className="menu-list">
          <h2>Current Menu Items</h2>
          <div className="menu-items">
            {items.map((item) => (
              <div key={item.id} className="menu-item-card">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="menu-item-footer">
                  <span className="price">${item.price.toFixed(2)}</span>
                  <span className="category">{item.category}</span>
                  {(currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER') && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="admin-btn admin-btn-danger"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Item Form - Only for ADMIN and HQ_MANAGER */}
        {(currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER') && (
          <div className="add-menu-form">
            <h2>Add New Menu Item</h2>
            <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Item Name</label>
              <input
                type="text"
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
                className="form-input"
                placeholder="Enter item name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                required
                className="form-input"
                placeholder="Enter item description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                required
                step="0.01"
                min="0"
                className="form-input"
                placeholder="Enter price"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                required
                className="form-input"
              >
                <option value="Main Course">Main Course</option>
                <option value="Appetizer">Appetizer</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
                <option value="Special">Special</option>
              </select>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary">
              Add Item
            </button>
          </form>
        </div>
        )}
      </div>
    </AdminPage>
  );
};

export default MenuManagement;