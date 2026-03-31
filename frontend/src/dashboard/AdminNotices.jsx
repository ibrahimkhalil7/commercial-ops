import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ outlet: '', notice_type: 'warning', reason: '', priority: 'medium', amount: '' });

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const loadData = async () => {
    try {
      const [nRes, oRes] = await Promise.all([
        fetch('/api/notices/', { headers: authHeaders() }),
        fetch('/api/outlets/', { headers: authHeaders() }),
      ]);
      if (!nRes.ok || !oRes.ok) throw new Error('Unable to load notices and outlets.');
      const noticesData = await nRes.json();
      const outletsData = await oRes.json();
      setNotices(noticesData.results || noticesData);
      setOutlets(outletsData.results || outletsData);
    } catch (e) {
      setError(e.message || 'Failed to load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const createNotice = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const response = await fetch('/api/notices/', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: formData.amount || null }),
    });
    if (!response.ok) {
      const err = await response.json();
      setError(err.detail || 'Failed to create notice.');
      return;
    }
    setSuccess('Notice issued successfully.');
    setFormData({ outlet: '', notice_type: 'warning', reason: '', priority: 'medium', amount: '' });
    await loadData();
  };

  return (
    <DashboardLayout pageTitle="Notices & Violations">
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Issue Notice</h3>
          {error && <div className="mb-3 p-3 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>}
          {success && <div className="mb-3 p-3 rounded border border-green-200 bg-green-50 text-green-700">{success}</div>}
          <form onSubmit={createNotice} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={formData.outlet} onChange={(e) => setFormData({ ...formData, outlet: e.target.value })} className="px-3 py-2 border rounded" required>
              <option value="">Select outlet</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <select value={formData.notice_type} onChange={(e) => setFormData({ ...formData, notice_type: e.target.value })} className="px-3 py-2 border rounded">
              <option value="warning">Warning</option><option value="fine">Fine</option><option value="violation">Violation</option><option value="notice">Notice</option>
            </select>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="px-3 py-2 border rounded">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Amount (optional)" className="px-3 py-2 border rounded" min="0" />
            <input type="text" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason" className="px-3 py-2 border rounded md:col-span-2" required />
            <button className="btn btn-primary md:col-span-2" type="submit">Issue Notice</button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          {loading && <p className="py-4 text-gray-500">Loading notices...</p>}
          {!loading && (
            <table className="table w-full">
              <thead><tr><th>Outlet</th><th>Type</th><th>Priority</th><th>Status</th><th>Issued</th></tr></thead>
              <tbody>
                {notices.map((n) => (
                  <tr key={n.id}><td>{n.outlet_name}</td><td>{n.notice_type}</td><td>{n.priority}</td><td>{n.send_status}</td><td>{new Date(n.issued_at).toLocaleString()}</td></tr>
                ))}
                {!notices.length && <tr><td colSpan="5" className="text-center py-6 text-gray-500">No notices issued yet.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
