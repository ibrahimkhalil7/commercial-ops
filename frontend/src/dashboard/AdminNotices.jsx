import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [formData, setFormData] = useState({ outlet: '', notice_type: 'warning', reason: '', priority: 'medium', amount: '' });

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const loadData = async () => {
    const [nRes, oRes] = await Promise.all([
      fetch('/api/notices/', { headers: authHeaders() }),
      fetch('/api/outlets/', { headers: authHeaders() }),
    ]);
    const noticesData = nRes.ok ? await nRes.json() : [];
    const outletsData = oRes.ok ? await oRes.json() : [];
    setNotices(noticesData.results || noticesData);
    setOutlets(outletsData.results || outletsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createNotice = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/notices/', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: formData.amount || null }),
    });
    if (!response.ok) {
      const err = await response.json();
      alert(err.detail || 'Failed to create notice');
      return;
    }
    setFormData({ outlet: '', notice_type: 'warning', reason: '', priority: 'medium', amount: '' });
    loadData();
  };

  return (
    <DashboardLayout pageTitle="Notices / Violations">
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Issue Notice</h3>
          <form onSubmit={createNotice} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={formData.outlet} onChange={(e) => setFormData({ ...formData, outlet: e.target.value })} className="px-3 py-2 border rounded" required>
              <option value="">Select outlet</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <select value={formData.notice_type} onChange={(e) => setFormData({ ...formData, notice_type: e.target.value })} className="px-3 py-2 border rounded">
              <option value="warning">warning</option>
              <option value="fine">fine</option>
              <option value="violation">violation</option>
              <option value="notice">notice</option>
            </select>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="px-3 py-2 border rounded">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Amount (optional)" className="px-3 py-2 border rounded" />
            <input type="text" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason" className="px-3 py-2 border rounded md:col-span-2" required />
            <button className="btn btn-primary md:col-span-2" type="submit">Issue Notice</button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          <table className="table w-full">
            <thead><tr><th>Outlet</th><th>Type</th><th>Priority</th><th>Status</th><th>Issued</th></tr></thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id}><td>{n.outlet_name}</td><td>{n.notice_type}</td><td>{n.priority}</td><td>{n.send_status}</td><td>{new Date(n.issued_at).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
