import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const API_URL = 'http://localhost:3001/api';

interface AuthProps {
  onLogin?: (user: { name: string; role: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }): JSX.Element => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.currentTarget;

    try {
      if (isLogin) {
        const identifier = (form.elements.namedItem('identifier') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ identifier, password }),
        });

        if (!res.ok) {
          const text = await res.text();
          let message = `HTTP ${res.status}`;
          try {
            const parsed = JSON.parse(text);
            message = parsed.message || JSON.stringify(parsed);
          } catch {
            message = text;
          }
          throw new Error(message);
        }

        let data: any;
        try {
          data = await res.json();
        } catch (parseErr) {
          const text = await res.text();
          throw new Error(`Failed to parse JSON response: ${text}`);
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role || '');
        localStorage.setItem('name', data.user.name || '');
        localStorage.setItem('userId', data.user.id || '');
        
        if (onLogin) {
          onLogin({ name: data.user.name, role: data.user.role });
        }
        
        // Redirect based on role
        window.location.href = (data.user.role === 'ADMIN' || data.user.role === 'BRANCH_MANAGER' || data.user.role === 'HEADQUARTER_MANAGER') ? '/admin' : '/';
      } else {
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        
        const res = await fetch(`${API_URL}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const text = await res.text();
          let message = `HTTP ${res.status}`;
          try {
            const parsed = JSON.parse(text);
            message = parsed.message || JSON.stringify(parsed);
          } catch {
            message = text;
          }
          throw new Error(message);
        }

        const data = await res.json();
        setIsLogin(true);
        setError('Account created! Please log in.');
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{isLogin ? 'Log In' : 'Create account'}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && <input name="name" placeholder="Full name" required />}
          <input name={isLogin ? 'identifier' : 'email'} placeholder={isLogin ? 'Email or username' : 'Email'} required />
          <input name="password" type="password" placeholder="Password" required />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Please wait...' : (isLogin ? 'Log in' : 'Sign up')}</button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              <span>Don't have an account?</span>
              <button onClick={() => setIsLogin(false)}>Create one</button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button onClick={() => setIsLogin(true)}>Log in</button>
            </>
          )}
        </div>

        <div className="seed-creds">
          <h4>Seeded test accounts</h4>
          <ul>
            <li>Admin — admin@seed.local / password123</li>
            <li>Branch Manager — manager@seed.local / password123</li>
            <li>Headquarter Manager — headquarter@seed.local / password123</li>
            <li>Chef — chef@seed.local / password123</li>
            <li>Cashier — cashier@seed.local / password123</li>
            <li>Customer — customer@example.com / password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Auth;