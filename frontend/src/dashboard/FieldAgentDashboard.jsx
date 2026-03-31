import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const FieldAgentDashboard = () => {
  const navigate = useNavigate();
  const [shift, setShift] = useState(null);
  const [route, setRoute] = useState(null);
  const [visits, setVisits] = useState([]);
  const [gps, setGps] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const load = async () => {
      const [shiftRes, routeRes, gpsRes] = await Promise.all([
        fetch('/api/visits/shifts/', { headers: headers() }),
        fetch('/api/routes/daily/my_routes/', { headers: headers() }),
        fetch('/api/visits/gps-logs/', { headers: headers() }),
      ]);

      const shiftData = shiftRes.ok ? await shiftRes.json() : [];
      const routeData = routeRes.ok ? await routeRes.json() : [];
      const gpsData = gpsRes.ok ? await gpsRes.json() : [];

      const shifts = shiftData.results || shiftData;
      const routes = routeData.results || routeData;
      const gpsLogs = gpsData.results || gpsData;

      const active = shifts.find((s) => s.status === 'active') || null;
      const latestRoute = routes[0] || null;
      setShift(active);
      setRoute(latestRoute);
      setGps(gpsLogs[0] || null);

      if (latestRoute) {
        const visitsRes = await fetch(`/api/visits/visits/?daily_route=${latestRoute.id}`, { headers: headers() });
        const visitsData = visitsRes.ok ? await visitsRes.json() : [];
        setVisits(visitsData.results || visitsData);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <DashboardLayout pageTitle="Field Dashboard"><div className="card">Loading...</div></DashboardLayout>;

  const completed = visits.filter((v) => v.status === 'checked_out').length;
  const skipped = visits.filter((v) => v.status === 'skipped').length;

  return (
    <DashboardLayout pageTitle="Field Dashboard">
      <div className="space-y-4 max-w-3xl">
        <div className="card">
          <p className="text-sm text-gray-600">Shift Status</p>
          <p className="text-2xl font-bold">{shift ? 'Active' : 'Inactive'}</p>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-success" onClick={() => navigate('/agent/shift')}>{shift ? 'Manage Shift' : 'Start Shift'}</button>
            <button className="btn btn-primary" onClick={() => navigate('/agent/check-in')}>Open Stops</button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Current Route</h3>
          {route ? (
            <>
              <p className="text-sm text-gray-700">{route.route_template_name} - {route.route_date}</p>
              <p className="text-sm text-gray-600 mt-2">Completed: {completed} / {visits.length} • Skipped: {skipped}</p>
            </>
          ) : <p className="text-gray-500">No route assigned.</p>}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Latest GPS</h3>
          {gps ? <p className="text-sm text-gray-700">{gps.latitude}, {gps.longitude} ({new Date(gps.timestamp).toLocaleString()})</p> : <p className="text-gray-500">No GPS logs recorded yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
};
