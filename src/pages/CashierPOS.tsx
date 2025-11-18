import React, { useState, useEffect } from 'react';

interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
    description: string;
  };
}

interface PendingOrder {
  id: number;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  branch: {
    name: string;
    address: string;
  };
  items: OrderItem[];
}

const CashierPOS: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  
  // Check if user is cashier
  const currentUserRole = localStorage.getItem('role');
  const isCashier = currentUserRole === 'CASHIER';

  // Restrict access to cashiers only
  if (!isCashier) {
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
          <p style={{ fontSize: '1.5rem', color: '#ccc' }}>POS System is only accessible to Cashiers.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPendingOrders();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/api/orders/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingOrders(data);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId: number) => {
    const token = localStorage.getItem('token');
    setConfirmingOrderId(orderId);

    try {
      const response = await fetch(`http://localhost:3001/api/orders/cashier-confirm/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('✓ Order confirmed successfully!');
        setSelectedOrder(null);
        fetchPendingOrders(); // Refresh the list
      } else {
        alert(data.message || 'Failed to confirm order');
      }
    } catch (error) {
      alert('Network error. Please try again.');
      console.error('Error confirming order:', error);
    } finally {
      setConfirmingOrderId(null);
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
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#ffd700' }}>Loading POS...</div>
      </div>
    );
  }

  return (
    <section style={{
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%)',
      padding: '4rem 2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          marginBottom: '3rem',
          textAlign: 'center',
          borderBottom: '3px solid #4a3428',
          paddingBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#ffd700',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            💳 Cashier POS System
          </h1>
          <p style={{ color: '#d4af37', fontSize: '1.2rem' }}>
            Pending Customer Orders: {pendingOrders.length}
          </p>
        </div>

        {pendingOrders.length === 0 ? (
          <div style={{
            backgroundColor: '#2d2216',
            padding: '3rem',
            borderRadius: '12px',
            border: '2px solid #4a3428',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: '#ffd700', fontSize: '1.8rem', marginBottom: '1rem' }}>
              All Orders Processed
            </h3>
            <p style={{ color: '#d4af37', fontSize: '1.1rem' }}>
              No pending customer orders at the moment.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#2d2216',
                  borderRadius: '12px',
                  border: '3px solid #b3001b',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  position: 'relative'
                }}
                onClick={() => setSelectedOrder(order)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(179,0,27,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  PENDING
                </div>

                <h3 style={{
                  color: '#ffd700',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  paddingRight: '80px'
                }}>
                  Order #{order.id}
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                    <strong>Customer:</strong> {order.customer.name}
                  </p>
                  <p style={{ color: '#d4af37', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <strong>Email:</strong> {order.customer.email}
                  </p>
                  <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                    <strong>Payment:</strong> {order.paymentMethod.replace('_', ' ')}
                  </p>
                  <p style={{ color: '#d4af37', fontSize: '0.9rem' }}>
                    <strong>Time:</strong> {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div style={{
                  borderTop: '1px solid #4a3428',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}>
                  <h4 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>Items:</h4>
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      {item.quantity}x {item.menuItem.name}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={{ color: '#d4af37', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>

                <div style={{
                  borderTop: '2px solid #4a3428',
                  paddingTop: '1rem',
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#ffd700', fontSize: '1.3rem', fontWeight: 'bold' }}>
                    Total:
                  </span>
                  <span style={{ color: '#ffd700', fontSize: '1.6rem', fontWeight: 'bold' }}>
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#1a1208',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              border: '3px solid #b3001b',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}>
              <h2 style={{
                color: '#ffd700',
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #4a3428',
                paddingBottom: '1rem'
              }}>
                Order #{selectedOrder.id} Details
              </h2>

              <div style={{
                backgroundColor: '#2d2216',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px solid #4a3428',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.3rem' }}>
                  Customer Information
                </h3>
                <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                  <strong>Name:</strong> {selectedOrder.customer.name}
                </p>
                <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                  <strong>Email:</strong> {selectedOrder.customer.email}
                </p>
                <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod.replace('_', ' ')}
                </p>
                <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                  <strong>Order Time:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                <p style={{ color: '#d4af37' }}>
                  <strong>Branch:</strong> {selectedOrder.branch.name}
                </p>
              </div>

              <div style={{
                backgroundColor: '#2d2216',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px solid #4a3428',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.3rem' }}>
                  Order Items
                </h3>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid #4a3428'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#ffd700', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                        {item.quantity}x {item.menuItem.name}
                      </div>
                      <div style={{ color: '#d4af37', fontSize: '0.9rem' }}>
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                    <div style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      ${(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '2px solid #4a3428',
                  marginTop: '1rem'
                }}>
                  <span style={{ color: '#ffd700', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Total Amount:
                  </span>
                  <span style={{ color: '#ffd700', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setSelectedOrder(null)}
                  disabled={confirmingOrderId === selectedOrder.id}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: confirmingOrderId === selectedOrder.id ? 'not-allowed' : 'pointer',
                    opacity: confirmingOrderId === selectedOrder.id ? 0.5 : 1
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => confirmOrder(selectedOrder.id)}
                  disabled={confirmingOrderId === selectedOrder.id}
                  style={{
                    flex: 2,
                    padding: '1rem',
                    backgroundColor: confirmingOrderId === selectedOrder.id ? '#666' : '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: confirmingOrderId === selectedOrder.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {confirmingOrderId === selectedOrder.id ? '⏳ Confirming...' : '✓ Confirm Order & Process Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CashierPOS;
