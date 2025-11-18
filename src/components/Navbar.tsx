import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [name, setName] = useState<string | null>(localStorage.getItem('name'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onStorage = () => {
      setRole(localStorage.getItem('role'));
      setName(localStorage.getItem('name'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.querySelector('.navbar');
      if (isMenuOpen && nav && !nav.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setRole(null); 
    setName(null);
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar navbar-saviese">
      {/* Overlay backdrop */}
      {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
      
      <div className="navbar-logo">
        <Link to="/" className="navbar-logo-link" aria-label="Soul Steaks Home" onClick={closeMenu}>
          <Logo />
        </Link>
      </div>

      {/* Hamburger Icon */}
      <button 
        className="navbar-hamburger" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navigation Links */}
      <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        {/* Admin Navigation */}
        {(role === 'ADMIN' || role === 'HEADQUARTER_MANAGER') ? (
          <>
            <li><Link to="/admin" onClick={closeMenu}>Dashboard</Link></li>
            <li><Link to="/admin/users" onClick={closeMenu}>Users</Link></li>
            <li><Link to="/admin/menu" onClick={closeMenu}>Menu</Link></li>
            <li><Link to="/admin/branches" onClick={closeMenu}>Branches</Link></li>
            <li><Link to="/admin/reports" onClick={closeMenu}>Reports</Link></li>
          </>
        ) : role === 'BRANCH_MANAGER' ? (
          <>
            <li><Link to="/admin" onClick={closeMenu}>Dashboard</Link></li>
            <li><Link to="/admin/staff" onClick={closeMenu}>Staff</Link></li>
            <li><Link to="/admin/menu" onClick={closeMenu}>Menu</Link></li>
            <li><Link to="/admin/inventory" onClick={closeMenu}>Inventory</Link></li>
            <li><Link to="/admin/reports" onClick={closeMenu}>Reports</Link></li>
          </>
        ) : (role === 'CHEF' || role === 'CASHIER') ? (
          <>
            <li><Link to="/admin" onClick={closeMenu}>Dashboard</Link></li>
            <li><Link to="/admin/menu" onClick={closeMenu}>Menu</Link></li>
            <li><Link to="/admin/inventory" onClick={closeMenu}>Inventory</Link></li>
            {role === 'CASHIER' && <li><Link to="/admin/checkout" onClick={closeMenu}>Checkout</Link></li>}
          </>
        ) : (
          /* Regular Navigation */
          <>
            <li><Link to="/" onClick={closeMenu}>Home</Link></li>
            <li><Link to="/menu" onClick={closeMenu}>Menu</Link></li>
            <li><Link to="/about" onClick={closeMenu}>About</Link></li>
            <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
            {role === 'CUSTOMER' && (
              <>
                <li><Link to="/my-orders" onClick={closeMenu}>My Orders</Link></li>
                <li><Link to="/account" onClick={closeMenu}>Account</Link></li>
              </>
            )}
          </>
        )}
        
        {/* Mobile User Info */}
        <li className="navbar-mobile-user">
          {!role ? (
            <Link to="/auth" className="navbar-login-mobile" onClick={closeMenu}>Login</Link>
          ) : (
            <div className="navbar-user-mobile">
              <span className="navbar-username-mobile">Hi, {name ?? 'User'}</span>
              <button onClick={logout} className="navbar-logout-mobile">Logout</button>
            </div>
          )}
        </li>
      </ul>

      {/* Desktop User Info */}
      <div className="navbar-right">
        <div style={{ marginLeft: 12 }}>
          {!role ? (
            <Link to="/auth" className="navbar-login">Login</Link>
          ) : (
            <>
              <span style={{ marginRight: 10 }}>Hi, {name ?? 'User'}</span>
              {role !== 'ADMIN' && role !== 'BRANCH_MANAGER' && role !== 'HEADQUARTER_MANAGER' && (
                <button onClick={logout} className="navbar-login">Logout</button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
