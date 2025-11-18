import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  description: string;
}

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    price: 0,
    description: ''
  });
  const { fetchWithAuth } = useAdminFetch();
  const currentUserRole = localStorage.getItem('role');
  const isCashier = currentUserRole === 'CASHIER';
  const isChef = currentUserRole === 'CHEF';

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await fetchWithAuth('/inventory');
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await fetchWithAuth(`/inventory/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchWithAuth('/inventory', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', quantity: 0, price: 0, description: '' });
      fetchInventory();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      description: item.description
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetchWithAuth(`/inventory/${id}`, { method: 'DELETE' });
      fetchInventory();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <AdminPage title="Branch Inventory">
        <div className="admin-loading">Loading inventory...</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Branch Inventory">
      {error && <div className="admin-error">{error}</div>}
      
      {!isCashier && !isChef && (
        <div className="admin-section">
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', quantity: 0, price: 0, description: '' });
              setShowModal(true);
            }}
          >
            Add Inventory Item
          </button>
        </div>
      )}

      <div className="admin-section">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              {!isCashier && !isChef && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                {!isCashier && !isChef && (
                  <td>
                    <button 
                      className="admin-btn admin-btn-secondary"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button 
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(item.id)}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <input
                type="text"
                placeholder="Item Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                required
              />
              <div className="admin-actions">
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
                <button 
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
};

export default Inventory;
