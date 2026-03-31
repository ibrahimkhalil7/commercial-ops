import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const OutletNotices = () => {
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
          setError('Notice access is currently unavailable for this account.');
          return;
        }
        const data = await response.json();
        setNotices(data.results || data);
      } catch {
        setError('Unable to load notices right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout pageTitle="Outlet Notices">
      <div className="card overflow-x-auto">
        {loading && <p className="text-gray-500">Loading notices...</p>}
        {!loading && error && <div className="p-3 rounded border border-amber-200 bg-amber-50 text-amber-800">{error}</div>}
        {!loading && !error && (
          <table className="table w-full">
            <thead><tr><th>Issued</th><th>Type</th><th>Priority</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id}>
                  <td>{new Date(n.issued_at).toLocaleString()}</td>
                  <td>{n.notice_type}</td>
                  <td>{n.priority}</td>
                  <td>{n.reason}</td>
                  <td>{n.send_status}</td>
                </tr>
              ))}
              {!notices.length && <tr><td className="text-center py-5 text-gray-500" colSpan="5">No notices available.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};
