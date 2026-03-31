import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AgentRoute = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await fetch('/api/routes/daily/my_routes/', { headers: authHeaders() });
        if (!response.ok) throw new Error('Unable to load assigned routes.');
        const data = await response.json();
        const allRoutes = data.results || data;
        setRoutes(allRoutes);
        if (allRoutes.length) setSelectedRoute(String(allRoutes[0].id));
      } catch (e) {
        setError(e.message || 'Unable to load route details.');
      } finally {
        setLoading(false);
      }
    };
    loadRoutes();
  }, []);

  useEffect(() => {
    if (!selectedRoute) return;
    const loadVisits = async () => {
      try {
        const response = await fetch(`/api/visits/visits/?daily_route=${selectedRoute}`, { headers: authHeaders() });
        if (!response.ok) throw new Error('Unable to load route stops.');
        const data = await response.json();
        setVisits(data.results || data);
      } catch (e) {
        setError(e.message || 'Unable to load route stops.');
      }
    };
    loadVisits();
  }, [selectedRoute]);

  return (
    <DashboardLayout pageTitle="Assigned Route">
      {loading ? <div className="card">Loading route...</div> : (
        <div className="space-y-4">
          {error && <div className="p-3 rounded border border-amber-200 bg-amber-50 text-amber-800">{error}</div>}
          <div className="card">
            <label className="block text-sm font-medium mb-2">Route Run</label>
            <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              {routes.map((route) => <option key={route.id} value={route.id}>{route.route_template_name} - {route.route_date}</option>)}
            </select>
          </div>

          <div className="card overflow-x-auto">
            <table className="table w-full">
              <thead><tr><th>Stop</th><th>Status</th><th>Check In</th><th>Check Out</th></tr></thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.outlet_name}</td><td>{visit.status}</td>
                    <td>{visit.check_in_time ? new Date(visit.check_in_time).toLocaleString() : '-'}</td>
                    <td>{visit.check_out_time ? new Date(visit.check_out_time).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {!visits.length && <tr><td colSpan="4" className="text-center py-6 text-gray-500">No stops in this route.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
