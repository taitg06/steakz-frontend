import React, { useState } from 'react';

const LeaveReview: React.FC = () => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const API_URL = 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          comment: review, 
          rating: Number(rating) 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        setReview('');
        setRating(5);
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err: any) {
      console.error('Review submission error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="leave-review-page">
      <h1>Leave a Review</h1>
      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}
      {submitted ? (
        <div style={{
          padding: '2rem',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          color: '#155724',
          textAlign: 'center'
        }}>
          <h2>✅ Thank you for your feedback!</h2>
          <p>Your review has been submitted successfully.</p>
          <button 
            onClick={() => setSubmitted(false)}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Leave Another Review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="review-form">
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Write your review..."
            required
            rows={5}
          />
          <label>
            Rating:
            <select value={rating} onChange={e => setRating(Number(e.target.value))}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''} {r === 5 ? '- Excellent' : r === 4 ? '- Good' : r === 3 ? '- Average' : r === 2 ? '- Poor' : '- Very Poor'}</option>)}
            </select>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </section>
  );
};

export default LeaveReview;
