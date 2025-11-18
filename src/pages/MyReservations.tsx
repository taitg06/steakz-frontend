import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

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
    phone: string;
  };
}

const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your reservations');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/reservations/my-reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          setError('Session expired. Please log in again.');
          // Optionally clear token and redirect to login
          localStorage.removeItem('token');
        } else {
          setError(errorData.message || 'Failed to load reservations');
        }
        console.error('Server error:', response.status, errorData);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch reservations error:', err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div style={{ 
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem',
        color: '#6c757d'
      }}>
        Loading your reservations...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '3rem 2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            margin: '0 0 0.5rem 0',
            color: '#2c3e50',
            fontFamily: 'Playfair Display, serif'
          }}>
            My Reservations
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#6c757d',
            margin: 0
          }}>
            View and manage your table reservations
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            color: '#721c24',
            fontSize: '1rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
            <h2 style={{ fontSize: '1.8rem', color: '#2c3e50', marginBottom: '0.5rem' }}>
              No Reservations Yet
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6c757d', marginBottom: '2rem' }}>
              You haven't made any reservations. Reserve a table to get started!
            </p>
            <a
              href="/reserve"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#b3001b',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                transition: 'all 0.3s'
              }}
            >
              Reserve a Table
            </a>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1.5rem'
          }}>
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderLeft: `6px solid ${getStatusColor(reservation.status)}`,
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '2rem',
                  alignItems: 'start'
                }}>
                  {/* Status Badge */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(reservation.status),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {getStatusIcon(reservation.status)}
                    </div>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: getStatusColor(reservation.status),
                      textTransform: 'uppercase'
                    }}>
                      {reservation.status}
                    </span>
                  </div>

                  {/* Reservation Details */}
                  <div>
                    <h3 style={{
                      fontSize: '1.5rem',
                      margin: '0 0 1rem 0',
                      color: '#2c3e50'
                    }}>
                      Reservation #{reservation.id}
                    </h3>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div>
                        <strong style={{ color: '#6c757d', fontSize: '0.9rem' }}>Date & Time</strong>
                        <div style={{ fontSize: '1.1rem', marginTop: '0.3rem' }}>
                          📅 {reservation.date}
                        </div>
                        <div style={{ fontSize: '1.1rem', marginTop: '0.2rem' }}>
                          🕐 {reservation.time}
                        </div>
                      </div>

                      <div>
                        <strong style={{ color: '#6c757d', fontSize: '0.9rem' }}>Guests</strong>
                        <div style={{ fontSize: '1.1rem', marginTop: '0.3rem' }}>
                          👥 {reservation.guests} {reservation.guests === 1 ? 'person' : 'people'}
                        </div>
                      </div>

                      {reservation.branch && (
                        <div>
                          <strong style={{ color: '#6c757d', fontSize: '0.9rem' }}>Branch</strong>
                          <div style={{ fontSize: '1.1rem', marginTop: '0.3rem' }}>
                            🏢 {reservation.branch.name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.2rem' }}>
                            {reservation.branch.address}
                          </div>
                        </div>
                      )}

                      <div>
                        <strong style={{ color: '#6c757d', fontSize: '0.9rem' }}>Contact</strong>
                        <div style={{ fontSize: '0.95rem', marginTop: '0.3rem' }}>
                          📧 {reservation.email}
                        </div>
                        <div style={{ fontSize: '0.95rem', marginTop: '0.2rem' }}>
                          📞 {reservation.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booked Date */}
                  <div style={{
                    textAlign: 'right',
                    color: '#6c757d',
                    fontSize: '0.85rem'
                  }}>
                    <div>Booked on</div>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                      {new Date(reservation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
