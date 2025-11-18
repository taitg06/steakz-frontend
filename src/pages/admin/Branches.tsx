import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const { fetchWithAuth } = useAdminFetch();

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [managerId, setManagerId] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await fetchWithAuth('/users');
      const usersData = Array.isArray(data) ? data : data.users || [];
      // Filter only managers
      const managers = usersData.filter((u: User) => u.role === 'BRANCH_MANAGER');
      setUsers(managers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await fetchWithAuth('/branches');
      setBranches(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSuccess(''); // Clear previous success messages
    
    try {
      const branchData = {
        name,
        address,
        phone,
        managerId: managerId || null
      };

      if (editBranch) {
        const updatedBranch = await fetchWithAuth(`/branches/${editBranch.id}`, {
          method: 'PUT',
          body: JSON.stringify(branchData)
        });
        setBranches(branches.map(b => b.id === editBranch.id ? updatedBranch : b));
        setSuccess('Branch updated successfully!');
      } else {
        const newBranch = await fetchWithAuth('/branches', {
          method: 'POST',
          body: JSON.stringify(branchData)
        });
        setBranches([...branches, newBranch]);
        setSuccess('Branch created successfully!');
      }

      resetForm();
      // Refresh the branch list to ensure consistency
      await fetchBranches();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving branch');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    
    try {
      await fetchWithAuth(`/branches/${id}`, {
        method: 'DELETE'
      });
      setBranches(branches.filter(branch => branch.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setManagerId('');
    setEditBranch(null);
  };

  if (loading) {
    return (
      <AdminPage title="Branch Management">
        <div className="admin-loading">Loading branches...</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Branch Management">
      {error && <div className="admin-error">{error}</div>}
      {success && (
        <div style={{ 
          padding: '1rem', 
          margin: '1rem 0', 
          backgroundColor: '#d4edda', 
          border: '2px solid #28a745', 
          color: '#155724', 
          borderRadius: '6px', 
          fontWeight: '500' 
        }}>
          {success}
        </div>
      )}

      <section className="admin-section">
        <h2>{editBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="text"
            placeholder="Branch Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ color: '#000', backgroundColor: '#fff', padding: '0.75rem', fontSize: '1rem' }}
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            style={{ color: '#000', backgroundColor: '#fff', padding: '0.75rem', fontSize: '1rem' }}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            style={{ color: '#000', backgroundColor: '#fff', padding: '0.75rem', fontSize: '1rem' }}
          />
          <select
            value={managerId}
            onChange={e => setManagerId(e.target.value)}
            style={{ color: '#000', backgroundColor: '#fff', padding: '0.75rem', fontSize: '1rem' }}
          >
            <option value="">No Manager Assigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <div className="admin-actions">
            <button type="submit" className="admin-btn admin-btn-primary">
              {editBranch ? 'Update Branch' : 'Add Branch'}
            </button>
            {editBranch && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-section">
        <h2>Branches</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map(branch => (
              <tr key={branch.id}>
                <td>{branch.name}</td>
                <td>{branch.address}</td>
                <td>{branch.phone}</td>
                <td>{branch.manager ? branch.manager.name : 'No Manager'}</td>
                <td className="admin-actions">
                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={() => {
                      setEditBranch(branch);
                      setName(branch.name);
                      setAddress(branch.address);
                      setPhone(branch.phone);
                      setManagerId(branch.managerId || '');
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => handleDelete(branch.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminPage>
  );
};

export default Branches;