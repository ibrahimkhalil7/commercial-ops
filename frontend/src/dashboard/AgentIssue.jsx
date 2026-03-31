import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AgentIssue = () => {
  const [outlets, setOutlets] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ outlet: '', title: '', description: '', severity: 'medium' });

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

  const loadData = async () => {
    const [iRes, oRes] = await Promise.all([
      fetch('/api/maintenance/incidents/', { headers: authHeaders() }),
      fetch('/api/outlets/', { headers: authHeaders() }),
    ]);
    const iData = iRes.ok ? await iRes.json() : [];
    const oData = oRes.ok ? await oRes.json() : [];
    setIncidents(iData.results || iData);
    setOutlets(oData.results || oData);
  };

  useEffect(() => { loadData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const response = await fetch('/api/maintenance/incidents/', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(formData),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.detail || 'Failed to submit issue.');
      return;
    }
    setFormData({ outlet: '', title: '', description: '', severity: 'medium' });
    await loadData();
  };

  return (
    <DashboardLayout pageTitle="Log Field Issue">
      <div className="space-y-4">
        {error && <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700">{error}</div>}
        <div className="card">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select required className="px-3 py-2 border rounded" value={formData.outlet} onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}>
              <option value="">Select outlet</option>
              {outlets.map((o) => <option value={o.id} key={o.id}>{o.name}</option>)}
            </select>
            <select className="px-3 py-2 border rounded" value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
            <input required className="px-3 py-2 border rounded" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Issue title" />
            <input required className="px-3 py-2 border rounded" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Issue details" />
            <button className="btn btn-primary md:col-span-2" type="submit">Submit Issue</button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          <table className="table w-full">
            <thead><tr><th>Created</th><th>Outlet</th><th>Title</th><th>Severity</th><th>Status</th></tr></thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}><td>{new Date(incident.created_at).toLocaleString()}</td><td>{incident.outlet_name}</td><td>{incident.title}</td><td>{incident.severity}</td><td>{incident.status}</td></tr>
              ))}
              {!incidents.length && <tr><td className="text-center py-4 text-gray-500" colSpan="5">No issues logged yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
