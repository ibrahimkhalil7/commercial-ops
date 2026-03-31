import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Wrench,
  TrendingUp,
  MapPin,
} from 'lucide-react';

/**
 * Admin Dashboard
 * API-driven KPI and activity control center
 */
export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    total_routes: 0,
    completed_routes: 0,
    active_shifts: 0,
    visits_completed: 0,
    visits_skipped: 0,
    open_tickets: 0,
    notices_issued: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKpis();
  }, []);

  const fetchKpis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reporting/admin-kpis/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load admin KPIs');

      const data = await response.json();
      setKpis(data.kpis || {});
      setRecentActivity(data.recent_activity || []);
    } catch (error) {
      console.error('Error loading dashboard KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Routes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.total_routes || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{kpis.completed_routes || 0} completed</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div
            className="card hover:shadow-lg cursor-pointer"
            onClick={() => navigate('/admin/team')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Shifts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.active_shifts || 0}</p>
                <p className="text-xs text-green-600 mt-1">Live field visibility</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed Visits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.visits_completed || 0}</p>
                <p className="text-xs text-red-600 mt-1">Skipped: {kpis.visits_skipped || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Open Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.open_tickets || 0}</p>
                <p className="text-xs text-orange-600 mt-1">Needs follow-up</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Wrench className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Notices Issued</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.notices_issued || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Compliance actions</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Team Positions</h3>
            <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="text-gray-400 mx-auto mb-2" size={48} />
                <p className="text-gray-600">Live GPS logs are available from field activity records</p>
                <p className="text-xs text-gray-500">Map visualization is not enabled in this build</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-b border-gray-200 last:border-b-0 pb-3 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{activity.user_name}</p>
                  <p className="text-sm text-gray-600">{activity.description || activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              ))}
              {!recentActivity.length && <p className="text-sm text-gray-500">No recent activity yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
