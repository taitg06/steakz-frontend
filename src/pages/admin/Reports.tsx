import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';
import { FaChartBar } from 'react-icons/fa';

interface ReportData {
  dailyRevenue: number;
  monthlyRevenue: number;
  topItems: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  customerCount: {
    daily: number;
    monthly: number;
  };
}

const Reports: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchWithAuth } = useAdminFetch();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await fetchWithAuth('/reports');
      setData(response);
    } catch (err: any) {
      // If reports endpoint doesn't exist yet, use placeholder data
      setData({
        dailyRevenue: 0,
        monthlyRevenue: 0,
        topItems: [],
        customerCount: {
          daily: 0,
          monthly: 0
        }
      });
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetchWithAuth('/reports/download');
      
      // Create a blob from the response
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download report: ' + err.message);
    }
  };

  const handleViewAnalytics = () => {
    // Navigate to detailed analytics view
    window.location.href = '/admin/analytics';
  };

  if (loading) {
    return (
      <AdminPage title="Reports">
        <div className="admin-loading">Loading reports...</div>
      </AdminPage>
    );
  }

  if (!data) {
    return (
      <AdminPage title="Reports">
        <div className="admin-error">{error || 'Failed to load report data'}</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Reports">
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-grid">
        <div className="admin-card" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Daily Revenue</h3>
          <p className="stat-number" style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>${data.dailyRevenue.toFixed(2)}</p>
        </div>
        <div className="admin-card" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Monthly Revenue</h3>
          <p className="stat-number" style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>${data.monthlyRevenue.toFixed(2)}</p>
        </div>
        <div className="admin-card" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Daily Customers</h3>
          <p className="stat-number" style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>{data.customerCount.daily}</p>
        </div>
        <div className="admin-card" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Monthly Customers</h3>
          <p className="stat-number" style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>{data.customerCount.monthly}</p>
        </div>
      </div>

      <section className="admin-section">
        <h2>Top Selling Items</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.topItems.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.count}</td>
                <td>${item.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h2>Actions</h2>
        <div className="admin-actions">
          <button 
            className="admin-btn admin-btn-primary"
            onClick={handleDownloadReport}
            style={{ backgroundColor: '#e74c3c', border: 'none', color: 'white' }}
          >
            Download Monthly Report
          </button>
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={handleViewAnalytics}
            style={{ backgroundColor: '#3498db', border: 'none', color: 'white' }}
          >
            View Detailed Analytics
          </button>
        </div>
      </section>
    </AdminPage>
  );
};

export default Reports;