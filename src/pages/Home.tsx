import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import MenuHighlights from '../components/MenuHighlights';

type Role = 'CUSTOMER' | 'ADMIN' | 'BRANCH_MANAGER' | 'CASHIER' | 'HEADQUARTER_MANAGER' | 'CHEF';

const API_URL = 'http://localhost:3001/api'; // backend URL

interface User {
  name: string;
  role: Role;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [role, setRole] = useState<Role | null>(localStorage.getItem('role') as Role | null);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Redirect staff roles to their dashboards
  React.useEffect(() => {
    if (role === 'ADMIN' || role === 'HEADQUARTER_MANAGER' || role === 'BRANCH_MANAGER' || role === 'CHEF' || role === 'CASHIER') {
      navigate('/admin');
    }
  }, [role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    const form = e.currentTarget;
    const identifier = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      // backend returns { token, user }
      if (res.ok && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('name', data.user.name);
        localStorage.setItem('userId', data.user.id);
        setRole(data.user.role);
        setShowLogin(false);
        // Redirect staff to admin dashboard
        if (['ADMIN', 'HEADQUARTER_MANAGER', 'BRANCH_MANAGER', 'CHEF', 'CASHIER'].includes(data.user.role)) {
          navigate('/admin');
        }
      } else setLoginError(data.message || 'Login failed');
    } catch (err) { setLoginError('Network error'); }
    setLoading(false);
  };

  const [user, setUser] = useState<User | null>(null);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to submit a review');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ review, rating: reviewRating })
      });
      if (res.ok) {
        setReviewSubmitted(true);
        setReview('');
        setReviewRating(5);
        setTimeout(() => setReviewSubmitted(false), 3000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSignupError('');
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    try {
      const res = await fetch(`${API_URL}/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      if (res.ok) { setShowSignup(false); setShowLogin(true); }
      else {
        const data = await res.json().catch(() => ({}));
        setSignupError(data.message || 'Signup failed');
      }
    } catch (err: any) { setSignupError('Network error: ' + (err?.message || err)); }
    setLoading(false);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <img 
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&q=80" 
            alt="Premium Steak" 
            className="hero-image"
          />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Soul Steaks</h1>
          <p className="hero-subtitle">Where Premium Meets Perfection</p>
          <p className="hero-description">
            Experience the finest hand-selected steaks, grilled to perfection
          </p>
          <div className="hero-buttons">
            <button className="hero-btn primary" onClick={() => navigate('/reserve')}>
              Reserve Your Table
            </button>
            <button className="hero-btn secondary" onClick={() => navigate('/menu')}>
              Explore Menu
            </button>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="featured-menu-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Our Signature Selection</h2>
            <p className="section-subtitle">Hand-selected steaks grilled to perfection</p>
          </div>
          <MenuHighlights />
          <button className="view-full-menu-btn" onClick={() => navigate('/menu')}>
            View Full Menu
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose Soul Steaks</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🥩</div>
              <h3 className="feature-title">Premium Quality</h3>
              <p className="feature-text">
                Only the finest cuts of aged beef, sourced from trusted farms
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h3 className="feature-title">Expert Chefs</h3>
              <p className="feature-text">
                Culinary masters with decades of fine dining experience
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Elegant Ambiance</h3>
              <p className="feature-text">
                Sophisticated atmosphere perfect for any special occasion
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🍷</div>
              <h3 className="feature-title">Fine Wines</h3>
              <p className="feature-text">
                Curated wine selection to complement your perfect meal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="section-container">
          <h2 className="section-title">A Taste of Excellence</h2>
          <div className="image-gallery">
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80" 
                alt="Grilled Steak"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80" 
                alt="Restaurant Interior"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=600&q=80" 
                alt="Wine Selection"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80" 
                alt="Fine Dining"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="info-cards-section">
        <div className="section-container">
          <div className="info-cards-grid">
            {/* Hours Card */}
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-icon">🕐</div>
                <h3>Opening Hours</h3>
              </div>
              <div className="info-card-body">
                <div className="hours-item">
                  <span className="day">Monday - Friday</span>
                  <span className="time">12:00 PM - 11:00 PM</span>
                </div>
                <div className="hours-item">
                  <span className="day">Saturday</span>
                  <span className="time">1:00 PM - 11:30 PM</span>
                </div>
                <div className="hours-item">
                  <span className="day">Sunday</span>
                  <span className="time">Closed</span>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-icon">📞</div>
                <h3>Get In Touch</h3>
              </div>
              <div className="info-card-body">
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <span className="contact-value">(555) 123-4567</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">info@soulsteaks.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Address:</span>
                  <span className="contact-value">123 Main Street, Food City</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section className="review-section">
        <div className="section-container">
          <div className="review-container">
            <h2 className="section-title">Share Your Experience</h2>
            <p className="review-subtitle">
              We'd love to hear about your dining experience at Soul Steaks
            </p>
            
            {reviewSubmitted ? (
              <div className="review-success">
                <div className="success-icon">✓</div>
                <h3>Thank You!</h3>
                <p>Your review has been submitted successfully</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="form-group">
                  <label>Your Review</label>
                  <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder="Tell us about your experience..."
                    required
                    rows={5}
                  />
                </div>
                
                <div className="form-group">
                  <label>Rating</label>
                  <select 
                    value={reviewRating} 
                    onChange={e => setReviewRating(Number(e.target.value))}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                    <option value={4}>⭐⭐⭐⭐ Very Good</option>
                    <option value={3}>⭐⭐⭐ Good</option>
                    <option value={2}>⭐⭐ Fair</option>
                    <option value={1}>⭐ Poor</option>
                  </select>
                </div>
                
                <button type="submit" className="submit-review-btn">
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {showLogin && (
        <div className="modal-bg" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Log In</h2>
            <form className="auth-form" onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
            </form>
            {loginError && <p className="form-error">{loginError}</p>}
            <p>Don't have an account? <span className="modal-link" onClick={() => { setShowLogin(false); setShowSignup(true); }}>Sign Up</span></p>
          </div>
        </div>
      )}

      {showSignup && (
        <div className="modal-bg" onClick={() => setShowSignup(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Sign Up</h2>
            <form className="auth-form" onSubmit={handleSignup}>
              <input type="text" name="name" placeholder="Name" required />
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
            </form>
            {signupError && <p className="form-error">{signupError}</p>}
            <p>Already have an account? <span className="modal-link" onClick={() => { setShowSignup(false); setShowLogin(true); }}>Log In</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
