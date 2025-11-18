import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';
import { FaChartLine, FaUsers, FaShoppingCart, FaDollarSign } from 'react-icons/fa';

interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

interface TopItem {
  name: string;
  estimatedSales: number;
  currentStock: number;
}

interface AnalyticsData {
  period: {
    start: string;
    end: string;
  };
  sales: {
    daily: DailySale[];
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  customers: {
    total: number;
    withReviews: number;
    retentionRate: number;
  };
  performance: {
    averageRating: number;
    totalReviews: number;
    revenueGrowth: number;
    topSellingItems: TopItem[];
  };
  inventory: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
  };
  branches: {
    total: number;
    filteredByBranch: boolean;
  };
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchWithAuth } = useAdminFetch();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/reports/analytics');
      setData(response);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminPage title="Detailed Analytics">
        <div className="admin-loading">Loading analytics...</div>
      </AdminPage>
    );
  }

  if (!data) {
    return (
      <AdminPage title="Detailed Analytics">
        <div className="admin-error">{error || 'Failed to load analytics'}</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Detailed Analytics">
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-grid">
        <div className="admin-card" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
          <FaDollarSign size={24} style={{ marginBottom: '1rem', color: '#ffd700' }} />
          <h3 style={{ color: 'white' }}>Total Revenue</h3>
          <p className="stat-number" style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>
            ${data.sales.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p style={{ color: '#95a5a6', marginTop: '0.5rem' }}>
            {data.performance.revenueGrowth >= 0 ? '+' : ''}{data.performance.revenueGrowth.toFixed(1)}% from last week
          </p>
        </div>

        <div className="admin-card" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
          <FaShoppingCart size={24} style={{ marginBottom: '1rem', color: '#ffd700' }} />
          <h3 style={{ color: 'white' }}>Average Order Value</h3>
          <p className="stat-number" style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>
            ${data.sales.avgOrderValue.toFixed(2)}
          </p>
          <p style={{ color: '#95a5a6', marginTop: '0.5rem' }}>
            {data.sales.totalOrders} total orders
          </p>
        </div>

        <div className="admin-card" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
          <FaUsers size={24} style={{ marginBottom: '1rem', color: '#ffd700' }} />
          <h3 style={{ color: 'white' }}>Total Customers</h3>
          <p className="stat-number" style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>
            {data.customers.total}
          </p>
          <p style={{ color: '#95a5a6', marginTop: '0.5rem' }}>
            {data.customers.withReviews} with reviews
          </p>
        </div>

        <div className="admin-card" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
          <FaChartLine size={24} style={{ marginBottom: '1rem', color: '#ffd700' }} />
          <h3 style={{ color: 'white' }}>Average Rating</h3>
          <p className="stat-number" style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>
            {data.performance.averageRating.toFixed(1)} ⭐
          </p>
          <p style={{ color: '#95a5a6', marginTop: '0.5rem' }}>
            {data.performance.totalReviews} reviews
          </p>
        </div>
      </div>

      <section className="admin-section">
        <h2>Sales Trends (Last 30 Days)</h2>
        <div style={{ backgroundColor: '#2c3e50', padding: '2rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>Daily Revenue</h3>
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'flex-end', height: '200px' }}>
            {data.sales.daily.slice(-30).map((day, index) => {
              const maxRevenue = Math.max(...data.sales.daily.map(d => d.revenue));
              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    backgroundColor: '#ffd700',
                    height: `${(day.revenue / maxRevenue) * 100}%`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '0.5rem',
                    borderRadius: '4px 4px 0 0',
                    minWidth: '10px'
                  }}
                  title={`${day.date}: $${day.revenue.toFixed(0)} (${day.orders} orders)`}
                >
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1rem', color: '#95a5a6', textAlign: 'center' }}>
            {data.period.start} to {data.period.end}
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2>Top Selling Items</h2>
        <div style={{ backgroundColor: '#2c3e50', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          {data.performance.topSellingItems.map((item, index) => (
            <div 
              key={index}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                marginBottom: '0.5rem',
                backgroundColor: '#34495e',
                borderRadius: '4px',
                color: 'white'
              }}
            >
              <div>
                <span style={{ fontWeight: 'bold' }}>{index + 1}. {item.name}</span>
                <div style={{ fontSize: '0.9rem', color: '#95a5a6', marginTop: '0.3rem' }}>
                  Stock: {item.currentStock} units
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#ffd700', fontWeight: 'bold' }}>
                  ${item.estimatedSales.toFixed(0)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#95a5a6' }}>
                  Estimated sales
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Customer Insights</h2>
        <div className="admin-grid">
          <div className="admin-card" style={{ backgroundColor: '#27ae60', color: 'white' }}>
            <h3>Customer Retention</h3>
            <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {data.customers.retentionRate.toFixed(1)}%
            </p>
            <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>
              {data.customers.withReviews} customers with reviews
            </p>
          </div>
          <div className="admin-card" style={{ backgroundColor: '#3498db', color: 'white' }}>
            <h3>Inventory Status</h3>
            <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {data.inventory.totalItems}
            </p>
            <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>
              {data.inventory.lowStockItems} items low on stock
            </p>
          </div>
          <div className="admin-card" style={{ backgroundColor: '#e67e22', color: 'white' }}>
            <h3>Inventory Value</h3>
            <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              ${data.inventory.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>
              Total stock value
            </p>
          </div>
          {!data.branches.filteredByBranch && (
            <div className="admin-card" style={{ backgroundColor: '#9b59b6', color: 'white' }}>
              <h3>Total Branches</h3>
              <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {data.branches.total}
              </p>
              <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>
                Active locations
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-actions">
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={() => window.location.href = '/admin/reports'}
          >
            Back to Reports
          </button>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => window.print()}
            style={{ backgroundColor: '#27ae60' }}
          >
            Print Analytics
          </button>
        </div>
      </section>
    </AdminPage>
  );
};

export default Analytics;
