import React, { useState, useEffect } from 'react';
import { AdminPage, useAdminFetch } from './AdminPage';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchWithAuth } = useAdminFetch();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetchWithAuth('/users');
      const usersData = Array.isArray(response) ? response : response.users || [];
      // Filter to show only branch staff (CHEF, CASHIER)
      const branchStaff = usersData.filter((u: StaffMember) => 
        u.role === 'CHEF' || u.role === 'CASHIER'
      );
      setStaff(branchStaff);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminPage title="Branch Staff">
        <div className="admin-loading">Loading staff...</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Branch Staff">
      {error && <div className="admin-error">{error}</div>}
      
      <div className="admin-section">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
};

export default Staff;
