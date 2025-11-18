import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';
import { FaStar, FaTrash, FaUser } from 'react-icons/fa';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { fetchWithAuth } = useAdminFetch();
  const currentUserRole = localStorage.getItem('role');
  const canDelete = ['ADMIN', 'HEADQUARTER_MANAGER', 'BRANCH_MANAGER'].includes(currentUserRole || '');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/reviews');
      setReviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setDeletingId(id);
      await fetchWithAuth(`/reviews/${id}`, {
        method: 'DELETE'
      });
      setSuccess('Review deleted successfully');
      fetchReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem', color: '#ffc107' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar key={star} style={{ opacity: star <= rating ? 1 : 0.3 }} />
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Good';
      case 3: return 'Average';
      case 2: return 'Poor';
      case 1: return 'Very Poor';
      default: return '';
    }
  };

  if (loading) {
    return (
      <AdminPage title="Customer Reviews">
        <div className="admin-loading">Loading reviews...</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Customer Reviews">
      {error && <div className="admin-error">{error}</div>}
      {success && (
        <div style={{ 
          padding: '1rem', 
          margin: '1rem 0', 
          backgroundColor: '#d4edda', 
          border: '2px solid #28a745', 
          color: '#155724', 
          borderRadius: '6px', 
          fontWeight: '500' 
        }}>
          {success}
        </div>
      )}

      <div className="admin-section">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>
            All Customer Reviews ({reviews.length})
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
            Average Rating: {reviews.length > 0 
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
              : 'N/A'} ⭐
          </div>
        </div>

        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No reviews yet</p>
            <p style={{ fontSize: '0.9rem' }}>Customer reviews will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#b3001b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#b3001b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem'
                    }}>
                      <FaUser />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
                        {review.user.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        {review.user.email}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      {renderStars(review.rating)}
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#6c757d',
                        marginTop: '0.25rem',
                        fontWeight: '600'
                      }}>
                        {getRatingLabel(review.rating)}
                      </div>
                    </div>
                    
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: deletingId === review.id ? '#999' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: deletingId === review.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (deletingId !== review.id) {
                            e.currentTarget.style.backgroundColor = '#c82333';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingId !== review.id) {
                            e.currentTarget.style.backgroundColor = '#dc3545';
                          }
                        }}
                      >
                        <FaTrash /> {deletingId === review.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '6px',
                  borderLeft: '4px solid #b3001b'
                }}>
                  <div style={{ 
                    fontSize: '1rem', 
                    color: '#2c3e50',
                    lineHeight: '1.6',
                    fontStyle: 'italic'
                  }}>
                    "{review.comment}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPage>
  );
};

export default Reviews;
