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

interface KitchenOrder {
  id: number;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  status: 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED';
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  cashier: {
    name: string;
  };
  branch: {
    name: string;
    address: string;
  };
  items: OrderItem[];
}

const ChefKitchen: React.FC = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);

  useEffect(() => {
    fetchKitchenOrders();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchKitchenOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/api/orders/kitchen', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`http://localhost:3001/api/orders/update-status/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✓ Order status updated!');
        if (newStatus === 'COMPLETED') {
          setSelectedOrder(null);
        }
        fetchKitchenOrders(); // Refresh the list
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (error) {
      alert('Network error. Please try again.');
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '#3498db';
      case 'PREPARING': return '#f39c12';
      case 'READY': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '📋';
      case 'PREPARING': return '👨‍🍳';
      case 'READY': return '✅';
      default: return '🔄';
    }
  };

  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');

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
        <div style={{ fontSize: '1.5rem', color: '#ffd700' }}>Loading Kitchen Display...</div>
      </div>
    );
  }

  return (
    <section style={{
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%)',
      padding: '3rem 2rem'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center',
          borderBottom: '3px solid #4a3428',
          paddingBottom: '1.5rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#ffd700',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            👨‍🍳 Kitchen Display System
          </h1>
          <p style={{ color: '#d4af37', fontSize: '1.2rem' }}>
            Active Orders: {orders.length}
          </p>
        </div>

        {orders.length === 0 ? (
          <div style={{
            backgroundColor: '#2d2216',
            padding: '3rem',
            borderRadius: '12px',
            border: '2px solid #4a3428',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😴</div>
            <h3 style={{ color: '#ffd700', fontSize: '1.8rem', marginBottom: '1rem' }}>
              No Active Orders
            </h3>
            <p style={{ color: '#d4af37', fontSize: '1.1rem' }}>
              Kitchen is clear. Waiting for new orders...
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '2rem' }}>
            {/* Confirmed Column */}
            <div style={{ flex: 1 }}>
              <div style={{
                backgroundColor: '#3498db',
                padding: '0.75rem',
                borderRadius: '8px 8px 0 0',
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'white',
                fontSize: '1.2rem'
              }}>
                📋 CONFIRMED ({confirmedOrders.length})
              </div>
              <div style={{ 
                backgroundColor: '#2d2216',
                borderRadius: '0 0 8px 8px',
                border: '3px solid #3498db',
                borderTop: 'none',
                minHeight: '400px',
                padding: '1rem'
              }}>
                {confirmedOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      backgroundColor: '#1a1208',
                      borderRadius: '8px',
                      border: '2px solid #3498db',
                      padding: '1rem',
                      marginBottom: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(52,152,219,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
                      Order #{order.id}
                    </h4>
                    <p style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      Customer: {order.customer.name}
                    </p>
                    <p style={{ color: '#d4af37', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Time: {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    <div style={{ borderTop: '1px solid #4a3428', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ color: '#d4af37', fontSize: '0.85rem' }}>
                          {item.quantity}x {item.menuItem.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparing Column */}
            <div style={{ flex: 1 }}>
              <div style={{
                backgroundColor: '#f39c12',
                padding: '0.75rem',
                borderRadius: '8px 8px 0 0',
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'white',
                fontSize: '1.2rem'
              }}>
                👨‍🍳 PREPARING ({preparingOrders.length})
              </div>
              <div style={{ 
                backgroundColor: '#2d2216',
                borderRadius: '0 0 8px 8px',
                border: '3px solid #f39c12',
                borderTop: 'none',
                minHeight: '400px',
                padding: '1rem'
              }}>
                {preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      backgroundColor: '#1a1208',
                      borderRadius: '8px',
                      border: '2px solid #f39c12',
                      padding: '1rem',
                      marginBottom: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(243,156,18,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
                      Order #{order.id}
                    </h4>
                    <p style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      Customer: {order.customer.name}
                    </p>
                    <p style={{ color: '#d4af37', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Time: {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    <div style={{ borderTop: '1px solid #4a3428', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ color: '#d4af37', fontSize: '0.85rem' }}>
                          {item.quantity}x {item.menuItem.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready Column */}
            <div style={{ flex: 1 }}>
              <div style={{
                backgroundColor: '#27ae60',
                padding: '0.75rem',
                borderRadius: '8px 8px 0 0',
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'white',
                fontSize: '1.2rem'
              }}>
                ✅ READY ({readyOrders.length})
              </div>
              <div style={{ 
                backgroundColor: '#2d2216',
                borderRadius: '0 0 8px 8px',
                border: '3px solid #27ae60',
                borderTop: 'none',
                minHeight: '400px',
                padding: '1rem'
              }}>
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      backgroundColor: '#1a1208',
                      borderRadius: '8px',
                      border: '2px solid #27ae60',
                      padding: '1rem',
                      marginBottom: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(39,174,96,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
                      Order #{order.id}
                    </h4>
                    <p style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      Customer: {order.customer.name}
                    </p>
                    <p style={{ color: '#d4af37', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Time: {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    <div style={{ borderTop: '1px solid #4a3428', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ color: '#d4af37', fontSize: '0.85rem' }}>
                          {item.quantity}x {item.menuItem.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              border: `3px solid ${getStatusColor(selectedOrder.status)}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem', marginRight: '1rem' }}>
                  {getStatusIcon(selectedOrder.status)}
                </span>
                <h2 style={{
                  color: '#ffd700',
                  fontSize: '2.5rem',
                  flex: 1
                }}>
                  Order #{selectedOrder.id}
                </h2>
                <div style={{
                  backgroundColor: getStatusColor(selectedOrder.status),
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}>
                  {selectedOrder.status}
                </div>
              </div>

              <div style={{
                backgroundColor: '#2d2216',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px solid #4a3428',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.3rem' }}>
                  Order Information
                </h3>
                <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                  <strong>Customer:</strong> {selectedOrder.customer.name}
                </p>
                <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                  <strong>Order Time:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                  <strong>Cashier:</strong> {selectedOrder.cashier.name}
                </p>
                <p style={{ color: '#d4af37' }}>
                  <strong>Payment:</strong> {selectedOrder.paymentMethod.replace('_', ' ')}
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
                  Items to Prepare
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
                      <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                        {item.quantity}x {item.menuItem.name}
                      </div>
                      <div style={{ color: '#d4af37', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {item.menuItem.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedOrder(null)}
                  disabled={updatingOrderId === selectedOrder.id}
                  style={{
                    flex: '1 1 100%',
                    padding: '0.75rem',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: updatingOrderId === selectedOrder.id ? 'not-allowed' : 'pointer',
                    opacity: updatingOrderId === selectedOrder.id ? 0.5 : 1
                  }}
                >
                  Close
                </button>

                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'PREPARING')}
                    disabled={updatingOrderId === selectedOrder.id}
                    style={{
                      flex: '1 1 100%',
                      padding: '1rem',
                      backgroundColor: updatingOrderId === selectedOrder.id ? '#666' : '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      cursor: updatingOrderId === selectedOrder.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updatingOrderId === selectedOrder.id ? '⏳ Updating...' : '👨‍🍳 Start Preparing'}
                  </button>
                )}

                {selectedOrder.status === 'PREPARING' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'READY')}
                    disabled={updatingOrderId === selectedOrder.id}
                    style={{
                      flex: '1 1 100%',
                      padding: '1rem',
                      backgroundColor: updatingOrderId === selectedOrder.id ? '#666' : '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      cursor: updatingOrderId === selectedOrder.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updatingOrderId === selectedOrder.id ? '⏳ Updating...' : '✅ Mark as Ready'}
                  </button>
                )}

                {selectedOrder.status === 'READY' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')}
                    disabled={updatingOrderId === selectedOrder.id}
                    style={{
                      flex: '1 1 100%',
                      padding: '1rem',
                      backgroundColor: updatingOrderId === selectedOrder.id ? '#666' : '#9b59b6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      cursor: updatingOrderId === selectedOrder.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updatingOrderId === selectedOrder.id ? '⏳ Updating...' : '🎉 Complete Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChefKitchen;
