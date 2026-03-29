import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ outlet: '', title: '', description: '', severity: 'medium' });

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const loadData = async () => {
    const [iRes, oRes, cRes] = await Promise.all([
      fetch('/api/maintenance/incidents/', { headers: authHeaders() }),
      fetch('/api/outlets/', { headers: authHeaders() }),
      fetch('/api/maintenance/categories/', { headers: authHeaders() }),
    ]);

    const incidentsData = iRes.ok ? await iRes.json() : [];
    const outletsData = oRes.ok ? await oRes.json() : [];
    const categoriesData = cRes.ok ? await cRes.json() : [];

    setIncidents(incidentsData.results || incidentsData);
    setOutlets(outletsData.results || outletsData);
    setCategories(categoriesData.results || categoriesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createIncident = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/maintenance/incidents/', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const err = await response.json();
      alert(err.detail || 'Failed to create incident');
      return;
    }

    setFormData({ outlet: '', title: '', description: '', severity: 'medium' });
    loadData();
  };

  const convertToTicket = async (incidentId, categoryId) => {
    if (!categoryId) {
      alert('Select a maintenance category first.');
      return;
    }
    const response = await fetch(`/api/maintenance/incidents/${incidentId}/create_ticket/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ category: categoryId }),
    });

    if (!response.ok) {
      const err = await response.json();
      alert(err.detail || 'Failed to convert incident to ticket');
      return;
    }

    loadData();
  };

  return (
    <DashboardLayout pageTitle="Incidents">
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Log Incident</h3>
          <form onSubmit={createIncident} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={formData.outlet} onChange={(e) => setFormData({ ...formData, outlet: e.target.value })} className="px-3 py-2 border rounded" required>
              <option value="">Select outlet</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className="px-3 py-2 border rounded">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Incident title" className="px-3 py-2 border rounded" required />
            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className="px-3 py-2 border rounded" required />
            <button className="btn btn-primary md:col-span-2" type="submit">Create Incident</button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          <table className="table w-full">
            <thead><tr><th>Title</th><th>Outlet</th><th>Severity</th><th>Status</th><th>Convert</th></tr></thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.title}</td>
                  <td>{incident.outlet_name}</td>
                  <td>{incident.severity}</td>
                  <td>{incident.status}</td>
                  <td>
                    <select id={`cat-${incident.id}`} className="px-2 py-1 border rounded mr-2">
                      <option value="">Category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="btn btn-secondary" onClick={() => convertToTicket(incident.id, document.getElementById(`cat-${incident.id}`).value)}>
                      Create Ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
