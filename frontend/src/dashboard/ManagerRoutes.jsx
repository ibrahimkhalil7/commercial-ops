import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const ManagerRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/routes/daily/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Unable to load route operations data.');
        const data = await res.json();
        setRoutes(data.results || data);
      } catch (e) {
        setError(e.message || 'Unable to load route operations data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout pageTitle="Route Operations">
      <div className="card overflow-x-auto">
        {loading && <div className="py-6 text-center text-gray-500">Loading routes...</div>}
        {!loading && error && <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded">{error}</div>}
        {!loading && !error && (
          <table className="table w-full">
            <thead><tr><th>Route</th><th>Date</th><th>Assigned Agent</th><th>Status</th><th>Progress</th></tr></thead>
            <tbody>
              {routes.map((route) => {
                const planned = route.planned_stops || 0;
                const completed = route.completed_stops || 0;
                return (
                  <tr key={route.id}>
                    <td>{route.route_template_name}</td>
                    <td>{route.route_date}</td>
                    <td>{route.assigned_agent_name || 'Unassigned'}</td>
                    <td>{route.status}</td>
                    <td>{planned ? `${completed}/${planned}` : 'N/A'}</td>
                  </tr>
                );
              })}
              {!routes.length && <tr><td colSpan="5" className="py-6 text-center text-gray-500">No route runs available.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};
