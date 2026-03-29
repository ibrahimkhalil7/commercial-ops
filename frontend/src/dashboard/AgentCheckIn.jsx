import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AgentCheckIn = () => {
  const [dailyRoutes, setDailyRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [skipReason, setSkipReason] = useState({});
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    fetchMyRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) fetchVisitsForRoute(selectedRoute);
  }, [selectedRoute]);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchMyRoutes = async () => {
    try {
      const response = await fetch('/api/routes/daily/my_routes/', { headers: authHeaders() });
      if (!response.ok) throw new Error('Failed to load routes');
      const data = await response.json();
      const routes = data.results || data;
      setDailyRoutes(routes);
      if (routes.length) setSelectedRoute(routes[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitsForRoute = async (routeId) => {
    const response = await fetch(`/api/visits/visits/?daily_route=${routeId}`, { headers: authHeaders() });
    if (!response.ok) return;
    const data = await response.json();
    setVisits(data.results || data);
  };

  const runVisitAction = async (visitId, action, body = {}) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/visits/visits/${visitId}/${action}/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(error.detail || 'Action failed');
        return;
      }
      await fetchVisitsForRoute(selectedRoute);
    } finally {
      setActionLoading(false);
    }
  };

  const getCurrentLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser/device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('Location permission denied. Please allow location access.'));
        } else {
          reject(new Error('Unable to get current location.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });

  const handleCheckIn = async (visitId) => {
    try {
      setLocationError('');
      const location = await getCurrentLocation();
      await runVisitAction(visitId, 'check_in', location);
    } catch (error) {
      setLocationError(error.message);
    }
  };

  const handleCheckOut = async (visitId) => {
    try {
      setLocationError('');
      const location = await getCurrentLocation();
      await runVisitAction(visitId, 'check_out', location);
    } catch (error) {
      setLocationError(error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Check In">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Check In / Check Out">
      <div className="space-y-6">
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">Daily Route</label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {dailyRoutes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.route_template_name} - {route.route_date}
              </option>
            ))}
          </select>
        </div>

        <div className="card overflow-x-auto">
          {locationError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {locationError}
            </div>
          )}
          <table className="table w-full">
            <thead>
              <tr>
                <th>Outlet</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id}>
                  <td>{visit.outlet_name}</td>
                  <td>{visit.status}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn btn-primary"
                        disabled={actionLoading}
                        onClick={() => handleCheckIn(visit.id)}
                      >
                        Check In
                      </button>
                      <button
                        className="btn btn-success"
                        disabled={actionLoading}
                        onClick={() => handleCheckOut(visit.id)}
                      >
                        Check Out
                      </button>
                      <input
                        type="text"
                        placeholder="Skip reason"
                        value={skipReason[visit.id] || ''}
                        onChange={(e) => setSkipReason((prev) => ({ ...prev, [visit.id]: e.target.value }))}
                        className="px-2 py-1 border border-gray-300 rounded"
                      />
                      <button
                        className="btn btn-danger"
                        disabled={actionLoading}
                        onClick={() => runVisitAction(visit.id, 'skip', { reason: skipReason[visit.id] || '' })}
                      >
                        Skip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visits.length && (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500 py-4">
                    No visits found for this route.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
