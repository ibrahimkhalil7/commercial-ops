import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AdminOutletTimeline = () => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [events, setEvents] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    loadOutlets();
  }, []);

  useEffect(() => {
    if (selectedOutlet) loadTimeline();
  }, [selectedOutlet, typeFilter]);

  const loadOutlets = async () => {
    const response = await fetch('/api/outlets/', { headers: authHeaders() });
    const data = response.ok ? await response.json() : [];
    const list = data.results || data;
    setOutlets(list);
    if (list.length) setSelectedOutlet(list[0].id);
  };

  const loadTimeline = async () => {
    const params = new URLSearchParams({ page: 1, page_size: 50 });
    if (typeFilter) params.append('type', typeFilter);
    const response = await fetch(`/api/outlets/${selectedOutlet}/timeline/?${params}`, { headers: authHeaders() });
    const data = response.ok ? await response.json() : { results: [] };
    setEvents(data.results || []);
  };

  return (
    <DashboardLayout pageTitle="Outlet Timeline">
      <div className="space-y-6">
        <div className="card grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)} className="px-3 py-2 border rounded">
            {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">All event types</option>
            <option value="visit">visit</option>
            <option value="incident">incident</option>
            <option value="ticket">ticket</option>
            <option value="notice">notice</option>
            <option value="legacy_notice">legacy_notice</option>
          </select>
        </div>

        <div className="card">
          <div className="space-y-3">
            {events.map((event, idx) => (
              <div key={`${event.type}-${idx}`} className="border border-gray-200 rounded p-3">
                <p className="text-sm font-semibold text-gray-900">{event.type}</p>
                <p className="text-xs text-gray-500">{new Date(event.event_at).toLocaleString()}</p>
                <pre className="text-xs text-gray-700 mt-2 whitespace-pre-wrap">{JSON.stringify(event.data, null, 2)}</pre>
              </div>
            ))}
            {!events.length && <p className="text-sm text-gray-500">No timeline events found.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
