import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';
import { FaShoppingCart, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

const Checkout: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerName, setCustomerName] = useState('');
  const { fetchWithAuth } = useAdminFetch();
  
  // Check if user is cashier
  const currentUserRole = localStorage.getItem('role');
  const isCashier = currentUserRole === 'CASHIER';

  // Restrict access to cashiers only
  if (!isCashier) {
    return (
      <AdminPage title="Walk-in Checkout">
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          background: 'rgba(179, 0, 27, 0.1)',
          borderRadius: '8px',
          border: '2px solid #b3001b'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#b3001b' }}>Access Denied</h2>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Walk-in Checkout is only accessible to Cashiers.</p>
        </div>
      </AdminPage>
    );
  }

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/menu');
      setMenuItems(Array.isArray(data) ? data : data.menuItems || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItemId === item.id);
    if (existing) {
      setCart(cart.map(c => 
        c.menuItemId === item.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (menuItemId: number, delta: number) => {
    setCart(cart.map(c => 
      c.menuItemId === menuItemId 
        ? { ...c, quantity: Math.max(1, c.quantity + delta) }
        : c
    ));
  };

  const removeFromCart = (menuItemId: number) => {
    setCart(cart.filter(c => c.menuItemId !== menuItemId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await fetchWithAuth('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          customerName: customerName || 'Walk-in Customer',
          items: cart
        })
      });
      setSuccess(`Order completed! Total: $${calculateTotal().toFixed(2)}`);
      setCart([]);
      setCustomerName('');
      fetchMenuItems(); // Refresh inventory
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage title="Cashier - Checkout">
      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success" style={{ backgroundColor: '#27ae60', color: 'white', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Menu Items */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Menu Items</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {menuItems.map(item => (
              <div 
                key={item.id}
                style={{
                  backgroundColor: '#2c3e50',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onClick={() => addToCart(item)}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <h3 style={{ marginBottom: '0.5rem', color: '#ffd700' }}>{item.name}</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#bdc3c7' }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#27ae60' }}>${item.price.toFixed(2)}</span>
                  <span style={{ fontSize: '0.9rem', color: item.quantity < 10 ? '#e74c3c' : '#95a5a6' }}>
                    Stock: {item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
          <div style={{ backgroundColor: '#34495e', color: 'white', padding: '1.5rem', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaShoppingCart /> Cart
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>

            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#95a5a6', padding: '2rem 0' }}>
                Cart is empty
              </p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div 
                      key={item.menuItemId}
                      style={{
                        backgroundColor: '#2c3e50',
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        borderRadius: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                        <button
                          onClick={() => removeFromCart(item.menuItemId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                            style={{
                              backgroundColor: '#e74c3c',
                              border: 'none',
                              color: 'white',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <FaMinus />
                          </button>
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                            style={{
                              backgroundColor: '#27ae60',
                              border: 'none',
                              color: 'white',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <FaPlus />
                          </button>
                        </div>
                        <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid #ffd700', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    <span>Total:</span>
                    <span style={{ color: '#27ae60' }}>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: loading ? '#95a5a6' : '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Processing...' : 'Complete Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminPage>
  );
};

export default Checkout;
