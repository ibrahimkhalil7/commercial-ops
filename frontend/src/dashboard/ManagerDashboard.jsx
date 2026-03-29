import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  BarChart3,
  Users,
  CheckCircle2,
  AlertCircle,
  Wrench,
  TrendingUp,
} from 'lucide-react';

/**
 * Admin Dashboard
 * Overview of team, routes, and operational metrics
 */
export const ManagerDashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Routes */}
          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Routes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                <p className="text-xs text-gray-500 mt-1">8 completed today</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div
            className="card hover:shadow-lg cursor-pointer"
            onClick={() => navigate('/admin/team')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Team Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
                <p className="text-xs text-green-600 mt-1">7 on shift</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Completed Visits */}
          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed Visits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">234</p>
                <p className="text-xs text-gray-500 mt-1">92% completion rate</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>

          {/* Open Issues */}
          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Open Issues</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
                <p className="text-xs text-orange-600 mt-1">2 high priority</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          {/* Maintenance Tickets */}
          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Maintenance Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                <p className="text-xs text-gray-500 mt-1">3 in progress</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Notices Issued */}
          <div className="card hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Notices This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">28</p>
                <p className="text-xs text-gray-500 mt-1">18 sent successfully</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Live Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Map Placeholder */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Team Positions</h3>
            <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="text-gray-400 mx-auto mb-2" size={48} />
                <p className="text-gray-600">Google Maps integration coming soon</p>
                <p className="text-xs text-gray-500">Shows real-time agent locations</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { user: 'Ahmad Hassan', action: 'Completed visit at Outlet A', time: '2 min ago' },
                { user: 'Fatima Mohamed', action: 'Reported maintenance issue', time: '15 min ago' },
                {
                  user: 'Khalid Ali',
                  action: 'Issued notice to Outlet B',
                  time: '1 hour ago',
                },
              ].map((activity, idx) => (
                <div key={idx} className="border-b border-gray-200 last:border-b-0 pb-3 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

import { MapPin } from 'lucide-react';
