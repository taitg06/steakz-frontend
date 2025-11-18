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

const Reserve: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reserve' | 'my-reservations'>('reserve');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationError, setReservationError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2'
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'my-reservations') {
      fetchReservations();
    }
  }, [activeTab]);

  const fetchReservations = async () => {
    try {
      setLoadingReservations(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setReservationError('Please log in to view your reservations');
        setLoadingReservations(false);
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
          setReservationError('Session expired. Please log in again.');
          localStorage.removeItem('token');
        } else {
          setReservationError(errorData.message || 'Failed to load reservations');
        }
      }
    } catch (err) {
      setReservationError('Network error. Please try again.');
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          guests: '2'
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.message || 'Failed to create reservation');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
      console.error('Reservation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  return (
    <section className="reserve-page" style={{ 
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '4rem 2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #e9ecef',
          background: '#f8f9fa'
        }}>
          <button
            onClick={() => setActiveTab('reserve')}
            style={{
              flex: 1,
              padding: '1.25rem 2rem',
              border: 'none',
              background: activeTab === 'reserve' ? 'linear-gradient(135deg, #b3001b 0%, #8b0015 100%)' : 'transparent',
              color: activeTab === 'reserve' ? 'white' : '#6c757d',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              borderBottom: activeTab === 'reserve' ? '3px solid #b3001b' : '3px solid transparent'
            }}
          >
            📅 Reserve a Table
          </button>
          <button
            onClick={() => setActiveTab('my-reservations')}
            style={{
              flex: 1,
              padding: '1.25rem 2rem',
              border: 'none',
              background: activeTab === 'my-reservations' ? 'linear-gradient(135deg, #b3001b 0%, #8b0015 100%)' : 'transparent',
              color: activeTab === 'my-reservations' ? 'white' : '#6c757d',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              borderBottom: activeTab === 'my-reservations' ? '3px solid #b3001b' : '3px solid transparent'
            }}
          >
            📋 My Reservations
          </button>
        </div>

        {/* Reserve Tab Content */}
        {activeTab === 'reserve' && (
          <>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #b3001b 0%, #8b0015 100%)',
              color: 'white',
              padding: '2.5rem 2rem',
              textAlign: 'center'
            }}>
              <h1 style={{ 
                fontSize: '2.5rem', 
                margin: '0 0 0.5rem 0',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700
              }}>Reserve a Table</h1>
              <p style={{ 
                fontSize: '1.1rem', 
                margin: 0,
                opacity: 0.9
              }}>Join us for an unforgettable dining experience</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '2.5rem 2rem' }}>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Name */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                Full Name *
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#b3001b'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Email & Phone Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#2c3e50'
                }}>
                  Email *
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#b3001b'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#2c3e50'
                }}>
                  Phone *
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                  placeholder="(555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#b3001b'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            {/* Date & Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#2c3e50'
                }}>
                  Date *
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date}
                  onChange={handleChange}
                  required 
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#b3001b'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#2c3e50'
                }}>
                  Time *
                </label>
                <input 
                  type="time" 
                  name="time" 
                  value={formData.time}
                  onChange={handleChange}
                  required 
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#b3001b'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                Number of Guests *
              </label>
              <input 
                type="number" 
                name="guests" 
                value={formData.guests}
                onChange={handleChange}
                min="1" 
                max="20" 
                required 
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#b3001b'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.1rem',
                backgroundColor: loading ? '#999' : '#b3001b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '1rem',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(179, 0, 27, 0.3)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#8b0015';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(179, 0, 27, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#b3001b';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(179, 0, 27, 0.3)';
                }
              }}
            >
              {loading ? '⏳ Processing...' : '🍽️ Confirm Reservation'}
            </button>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '8px',
                color: '#721c24',
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: 500
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Success Message */}
            {submitted && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '8px',
                color: '#155724',
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: 500
              }}>
                ✓ Reservation request submitted successfully!
              </div>
            )}
          </div>
          </form>

          {/* Footer Note */}
          <div style={{
            padding: '1.5rem 2rem',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#6c757d'
          }}>
            <p style={{ margin: 0 }}>
              📞 For parties larger than 20 guests, please call us at <strong>(555) 123-4567</strong>
            </p>
          </div>
        </>
        )}

        {/* My Reservations Tab Content */}
        {activeTab === 'my-reservations' && (
          <div style={{ padding: '2rem' }}>
            {loadingReservations ? (
              <div style={{ 
                textAlign: 'center',
                padding: '4rem 2rem',
                fontSize: '1.2rem',
                color: '#6c757d'
              }}>
                Loading your reservations...
              </div>
            ) : reservationError ? (
              <div style={{
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#721c24',
                fontSize: '1rem',
                textAlign: 'center'
              }}>
                ⚠️ {reservationError}
              </div>
            ) : reservations.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ fontSize: '1.5rem', color: '#495057', marginBottom: '1rem' }}>
                  No Reservations Yet
                </h3>
                <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                  You haven't made any reservations. Book a table to enjoy our premium steaks!
                </p>
                <button
                  onClick={() => setActiveTab('reserve')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#b3001b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Reserve a Table
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {reservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid #e9ecef',
                      borderLeft: `6px solid ${getStatusColor(reservation.status)}`,
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
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
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', color: '#495057' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Date & Time</div>
                        <div style={{ fontWeight: 600 }}>📅 {reservation.date} at {reservation.time}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Guests</div>
                        <div style={{ fontWeight: 600 }}>👥 {reservation.guests}</div>
                      </div>
                      {reservation.branch && (
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Branch</div>
                          <div style={{ fontWeight: 600 }}>📍 {reservation.branch.name}</div>
                        </div>
                      )}
                    </div>

                    <div style={{ 
                      marginTop: '1rem', 
                      paddingTop: '1rem', 
                      borderTop: '1px solid #dee2e6',
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
        )}
      </div>
    </section>
  );
};

export default Reserve;
