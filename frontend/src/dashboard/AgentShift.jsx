import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AgentShift = () => {
  const [shifts, setShifts] = useState([]);
  const [dailyRoutes, setDailyRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const load = async () => {
    try {
      const [sRes, rRes] = await Promise.all([
        fetch('/api/visits/shifts/', { headers: authHeaders() }),
        fetch('/api/routes/daily/my_routes/', { headers: authHeaders() }),
      ]);
      if (!sRes.ok || !rRes.ok) throw new Error('Unable to load shift data.');

      const sData = await sRes.json();
      const rData = await rRes.json();
      const routeList = rData.results || rData;
      setShifts(sData.results || sData);
      setDailyRoutes(routeList);
      if (routeList.length && !selectedRoute) setSelectedRoute(String(routeList[0].id));
    } catch (e) {
      setMessage(e.message || 'Unable to load shift data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activeShift = shifts.find((s) => s.status === 'active');

  const createAndStartShift = async () => {
    if (!selectedRoute) {
      setMessage('Select a daily route before starting a shift.');
      return;
    }
    setMessage('');
    const createRes = await fetch('/api/visits/shifts/', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ daily_route: selectedRoute }),
    });
    if (!createRes.ok) {
      setMessage('Failed to create shift.');
      return;
    }
    const shift = await createRes.json();
    const startRes = await fetch(`/api/visits/shifts/${shift.id}/start/`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!startRes.ok) {
      setMessage('Shift was created but could not be started.');
      return;
    }
    setMessage('Shift started.');
    await load();
  };

  const endShift = async () => {
    if (!activeShift) return;
    const response = await fetch(`/api/visits/shifts/${activeShift.id}/end/`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!response.ok) {
      setMessage('Unable to end shift right now.');
      return;
    }
    setMessage('Shift ended.');
    await load();
  };

  return (
    <DashboardLayout pageTitle="Shift Control">
      {loading ? <div className="card">Loading shift status...</div> : (
        <div className="space-y-4">
          {message && <div className="p-3 rounded border border-amber-200 bg-amber-50 text-amber-800">{message}</div>}
          <div className="card">
            <p className="text-sm text-gray-600">Current Status</p>
            <p className="text-2xl font-bold mt-1">{activeShift ? 'Active' : 'Not Active'}</p>
            {activeShift && <p className="text-sm text-gray-600 mt-2">Started: {new Date(activeShift.start_time).toLocaleString()}</p>}
          </div>
          {!activeShift && (
            <div className="card space-y-3">
              <label className="block text-sm font-medium">Route for this shift</label>
              <select className="w-full border px-3 py-2 rounded" value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}>
                {dailyRoutes.map((route) => <option key={route.id} value={route.id}>{route.route_template_name} - {route.route_date}</option>)}
              </select>
              <button className="btn btn-success" onClick={createAndStartShift}>Start Shift</button>
            </div>
          )}
          {activeShift && <button className="btn btn-danger" onClick={endShift}>End Shift</button>}
        </div>
      )}
    </DashboardLayout>
  );
};
