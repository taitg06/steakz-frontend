import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId?: number | null;
  managedBranch?: {
    id: number;
    name: string;
  };
  assignedBranch?: {
    id: number;
    name: string;
  };
}

interface Branch {
  id: number;
  name: string;
  managerId: number | null;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingBranchUserId, setEditingBranchUserId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | string>('');
  const [newRole, setNewRole] = useState('CUSTOMER');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // New user form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('CUSTOMER');
  
  const { fetchWithAuth } = useAdminFetch();
  const currentUserRole = localStorage.getItem('role');

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth('/users');
      // Ensure we're getting an array from the response
      const usersData = Array.isArray(response) ? response : response.users || [];
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetchWithAuth('/branches');
      const branchesData = Array.isArray(response) ? response : response.branches || [];
      setBranches(branchesData);
    } catch (err: any) {
      console.error('Error fetching branches:', err);
    }
  };

  const handleRoleChange = async (userId: string) => {
    try {
      // HQ Manager cannot modify ADMIN or other HQ_MANAGER roles
      if (currentUserRole === 'HEADQUARTER_MANAGER' && (newRole === 'ADMIN' || newRole === 'HEADQUARTER_MANAGER')) {
        setError('You do not have permission to assign this role');
        return;
      }
      
      await fetchWithAuth(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSelectedUser(null);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignBranch = async (userId: string, branchId: number | string) => {
    if (!branchId) {
      setError('Please select a branch');
      return;
    }
    
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      // If user is BRANCH_MANAGER, assign as manager via branch endpoint
      if (user.role === 'BRANCH_MANAGER') {
        await fetchWithAuth(`/branches/${branchId}`, {
          method: 'PUT',
          body: JSON.stringify({ managerId: Number(userId) })
        });
      } else if (user.role === 'CHEF' || user.role === 'CASHIER') {
        // If user is CHEF or CASHIER, assign as staff via user endpoint
        await fetchWithAuth(`/users/${userId}/assign-branch`, {
          method: 'PUT',
          body: JSON.stringify({ branchId: Number(branchId) })
        });
      }
      
      setEditingBranchUserId(null);
      setSelectedBranchId('');
      setError('');
      fetchUsers();
      fetchBranches();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnassignBranch = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user?.managedBranch) return;
    
    try {
      await fetchWithAuth(`/branches/${user.managedBranch.id}`, {
        method: 'PUT',
        body: JSON.stringify({ managerId: null })
      });
      
      setError('');
      fetchUsers();
      fetchBranches();
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleUnassignStaffBranch = async (userId: string) => {
    try {
      await fetchWithAuth(`/users/${userId}/assign-branch`, {
        method: 'PUT',
        body: JSON.stringify({ branchId: null })
      });
      
      setError('');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const userData = {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      };
      
      const newUser = await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      setSuccess('User created successfully!');
      setShowCreateForm(false);
      
      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('CUSTOMER');
      
      // Refresh users list
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    }
  };

  if (loading) {
    return (
      <AdminPage title="User Management">
        <div className="admin-loading">Loading users...</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="User Management">
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
      
      {/* Create User Section */}
      {currentUserRole === 'ADMIN' && (
        <div className="admin-section" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Create New User</h2>
            <button 
              className="admin-btn admin-btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : '+ Add New User'}
            </button>
          </div>
          
          {showCreateForm && (
            <form onSubmit={handleCreateUser} className="admin-form" style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  required
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                  <option value="HEADQUARTER_MANAGER">Headquarter Manager</option>
                  <option value="BRANCH_MANAGER">Branch Manager</option>
                  <option value="CHEF">Chef</option>
                  <option value="CASHIER">Cashier</option>
                </select>
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>
                Create User
              </button>
            </form>
          )}
        </div>
      )}
      
      <div className="admin-section">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              {(currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER') && <th>Assigned Branch</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              // HQ Manager cannot modify ADMIN or other HQ_MANAGER users
              const canModify = currentUserRole === 'ADMIN' || 
                               (currentUserRole === 'HEADQUARTER_MANAGER' && 
                                user.role !== 'ADMIN' && 
                                user.role !== 'HEADQUARTER_MANAGER');
              
              const isEditingBranch = editingBranchUserId === user.id;
              const canAssignBranch = (currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER') && 
                                     (user.role === 'BRANCH_MANAGER' || user.role === 'CHEF' || user.role === 'CASHIER');
              
              return (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  {(currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER') && (
                    <td>
                      {isEditingBranch ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            value={selectedBranchId}
                            onChange={(e) => setSelectedBranchId(e.target.value)}
                            style={{
                              padding: '0.4rem',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value="">-- Select Branch --</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => handleAssignBranch(user.id, selectedBranchId)}
                          >
                            Save
                          </button>
                          <button
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => {
                              setEditingBranchUserId(null);
                              setSelectedBranchId('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {/* Show managed branch for BRANCH_MANAGER */}
                          {user.managedBranch ? (
                            <>
                              <span style={{ color: '#2c3e50', fontWeight: '500' }}>
                                {user.managedBranch.name} (Manager)
                              </span>
                              <button
                                className="admin-btn admin-btn-danger"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleUnassignBranch(user.id)}
                              >
                                Unassign
                              </button>
                            </>
                          ) : user.assignedBranch ? (
                            /* Show assigned branch for CHEF/CASHIER */
                            <>
                              <span style={{ color: '#2c3e50', fontWeight: '500' }}>
                                {user.assignedBranch.name}
                              </span>
                              <button
                                className="admin-btn admin-btn-danger"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleUnassignStaffBranch(user.id)}
                              >
                                Unassign
                              </button>
                            </>
                          ) : canAssignBranch ? (
                            <button
                              className="admin-btn admin-btn-primary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              onClick={() => {
                                setEditingBranchUserId(user.id);
                                setSelectedBranchId('');
                              }}
                            >
                              Assign Branch
                            </button>
                          ) : (
                            <span style={{ color: '#888' }}>N/A</span>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                  <td>
                    {canModify ? (
                      <button 
                        className="admin-btn admin-btn-secondary"
                        onClick={() => setSelectedUser(user)}
                      >
                        Change Role
                      </button>
                    ) : (
                      <span style={{ color: '#888' }}>No Access</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="modal-bg" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Change Role for {selectedUser.name}</h3>
            <div className="admin-form">
              <select 
                value={newRole} 
                onChange={e => setNewRole(e.target.value)}
              >
                <option value="CUSTOMER">Customer</option>
                {currentUserRole === 'ADMIN' && <option value="ADMIN">Admin</option>}
                {currentUserRole === 'ADMIN' && <option value="HEADQUARTER_MANAGER">Headquarter Manager</option>}
                <option value="BRANCH_MANAGER">Branch Manager</option>
                <option value="CHEF">Chef</option>
                <option value="CASHIER">Cashier</option>
              </select>
              <div className="admin-actions">
                <button 
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleRoleChange(selectedUser.id)}
                >
                  Update Role
                </button>
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
};

export default Users;