import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, NavLink } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Reserve from './pages/Reserve';
import Auth from './pages/Auth';
import { Dashboard as AdminDashboard, Users as AdminUsers, Branches as AdminBranches, Reports as AdminReports, Inventory, Staff, Analytics, Checkout, Reservations } from './pages/admin';
import MenuManagement from './pages/admin/MenuManagement';
import Reviews from './pages/admin/Reviews';
import ContactMessages from './pages/admin/ContactMessages';
import ManageAccount from './pages/ManageAccount';
import MyOrders from './pages/MyOrders';
import CashierPOS from './pages/CashierPOS';
import ChefKitchen from './pages/ChefKitchen';
import './App.css';
import './pages/admin/AdminStyles.css';

const RootLayout: React.FC = () => (
  <div className="app-root">
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AdminLayout: React.FC = () => {
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const name = typeof window !== 'undefined' ? localStorage.getItem('name') : null;
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  const isStaff = role === 'CHEF' || role === 'CASHIER';
  const isBranchManager = role === 'BRANCH_MANAGER';
  const isHQOrAdmin = role === 'ADMIN' || role === 'HEADQUARTER_MANAGER';
  const isCashier = role === 'CASHIER';
  const isChef = role === 'CHEF';

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <ul>
          <li><NavLink to="/admin" end>Dashboard</NavLink></li>
          {isHQOrAdmin && (
            <li><NavLink to="/admin/users">Users</NavLink></li>
          )}
          {isBranchManager && (
            <li><NavLink to="/admin/staff">Branch Staff</NavLink></li>
          )}
          <li><NavLink to="/admin/menu">Menu</NavLink></li>
          {(isBranchManager || isStaff) && (
            <li><NavLink to="/admin/inventory">Inventory</NavLink></li>
          )}
          {isCashier && (
            <>
              <li><NavLink to="/admin/pos">POS System</NavLink></li>
              <li><NavLink to="/admin/checkout">Walk-in Checkout</NavLink></li>
            </>
          )}
          {(isChef || isBranchManager) && (
            <li><NavLink to="/admin/kitchen">Kitchen Display</NavLink></li>
          )}
          {isHQOrAdmin && (
            <li><NavLink to="/admin/branches">Branches</NavLink></li>
          )}
          {!isChef && (
            <li><NavLink to="/admin/reservations">Reservations</NavLink></li>
          )}
          <li><NavLink to="/admin/reviews">Reviews</NavLink></li>
          {(isHQOrAdmin || isBranchManager) && (
            <li><NavLink to="/admin/contact-messages">Contact Messages</NavLink></li>
          )}
          {!isStaff && (
            <li><NavLink to="/admin/reports">Reports</NavLink></li>
          )}
        </ul>
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ffd700' }}>{role}</p>
          <p style={{ marginBottom: '0.5rem' }}>Hi, {name ?? 'User'}</p>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.5rem', cursor: 'pointer', backgroundColor: '#b3001b', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
        </div>
      </nav>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: '/auth', element: <Auth /> },
        { path: '/menu', element: <Menu /> },
        { path: '/about', element: <About /> },
        { path: '/contact', element: <Contact /> },
        { path: '/reserve', element: <Reserve /> },
        { path: '/account', element: <ManageAccount /> },
        ...(role === 'CUSTOMER' ? [
          { path: '/reservations', element: <Reservations /> },
          { path: '/my-orders', element: <MyOrders /> }
        ] : []),
      ],
    },
    {
      path: '/admin',
      element: (role === 'ADMIN' || role === 'BRANCH_MANAGER' || role === 'HEADQUARTER_MANAGER' || role === 'CHEF' || role === 'CASHIER') ? <AdminLayout /> : <Auth />,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: 'users', element: <AdminUsers /> },
        { path: 'staff', element: <Staff /> },
        { path: 'menu', element: <MenuManagement /> },
        { path: 'inventory', element: <Inventory /> },
        { path: 'pos', element: <CashierPOS /> },
        { path: 'kitchen', element: <ChefKitchen /> },
        { path: 'checkout', element: <Checkout /> },
        { path: 'branches', element: <AdminBranches /> },
        { path: 'reservations', element: <Reservations /> },
        { path: 'reviews', element: <Reviews /> },
        { path: 'contact-messages', element: <ContactMessages /> },
        { path: 'reports', element: <AdminReports /> },
        { path: 'analytics', element: <Analytics /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
