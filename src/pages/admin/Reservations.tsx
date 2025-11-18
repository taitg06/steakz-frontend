import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';

interface Reservation {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  createdAt: string;
  branch?: {
    id: number;
    name: string;
    address: string;
  };
  customer?: {
    id: number;
    name: string;
    email: string;
  };
}

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchWithAuth } = useAdminFetch();
  const currentUserRole = localStorage.getItem('role');
  const isCustomer = currentUserRole === 'CUSTOMER';
  const isCashier = currentUserRole === 'CASHIER';
  const isBranchManager = currentUserRole === 'BRANCH_MANAGER';
  const isAdmin = currentUserRole === 'ADMIN';
  const isChef = currentUserRole === 'CHEF';
  const isStaff = ['ADMIN', 'BRANCH_MANAGER', 'HEADQUARTER_MANAGER', 'CASHIER'].includes(currentUserRole || '');
  
  // Block chefs from accessing reservations
  if (isChef) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#fff',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#b3001b' }}>Access Denied</h1>
          <p style={{ fontSize: '1.5rem', color: '#ccc' }}>Reservations are not accessible to chefs.</p>
          <p style={{ fontSize: '1.2rem', color: '#999', marginTop: '1rem' }}>Please contact your manager if you need assistance.</p>
        </div>
      </div>
    );
  }
  
  // Cashiers, Branch Managers, and Admins should only see all reservations, not their own
  const [activeTab, setActiveTab] = useState<'my' | 'all'>((isCashier || isBranchManager || isAdmin) ? 'all' : 'my');

  useEffect(() => {
    if (isCustomer || (activeTab === 'my' && !isCashier && !isBranchManager && !isAdmin)) {
      fetchMyReservations();
    }
    if (isStaff && activeTab === 'all') {
      fetchAllReservations();
    }
  }, [activeTab]);

  const fetchMyReservations = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/reservations/my-reservations');
      setMyReservations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/reservations/all');
      setReservations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetchWithAuth(`/reservations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (activeTab === 'all') {
        fetchAllReservations();
      } else {
        fetchMyReservations();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await fetchWithAuth(`/reservations/${id}`, { method: 'DELETE' });
      if (activeTab === 'all') {
        fetchAllReservations();
      } else {
        fetchMyReservations();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '#27ae60';
      case 'PENDING': return '#f39c12';
      case 'CANCELLED': return '#e74c3c';
      case 'COMPLETED': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '✓';
      case 'PENDING': return '⏳';
      case 'CANCELLED': return '✗';
      case 'COMPLETED': return '✔';
      default: return '•';
    }
  };

  const currentReservations = activeTab === 'my' ? myReservations : reservations;

  if (loading) {
    return (
      <AdminPage title="Reservations">
        <div className="admin-loading">Loading reservations...</div>
      </AdminPage>
    );
  }

  // Customer view (simplified, card-based)
  if (isCustomer) {
    return (
      <AdminPage title="My Reservations">
        {error && <div className="admin-error">{error}</div>}
        
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {myReservations.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontSize: '1.5rem', color: '#495057', marginBottom: '1rem' }}>
                No Reservations Yet
              </h3>
              <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                You haven't made any reservations. Book a table to enjoy our premium steaks!
              </p>
              <a 
                href="/reserve" 
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#b3001b',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}
              >
                Reserve a Table
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
              {myReservations.map((reservation) => (
                <div 
                  key={reservation.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e9ecef',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#2c3e50' }}>
                      Reservation #{reservation.id}
                    </h3>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(reservation.status)
                    }}>
                      {getStatusIcon(reservation.status)} {reservation.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#495057' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>📅</span>
                      <strong>Date:</strong> {reservation.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>🕐</span>
                      <strong>Time:</strong> {reservation.time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>👥</span>
                      <strong>Guests:</strong> {reservation.guests}
                    </div>
                    {reservation.branch && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📍</span>
                        <strong>Branch:</strong> {reservation.branch.name}
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid #e9ecef',
                    fontSize: '0.9rem',
                    color: '#6c757d'
                  }}>
                    <div><strong>Name:</strong> {reservation.name}</div>
                    <div><strong>Email:</strong> {reservation.email}</div>
                    <div><strong>Phone:</strong> {reservation.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminPage>
    );
  }

  // Staff view with tabs
  return (
    <AdminPage title="Reservations">
      {error && <div className="admin-error">{error}</div>}
      
      {/* Tab Navigation - Hide "My Reservations" for cashiers, branch managers, and admins */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #e9ecef'
      }}>
        {!isCashier && !isBranchManager && !isAdmin && (
          <button
            onClick={() => setActiveTab('my')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: activeTab === 'my' ? '#b3001b' : '#6c757d',
              borderBottom: activeTab === 'my' ? '3px solid #b3001b' : '3px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            My Reservations
          </button>
        )}
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: activeTab === 'all' ? '#b3001b' : '#6c757d',
            borderBottom: activeTab === 'all' ? '3px solid #b3001b' : '3px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          All Reservations {activeTab === 'all' && `(${reservations.length})`}
        </button>
      </div>
      
      <div className="admin-section">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            📅 {activeTab === 'my' ? 'My Reservations' : 'All Reservations'}
          </h2>
          <p style={{ color: '#6c757d' }}>
            {activeTab === 'my' 
              ? `You have ${myReservations.length} reservation(s)`
              : `Total Reservations: ${reservations.length}`
            }
          </p>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Date & Time</th>
              <th>Guests</th>
              <th>Status</th>
              {(currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER' || currentUserRole === 'BRANCH_MANAGER') && (
                <th>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentReservations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                  No reservations found
                </td>
              </tr>
            ) : (
              currentReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>
                    <div>
                      <strong>{reservation.name}</strong>
                      {reservation.customer && (
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          Customer ID: {reservation.customer.id}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div>📧 {reservation.email}</div>
                      <div>📞 {reservation.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>📅 {reservation.date}</div>
                      <div>🕐 {reservation.time}</div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {reservation.guests}
                  </td>
                  <td>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(reservation.status)
                    }}>
                      {reservation.status}
                    </span>
                  </td>
                  {(currentUserRole === 'ADMIN' || currentUserRole === 'HEADQUARTER_MANAGER' || currentUserRole === 'BRANCH_MANAGER') && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {reservation.status === 'PENDING' && (
                          <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => updateStatus(reservation.id, 'CONFIRMED')}
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                          >
                            Confirm
                          </button>
                        )}
                        {reservation.status === 'CONFIRMED' && (
                          <button
                            className="admin-btn admin-btn-secondary"
                            onClick={() => updateStatus(reservation.id, 'COMPLETED')}
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                          >
                            Complete
                          </button>
                        )}
                        {reservation.status !== 'CANCELLED' && (
                          <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => updateStatus(reservation.id, 'CANCELLED')}
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDelete(reservation.id)}
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
};

export default Reservations;
