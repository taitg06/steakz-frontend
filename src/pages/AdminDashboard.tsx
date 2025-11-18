import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API_URL = 'http://localhost:3001/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [inventoryEdit, setInventoryEdit] = useState<{[id: string]: number}>({});
  const token = localStorage.getItem('token');

  // Fetch all users
  useEffect(() => {
    fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : data.users || []));
  }, [token]);

  // Fetch branches
  useEffect(() => {
    fetch(`${API_URL}/branches`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setBranches(Array.isArray(data) ? data : data.branches || []));
  }, [token]);

  // Fetch inventory
  useEffect(() => {
    fetch(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setInventory(Array.isArray(data) ? data : data.inventory || []));
  }, [token]);

  // Change user role
  const handleRoleChange = async (userId: string) => {
    setLoading(true);
    await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setSelectedUser(null);
    setLoading(false);
  };

  // Add branch
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API_URL}/branches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: branchName, address: branchAddress })
    });
    if (res.ok) {
      const newBranch = await res.json();
      setBranches([...branches, newBranch]);
      setBranchName('');
      setBranchAddress('');
    }
    setLoading(false);
  };

  // Edit branch
  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    setLoading(true);
    const res = await fetch(`${API_URL}/branches/${selectedBranch.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: branchName, address: branchAddress })
    });
    if (res.ok) {
      setBranches(branches.map(b => b.id === selectedBranch.id ? { ...b, name: branchName, address: branchAddress } : b));
      setSelectedBranch(null);
      setBranchName('');
      setBranchAddress('');
    }
    setLoading(false);
  };

  // Delete branch
  const handleDeleteBranch = async (branchId: string) => {
    setLoading(true);
    await fetch(`${API_URL}/branches/${branchId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setBranches(branches.filter(b => b.id !== branchId));
    setLoading(false);
  };

  // Update inventory
  const handleUpdateInventory = async (itemId: string) => {
    setLoading(true);
    await fetch(`${API_URL}/inventory/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quantity: inventoryEdit[itemId] })
    });
    setInventory(inventory.map(i => i.id === itemId ? { ...i, quantity: inventoryEdit[itemId] } : i));
    setInventoryEdit({ ...inventoryEdit, [itemId]: 0 });
    setLoading(false);
  };

  return (
    <section className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <h2>Users</h2>
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => setSelectedUser(user)}>Change Role</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <div className="modal-bg" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Change Role for {selectedUser.name}</h3>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              <option value="HEADQUARTER_MANAGER">Headquarter Manager</option>
              <option value="chef">Chef</option>
            </select>
            <button onClick={() => handleRoleChange(selectedUser.id)} disabled={loading}>
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </div>
      )}
      <h2>Branches</h2>
      <form onSubmit={selectedBranch ? handleEditBranch : handleAddBranch} className="branch-form">
        <input type="text" placeholder="Branch Name" value={branchName} onChange={e => setBranchName(e.target.value)} required />
        <input type="text" placeholder="Branch Address" value={branchAddress} onChange={e => setBranchAddress(e.target.value)} required />
        <button type="submit" disabled={loading}>{selectedBranch ? 'Update Branch' : 'Add Branch'}</button>
        {selectedBranch && <button type="button" onClick={() => { setSelectedBranch(null); setBranchName(''); setBranchAddress(''); }}>Cancel</button>}
      </form>
      <ul>
        {branches.map(branch => (
          <li key={branch.id}>
            {branch.name} - {branch.address}
            <button onClick={() => { setSelectedBranch(branch); setBranchName(branch.name); setBranchAddress(branch.address); }}>Edit</button>
            <button onClick={() => handleDeleteBranch(branch.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2>Inventory</h2>
      <ul>
        {inventory.map(item => (
          <li key={item.id}>
            {item.name}: {item.quantity}
            <input
              type="number"
              value={inventoryEdit[item.id] ?? ''}
              onChange={e => setInventoryEdit({ ...inventoryEdit, [item.id]: Number(e.target.value) })}
              placeholder="New Qty"
              style={{ width: 70, marginLeft: 8 }}
            />
            <button onClick={() => handleUpdateInventory(item.id)} disabled={loading || !inventoryEdit[item.id]}>Update</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AdminDashboard;
