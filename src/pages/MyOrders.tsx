import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

interface OrderItem {
  id: number;
  menuItem: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  branch?: {
    name: string;
    address: string;
  };
  items: OrderItem[];
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyOrders();
    // Auto-refresh every 10 seconds to see status updates
    const interval = setInterval(fetchMyOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to load orders');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmCollection = async (orderId: number) => {
    const token = localStorage.getItem('token');
    setConfirmingOrderId(orderId);

    try {
      const response = await fetch(`${API_URL}/orders/confirm-collection/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('✓ Collection confirmed! Thank you for your order.');
        fetchMyOrders(); // Refresh orders
      } else {
        alert(data.message || 'Failed to confirm collection');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#27ae60';
      case 'READY': return '#2ecc71';
      case 'PREPARING': return '#f39c12';
      case 'CONFIRMED': return '#3498db';
      case 'PENDING': return '#e67e22';
      case 'CANCELLED': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '✅';
      case 'READY': return '🎉';
      case 'PREPARING': return '👨‍🍳';
      case 'CONFIRMED': return '✔️';
      case 'PENDING': return '⏳';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%)',
        padding: '4rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffd700',
        fontSize: '1.2rem'
      }}>
        Loading your orders...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%)',
      padding: '4rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#ffd700'
        }}>
          <h1 style={{ 
            fontSize: '3rem',
            marginBottom: '0.5rem',
            fontFamily: 'Playfair Display, serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            My Orders
          </h1>
          <p style={{ 
            fontSize: '1.1rem',
            color: '#d4af37'
          }}>
            View your order history
          </p>
          <div style={{
            width: '100px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #b3001b, transparent)',
            margin: '1rem auto'
          }}></div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#2c1810',
            border: '2px solid #b3001b',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            color: '#ffd700',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#2c1810',
            borderRadius: '16px',
            border: '2px solid #4a3428'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
            <h2 style={{ fontSize: '1.8rem', color: '#ffd700', marginBottom: '0.5rem' }}>
              No Orders Yet
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#d4af37', marginBottom: '2rem' }}>
              You haven't placed any orders. Check out our menu!
            </p>
            <a
              href="/menu"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#b3001b',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              View Menu
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: 'linear-gradient(145deg, #2c1810 0%, #1a1a1a 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: '2px solid #4a3428',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                {/* Order Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid #4a3428'
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      margin: '0 0 0.5rem 0',
                      color: '#ffd700',
                      fontFamily: 'Playfair Display, serif'
                    }}>
                      Order #{order.id}
                    </h3>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#d4af37',
                      margin: 0
                    }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(order.status)
                  }}>
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </div>

                {/* Branch Info */}
                {order.branch && (
                  <div style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #4a3428'
                  }}>
                    <div style={{ color: '#ffd700', fontWeight: 600, marginBottom: '0.25rem' }}>
                      📍 {order.branch.name}
                    </div>
                    <div style={{ color: '#d4af37', fontSize: '0.9rem' }}>
                      {order.branch.address}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ 
                    color: '#ffd700',
                    marginBottom: '1rem',
                    fontSize: '1.2rem'
                  }}>
                    Items:
                  </h4>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '6px',
                        border: '1px solid #4a3428'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ color: '#ffd700', fontWeight: 600 }}>
                          {item.menuItem.name}
                        </span>
                        <span style={{ color: '#d4af37', marginLeft: '1rem' }}>
                          × {item.quantity}
                        </span>
                      </div>
                      <span style={{ 
                        color: '#ffd700',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '2px solid #4a3428',
                  marginBottom: order.status === 'READY' ? '1rem' : '0'
                }}>
                  <span style={{ 
                    color: '#ffd700',
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}>
                    Total:
                  </span>
                  <span style={{ 
                    color: '#ffd700',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    fontFamily: 'Georgia, serif'
                  }}>
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Collection Confirmation Button */}
                {order.status === 'READY' && (
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '2px solid #2ecc71',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: '#2ecc71',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      🎉 Your order is ready for pickup!
                    </div>
                    <p style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '0.95rem' }}>
                      Please collect your order from {order.branch?.name}
                    </p>
                    <button
                      onClick={() => confirmCollection(order.id)}
                      disabled={confirmingOrderId === order.id}
                      style={{
                        padding: '1rem 2rem',
                        backgroundColor: confirmingOrderId === order.id ? '#666' : '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: confirmingOrderId === order.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (confirmingOrderId !== order.id) {
                          e.currentTarget.style.backgroundColor = '#27ae60';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (confirmingOrderId !== order.id) {
                          e.currentTarget.style.backgroundColor = '#2ecc71';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {confirmingOrderId === order.id ? '⏳ Confirming...' : '✅ Confirm I Collected My Order'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
