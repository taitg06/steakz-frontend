import React, { useState, useEffect } from 'react';
import './Menu.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  branchId: number;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchMenuItems();
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/branches/public');
      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }
      const data = await response.json();
      setBranches(data);
      if (data.length > 0) {
        setSelectedBranch(data[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const url = selectedBranch 
        ? `http://localhost:3001/api/menu/branch/${selectedBranch}`
        : 'http://localhost:3001/api/menu';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.menuItemId === parseInt(item.id));
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menuItemId === parseInt(item.id)
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        menuItemId: parseInt(item.id),
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }
    setShowCart(true);
  };

  const updateCartQuantity = (menuItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.menuItemId !== menuItemId));
    } else {
      setCart(cart.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (menuItemId: number) => {
    setCart(cart.filter(item => item.menuItemId !== menuItemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to place an order');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!selectedBranch) {
      alert('Please select a branch');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setOrderLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/orders/customer-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          branchId: selectedBranch,
          paymentMethod
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPendingOrder(data.order);
        setCart([]);
        setShowCart(false);
        setShowPaymentConfirmation(true);
        // Refresh menu to update quantities
        fetchMenuItems();
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (err) {
      alert('Network error. Please try again.');
      console.error('Order error:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!pendingOrder) return;

    const token = localStorage.getItem('token');
    setConfirmingPayment(true);

    try {
      const response = await fetch(`http://localhost:3001/api/orders/confirm-payment/${pendingOrder.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setOrderSuccess(true);
        setShowPaymentConfirmation(false);
        setPendingOrder(null);
        setTimeout(() => setOrderSuccess(false), 5000);
      } else {
        alert(data.message || 'Failed to confirm payment');
      }
    } catch (err) {
      alert('Network error. Please try again.');
      console.error('Payment confirmation error:', err);
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (loading) {
    return (
      <section style={{ 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%)',
        padding: '4rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#ffd700' }}>Loading our premium menu...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%)',
        padding: '4rem 2rem'
      }}>
        <div style={{ 
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#2c1810',
          padding: '2rem',
          borderRadius: '12px',
          border: '2px solid #b3001b',
          textAlign: 'center',
          color: '#ffd700'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '1rem' }}>Unable to Load Menu</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ 
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%)',
      padding: '4rem 2rem',
      position: 'relative'
    }}>
      {/* Success Message */}
      {orderSuccess && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          backgroundColor: '#27ae60',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontWeight: 'bold'
        }}>
          ✓ Payment confirmed! Order sent to cashier for processing.
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && pendingOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1a1208',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            border: '3px solid #4a3428',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ 
              color: '#ffd700', 
              marginBottom: '1.5rem',
              fontSize: '2rem',
              textAlign: 'center',
              borderBottom: '2px solid #4a3428',
              paddingBottom: '1rem'
            }}>
              🔐 Payment Confirmation
            </h2>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                backgroundColor: '#2d2216',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px solid #4a3428',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.3rem' }}>Order Summary</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                    <strong>Order ID:</strong> #{pendingOrder.id}
                  </p>
                  <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                    <strong>Branch:</strong> {pendingOrder.branch.name}
                  </p>
                  <p style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                    <strong>Address:</strong> {pendingOrder.branch.address}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #4a3428', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h4 style={{ color: '#ffd700', marginBottom: '0.75rem' }}>Items:</h4>
                  {pendingOrder.items.map((item: any, index: number) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      color: '#d4af37',
                      marginBottom: '0.5rem'
                    }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  borderTop: '2px solid #4a3428',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      Payment Method:
                    </span>
                    <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {pendingOrder.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#ffd700', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      Total Amount:
                    </span>
                    <span style={{ color: '#ffd700', fontSize: '1.8rem', fontWeight: 'bold' }}>
                      ${pendingOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#2d2216',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #4a3428',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#ffd700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  ⚠️ Please confirm your payment to complete the order
                </p>
                <p style={{ color: '#d4af37', fontSize: '0.95rem' }}>
                  Status: <strong style={{ color: '#ff6b6b' }}>PENDING PAYMENT</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowPaymentConfirmation(false);
                  setPendingOrder(null);
                }}
                disabled={confirmingPayment}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: confirmingPayment ? 'not-allowed' : 'pointer',
                  opacity: confirmingPayment ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={confirmingPayment}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: confirmingPayment ? '#666' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: confirmingPayment ? 'not-allowed' : 'pointer'
                }}
              >
                {confirmingPayment ? '⏳ Confirming...' : '✓ Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Button (Floating) */}
      {role === 'CUSTOMER' && cart.length > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            backgroundColor: '#b3001b',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(179, 0, 27, 0.5)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🛒
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ffd700',
            color: '#1a1a1a',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {cart.length}
          </span>
        </button>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}
        onClick={() => setShowCart(false)}
        >
          <div style={{
            backgroundColor: '#2c1810',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '2px solid #ffd700'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#ffd700', margin: 0, fontSize: '2rem' }}>Your Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffd700',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Selected Branch Info */}
            {selectedBranch && branches.find(b => b.id === selectedBranch) && (
              <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                border: '2px solid #b3001b'
              }}>
                <div style={{ color: '#ffd700', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  📍 Order from: {branches.find(b => b.id === selectedBranch)?.name}
                </div>
                <div style={{ color: '#d4af37', fontSize: '0.9rem' }}>
                  {branches.find(b => b.id === selectedBranch)?.address}
                </div>
              </div>
            )}

            {cart.length === 0 ? (
              <p style={{ color: '#d4af37', textAlign: 'center', padding: '2rem' }}>Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.menuItemId} style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    border: '1px solid #4a3428'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ color: '#ffd700', margin: 0, fontSize: '1.2rem' }}>{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b3001b',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => updateCartQuantity(item.menuItemId, item.quantity - 1)}
                          style={{
                            backgroundColor: '#4a3428',
                            color: '#ffd700',
                            border: 'none',
                            borderRadius: '4px',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          -
                        </button>
                        <span style={{ color: '#d4af37', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.menuItemId, item.quantity + 1)}
                          style={{
                            backgroundColor: '#4a3428',
                            color: '#ffd700',
                            border: 'none',
                            borderRadius: '4px',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <div style={{
                  borderTop: '2px solid #4a3428',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      color: '#d4af37', 
                      fontSize: '1.1rem', 
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Payment Method:
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2216',
                        color: '#ffd700',
                        border: '2px solid #4a3428',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="CASH">Cash on Delivery</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="ONLINE_PAYMENT">Online Payment</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ color: '#ffd700', fontSize: '1.5rem', fontWeight: 'bold' }}>Total:</span>
                    <span style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>
                      ${getTotalAmount().toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={orderLoading}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: orderLoading ? '#666' : '#b3001b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      cursor: orderLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {orderLoading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '3rem',
        color: '#ffd700'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem',
          marginBottom: '0.5rem',
          fontFamily: 'Playfair Display, serif',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '2px'
        }}>
          Our Premium Menu
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          color: '#d4af37',
          fontStyle: 'italic'
        }}>
          Hand-selected steaks grilled to perfection
        </p>
        <div style={{
          width: '100px',
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #b3001b, transparent)',
          margin: '1rem auto'
        }}></div>

        {/* Branch Selector */}
        {branches.length > 0 && (
          <div style={{
            maxWidth: '500px',
            margin: '2rem auto 0',
            padding: '1.5rem',
            backgroundColor: '#2c1810',
            borderRadius: '12px',
            border: '2px solid #4a3428'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#ffd700'
            }}>
              📍 Select Branch
            </label>
            <select
              value={selectedBranch || ''}
              onChange={(e) => {
                setSelectedBranch(parseInt(e.target.value));
                setCart([]); // Clear cart when changing branches
              }}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                backgroundColor: '#1a1a1a',
                color: '#ffd700',
                border: '2px solid #b3001b',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.address}
                </option>
              ))}
            </select>
            <p style={{
              fontSize: '0.9rem',
              color: '#d4af37',
              marginTop: '0.75rem',
              marginBottom: 0
            }}>
              💡 Menu items and availability are specific to selected branch
            </p>
          </div>
        )}
      </div>

      {/* Menu Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem'
      }}>
        {menuItems.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem',
            color: '#ffd700'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
            <p style={{ fontSize: '1.2rem' }}>No menu items available at the moment.</p>
          </div>
        ) : (
          menuItems.map((item) => (
            <div 
              key={item.id} 
              style={{
                background: 'linear-gradient(145deg, #2c1810 0%, #1a1a1a 100%)',
                borderRadius: '16px',
                padding: '2rem',
                border: '2px solid #4a3428',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = '#b3001b';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(179, 0, 27, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#4a3428';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
              }}
            >
              {/* Decorative corner accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, transparent 50%, #b3001b 50%)',
                opacity: 0.2
              }}></div>

              {/* Item Name */}
              <h2 style={{ 
                fontSize: '1.8rem',
                marginBottom: '1rem',
                color: '#ffd700',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700
              }}>
                {item.name}
              </h2>

              {/* Divider */}
              <div style={{
                width: '50px',
                height: '2px',
                backgroundColor: '#b3001b',
                marginBottom: '1rem'
              }}></div>

              {/* Description */}
              <p style={{ 
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#d4af37',
                marginBottom: '1.5rem',
                minHeight: '60px'
              }}>
                {item.description}
              </p>

              {/* Price and Availability */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #4a3428',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#ffd700',
                  fontFamily: 'Georgia, serif'
                }}>
                  ${item.price.toFixed(2)}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: item.quantity > 0 ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                  borderRadius: '20px',
                  border: `1px solid ${item.quantity > 0 ? '#27ae60' : '#e74c3c'}`
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: item.quantity > 0 ? '#27ae60' : '#e74c3c'
                  }}></div>
                  <span style={{ 
                    fontSize: '0.9rem',
                    color: item.quantity > 0 ? '#27ae60' : '#e74c3c',
                    fontWeight: 600
                  }}>
                    {item.quantity > 0 ? 'Available' : 'Sold Out'}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button - Only for customers */}
              {role === 'CUSTOMER' && (
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.quantity === 0}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: item.quantity === 0 ? '#666' : '#b3001b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: item.quantity === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    if (item.quantity > 0) {
                      e.currentTarget.style.backgroundColor = '#8b0015';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (item.quantity > 0) {
                      e.currentTarget.style.backgroundColor = '#b3001b';
                    }
                  }}
                >
                  {item.quantity === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Note */}
      <div style={{
        marginTop: '4rem',
        textAlign: 'center',
        color: '#d4af37',
        fontSize: '0.95rem',
        fontStyle: 'italic'
      }}>
        <p>All steaks are served with your choice of two sides</p>
        <p style={{ marginTop: '0.5rem' }}>
          Wine pairing recommendations available upon request
        </p>
      </div>
    </section>
  );
};

export default Menu;
