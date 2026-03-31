import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const ManagerReports = () => {
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadKpis = async () => {
      try {
        const res = await fetch('/api/reporting/admin-kpis/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Unable to load operational reports.');
        const data = await res.json();
        setKpis(data.kpis || null);
      } catch (e) {
        setError(e.message || 'Unable to load operational reports.');
      }
    };
    loadKpis();
  }, []);

  return (
    <DashboardLayout pageTitle="Operational Reports">
      <div className="card">
        {error && <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded">{error}</div>}
        {!error && !kpis && <p className="text-gray-500">Loading reporting metrics...</p>}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><p className="text-sm text-gray-500">Completed Visits</p><p className="text-2xl font-bold">{kpis.visits_completed}</p></div>
            <div><p className="text-sm text-gray-500">Open Tickets</p><p className="text-2xl font-bold">{kpis.open_tickets}</p></div>
            <div><p className="text-sm text-gray-500">Notices Issued</p><p className="text-2xl font-bold">{kpis.notices_issued}</p></div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
