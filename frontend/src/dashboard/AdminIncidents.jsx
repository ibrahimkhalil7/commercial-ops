import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ outlet: '', title: '', description: '', severity: 'medium' });
  const [selectedCategory, setSelectedCategory] = useState({});

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const loadData = async () => {
    try {
      const [iRes, oRes, cRes] = await Promise.all([
        fetch('/api/maintenance/incidents/', { headers: authHeaders() }),
        fetch('/api/outlets/', { headers: authHeaders() }),
        fetch('/api/maintenance/categories/', { headers: authHeaders() }),
      ]);

      if (!iRes.ok || !oRes.ok || !cRes.ok) throw new Error('Unable to load incidents data.');

      const incidentsData = await iRes.json();
      const outletsData = await oRes.json();
      const categoriesData = await cRes.json();

      setIncidents(incidentsData.results || incidentsData);
      setOutlets(outletsData.results || outletsData);
      setCategories(categoriesData.results || categoriesData);
    } catch (e) {
      setError(e.message || 'Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const createIncident = async (e) => {
    e.preventDefault();
    setError('');
    const response = await fetch('/api/maintenance/incidents/', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const err = await response.json();
      setError(err.detail || 'Failed to create incident.');
      return;
    }

    setFormData({ outlet: '', title: '', description: '', severity: 'medium' });
    await loadData();
  };

  const convertToTicket = async (incidentId) => {
    const categoryId = selectedCategory[incidentId];
    if (!categoryId) {
      setError('Select a maintenance category before creating a ticket.');
      return;
    }
    const response = await fetch(`/api/maintenance/incidents/${incidentId}/create_ticket/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ category: categoryId }),
    });

    if (!response.ok) {
      const err = await response.json();
      setError(err.detail || 'Failed to convert incident to ticket.');
      return;
    }

    setError('');
    await loadData();
  };

  return (
    <DashboardLayout pageTitle="Incidents">
      <div className="space-y-6">
        {error && <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Log Incident</h3>
          <form onSubmit={createIncident} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={formData.outlet} onChange={(e) => setFormData({ ...formData, outlet: e.target.value })} className="px-3 py-2 border rounded" required>
              <option value="">Select outlet</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className="px-3 py-2 border rounded">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Incident title" className="px-3 py-2 border rounded" required />
            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className="px-3 py-2 border rounded" required />
            <button className="btn btn-primary md:col-span-2" type="submit">Create Incident</button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          {loading ? <p className="py-4 text-gray-500">Loading incidents...</p> : (
            <table className="table w-full">
              <thead><tr><th>Title</th><th>Outlet</th><th>Severity</th><th>Status</th><th>Create Ticket</th></tr></thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>{incident.title}</td>
                    <td>{incident.outlet_name}</td>
                    <td>{incident.severity}</td>
                    <td>{incident.status}</td>
                    <td>
                      <div className="flex gap-2">
                        <select className="px-2 py-1 border rounded" value={selectedCategory[incident.id] || ''} onChange={(e) => setSelectedCategory((prev) => ({ ...prev, [incident.id]: e.target.value }))}>
                          <option value="">Category</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button className="btn btn-secondary" onClick={() => convertToTicket(incident.id)}>Create Ticket</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!incidents.length && <tr><td colSpan="5" className="text-center py-6 text-gray-500">No incidents logged.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
