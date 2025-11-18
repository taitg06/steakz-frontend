import React, { useState, useEffect } from 'react';
import './Contact.css';

const API_URL = 'http://localhost:3001/api';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

const Contact: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    branchId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_URL}/branches/public`);
      const data = await response.json();
      console.log('Branches fetched:', data);
      setBranches(Array.isArray(data) ? data : data.branches || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          branchId: formData.branchId || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '', branchId: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-page">
      <h1 className="contact-title">Contact Soul Steaks</h1>
      <div className="contact-content">
        <div className="contact-info">
          <h2>Reservations & Inquiries</h2>
          <p><strong>Phone:</strong> <a href="tel:+1234567890">+1 (234) 567-890</a></p>
          <p><strong>Email:</strong> <a href="mailto:info@soulsteaks.com">info@soulsteaks.com</a></p>
          <p><strong>Address:</strong> 123 Soul St, Food City</p>
          <p><strong>Hours:</strong> Mon-Sun, 12:00pm – 11:00pm</p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Us a Message</h2>
          
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              backgroundColor: '#fee', 
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              backgroundColor: '#d4edda', 
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              color: '#155724'
            }}>
              ✅ Message sent successfully! We'll get back to you soon.
            </div>
          )}

          <input 
            type="text" 
            name="name" 
            placeholder="Your Name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Your Email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          
          <select 
            name="branchId"
            value={formData.branchId}
            onChange={handleChange}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          >
            <option value="">Select a Branch (Optional)</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name} - {branch.address}
              </option>
            ))}
          </select>

          <textarea 
            name="message" 
            placeholder="Your Message" 
            rows={5} 
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
