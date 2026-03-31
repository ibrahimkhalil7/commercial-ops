import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

export const OutletPortal = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/notices/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) {
          setError('Notices are not available for this account yet.');
          return;
        }
        const data = await response.json();
        setNotices(data.results || data);
      } catch {
        setError('Unable to load outlet notices right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const unresolvedCount = notices.filter((n) => n.send_status !== 'sent').length;

  return (
    <DashboardLayout pageTitle="Outlet Overview">
      <div className="space-y-4 max-w-4xl">
        <div className="card">
          <h3 className="font-semibold text-lg">Account Summary</h3>
          <p className="text-sm text-gray-600 mt-2">Signed in as: {user?.email}</p>
          <p className="text-sm text-gray-600">Role: Outlet Manager</p>
        </div>

        {loading && <div className="card text-gray-500">Loading outlet data...</div>}
        {!loading && error && <div className="card border border-amber-200 bg-amber-50 text-amber-800">{error}</div>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <p className="text-sm text-gray-500">Total Notices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{notices.length}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500">Pending Communication Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{unresolvedCount}</p>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg">Latest Compliance Actions</h3>
              {notices.length ? (
                <ul className="mt-3 space-y-2">
                  {notices.slice(0, 5).map((n) => (
                    <li key={n.id} className="text-sm">
                      {new Date(n.issued_at).toLocaleDateString()} • {n.notice_type} • {n.reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-3">No compliance actions recorded.</p>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
