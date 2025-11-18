import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';
import { FaEnvelope, FaEnvelopeOpen, FaCheckCircle, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
  branch?: {
    id: number;
    name: string;
    address: string;
  };
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { fetchWithAuth } = useAdminFetch();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/contact');
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      setUpdatingId(id);
      await fetchWithAuth(`/contact/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setSuccess(`Message marked as ${status.toLowerCase()}`);
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setDeletingId(id);
      await fetchWithAuth(`/contact/${id}`, {
        method: 'DELETE'
      });
      setSuccess('Message deleted successfully');
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNREAD': return '#dc3545';
      case 'READ': return '#ffc107';
      case 'RESOLVED': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UNREAD': return <FaEnvelope />;
      case 'READ': return <FaEnvelopeOpen />;
      case 'RESOLVED': return <FaCheckCircle />;
      default: return <FaEnvelope />;
    }
  };

  if (loading) {
    return (
      <AdminPage title="Contact Messages">
        <div className="admin-loading">Loading messages...</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Contact Messages">
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
            All Contact Messages ({messages.length})
          </h2>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#dc3545' }}>● Unread: {messages.filter(m => m.status === 'UNREAD').length}</span>
            <span style={{ color: '#ffc107' }}>● Read: {messages.filter(m => m.status === 'READ').length}</span>
            <span style={{ color: '#28a745' }}>● Resolved: {messages.filter(m => m.status === 'RESOLVED').length}</span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No contact messages</p>
            <p style={{ fontSize: '0.9rem' }}>Messages from customers will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  backgroundColor: 'white',
                  border: `2px solid ${getStatusColor(msg.status)}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        color: getStatusColor(msg.status)
                      }}>
                        {getStatusIcon(msg.status)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
                          {msg.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          {msg.email}
                        </div>
                      </div>
                    </div>
                    
                    {msg.branch && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#6c757d',
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px'
                      }}>
                        <FaMapMarkerAlt style={{ color: '#b3001b' }} />
                        <span><strong>{msg.branch.name}</strong> - {msg.branch.address}</span>
                      </div>
                    )}

                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginTop: '0.5rem'
                    }}>
                      {new Date(msg.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      backgroundColor: getStatusColor(msg.status),
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      {msg.status}
                    </span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  borderLeft: `4px solid ${getStatusColor(msg.status)}`
                }}>
                  <div style={{ 
                    fontSize: '1rem', 
                    color: '#2c3e50',
                    lineHeight: '1.6'
                  }}>
                    {msg.message}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {msg.status === 'UNREAD' && (
                    <button
                      onClick={() => updateStatus(msg.id, 'READ')}
                      disabled={updatingId === msg.id}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#ffc107',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: updatingId === msg.id ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                  {msg.status !== 'RESOLVED' && (
                    <button
                      onClick={() => updateStatus(msg.id, 'RESOLVED')}
                      disabled={updatingId === msg.id}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: updatingId === msg.id ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    disabled={deletingId === msg.id}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deletingId === msg.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FaTrash /> {deletingId === msg.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPage>
  );
};

export default ContactMessages;
