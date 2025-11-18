import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

interface AdminPageProps {
  children: React.ReactNode;
  title: string;
}

export const AdminPage: React.FC<AdminPageProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    const allowedRoles = ['ADMIN', 'BRANCH_MANAGER', 'HEADQUARTER_MANAGER', 'CHEF', 'CASHIER'];
    if (!role || !allowedRoles.includes(role)) {
      navigate('/');
    }
  }, [navigate, role]);

  const allowedRoles = ['ADMIN', 'BRANCH_MANAGER', 'HEADQUARTER_MANAGER', 'CHEF', 'CASHIER'];
  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return (
    <div className="admin-page">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#2c3e50', borderBottom: '3px solid #ffd700', paddingBottom: '1rem' }}>{title}</h1>
      {children}
    </div>
  );
};

export const useAdminFetch = () => {
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const API_URL = 'http://localhost:3001/api';
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeader(),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      let message = `HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || JSON.stringify(parsed);
      } catch {
        message = text;
      }
      throw new Error(message);
    }

    try {
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error('Failed to parse JSON response');
    }
  };

  return { fetchWithAuth };
};