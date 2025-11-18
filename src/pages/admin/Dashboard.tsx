import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';
import { FaUsers, FaUtensils, FaStore, FaChartBar } from 'react-icons/fa';

interface Stats {
  users: number;
  menuItems: number;
  branches: number;
  orders: number;
  branchId?: number | null;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, menuItems: 0, branches: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchWithAuth } = useAdminFetch();
  const currentUserRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchWithAuth('/stats');
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminPage title="Dashboard">
        <div className="admin-loading">Loading dashboard data...</div>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage title="Dashboard">
        <div className="admin-error">{error}</div>
      </AdminPage>
    );
  }

  const isBranchSpecificRole = currentUserRole === 'BRANCH_MANAGER' || 
                               currentUserRole === 'CHEF' || 
                               currentUserRole === 'CASHIER';
  
  const dashboardTitle = currentUserRole === 'CHEF' ? 'Kitchen Dashboard' :
                        currentUserRole === 'CASHIER' ? 'Cashier Dashboard' :
                        isBranchSpecificRole ? 'Branch Dashboard' : 
                        'Dashboard';

  return (
    <AdminPage title={dashboardTitle}>
      {isBranchSpecificRole && stats.branchId && (
        <div className="admin-info" style={{ backgroundColor: '#27ae60', color: 'white', padding: '1.2rem', marginBottom: '1.5rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '500' }}>
          📍 Viewing data for your assigned branch (Branch ID: {stats.branchId})
        </div>
      )}
      {isBranchSpecificRole && !stats.branchId && (
        <div className="admin-error" style={{ padding: '1.5rem', fontSize: '1.1rem' }}>
          ⚠️ You are not assigned to any branch. Please contact an administrator.
        </div>
      )}
      <div className="admin-grid">
        {(currentUserRole !== 'CHEF' && currentUserRole !== 'CASHIER') && (
          <div className="admin-card" style={{ backgroundColor: '#3498db', color: 'white', padding: '2rem' }}>
            <FaUsers size={32} style={{ marginBottom: '1rem', color: 'white' }} />
            <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{isBranchSpecificRole ? 'Branch Staff' : 'Total Users'}</h3>
            <p className="stat-number" style={{ color: 'white', fontSize: '3rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.users}</p>
          </div>
        )}
        <div className="admin-card" style={{ backgroundColor: '#e67e22', color: 'white', padding: '2rem' }}>
          <FaUtensils size={32} style={{ marginBottom: '1rem', color: 'white' }} />
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{isBranchSpecificRole ? 'Branch Inventory' : 'Menu Items'}</h3>
          <p className="stat-number" style={{ color: 'white', fontSize: '3rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.menuItems}</p>
        </div>
        <div className="admin-card" style={{ backgroundColor: '#9b59b6', color: 'white', padding: '2rem' }}>
          <FaStore size={32} style={{ marginBottom: '1rem', color: 'white' }} />
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{isBranchSpecificRole ? 'My Branch' : 'Branches'}</h3>
          <p className="stat-number" style={{ color: 'white', fontSize: '3rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.branches}</p>
        </div>
        <div className="admin-card" style={{ backgroundColor: '#27ae60', color: 'white', padding: '2rem' }}>
          <FaChartBar size={32} style={{ marginBottom: '1rem', color: 'white' }} />
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{isBranchSpecificRole ? 'Branch Orders' : 'Total Orders'}</h3>
          <p className="stat-number" style={{ color: 'white', fontSize: '3rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.orders}</p>
        </div>
      </div>

      <section className="admin-section">
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2c3e50' }}>Quick Actions</h2>
        <div className="admin-actions" style={{ gap: '1rem' }}>
          {(currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER') && (
            <button className="admin-btn admin-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => window.location.href = '/admin/users'}>
              👥 Manage Users
            </button>
          )}
          {currentUserRole === 'BRANCH_MANAGER' && (
            <button className="admin-btn admin-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => window.location.href = '/admin/staff'}>
              👨‍💼 View Branch Staff
            </button>
          )}
          <button className="admin-btn admin-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', backgroundColor: '#e67e22' }} onClick={() => window.location.href = '/admin/menu'}>
            🍽️ {(currentUserRole === 'CHEF' || currentUserRole === 'CASHIER') ? 'View Menu' : currentUserRole === 'BRANCH_MANAGER' ? 'View Menu' : 'Manage Menu'}
          </button>
          {(currentUserRole === 'BRANCH_MANAGER' || currentUserRole === 'CHEF' || currentUserRole === 'CASHIER') && (
            <button className="admin-btn admin-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', backgroundColor: '#9b59b6' }} onClick={() => window.location.href = '/admin/inventory'}>
              📦 {currentUserRole === 'BRANCH_MANAGER' ? 'Manage Inventory' : 'View Inventory'}
            </button>
          )}
          {currentUserRole === 'CASHIER' && (
            <button className="admin-btn admin-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', backgroundColor: '#3498db' }} onClick={() => window.location.href = '/admin/checkout'}>
              💳 Checkout
            </button>
          )}
          {(currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER') && (
            <button className="admin-btn admin-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => window.location.href = '/admin/branches'}>
              🏢 Manage Branches
            </button>
          )}
          {(currentUserRole !== 'CHEF' && currentUserRole !== 'CASHIER') && (
            <button className="admin-btn admin-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', backgroundColor: '#27ae60' }} onClick={() => window.location.href = '/admin/reports'}>
              📊 View Reports
            </button>
          )}
        </div>
      </section>
    </AdminPage>
  );
};

export default Dashboard;