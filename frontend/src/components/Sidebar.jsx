import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  MapPin,
  Users,
  AlertCircle,
  Wrench,
  BarChart3,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = {
    admin: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Team', path: '/admin/team', icon: Users },
      { label: 'Outlets', path: '/admin/outlets', icon: MapPin },
      { label: 'Tasks', path: '/admin/tasks', icon: CheckCircle2 },
      { label: 'Routes', path: '/admin/routes', icon: MapPin },
      { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
<<<<<<< HEAD
=======
      { label: 'Incidents', path: '/admin/incidents', icon: AlertCircle },
      { label: 'Tickets', path: '/admin/tickets', icon: Wrench },
      { label: 'Notices', path: '/admin/notices', icon: AlertCircle },
      { label: 'Outlet Timeline', path: '/admin/outlet-timeline', icon: BarChart3 },
>>>>>>> origin/codex/add-location-via-google-maps-y6l057
    ],
    manager: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Team', path: '/admin/team', icon: Users },
      { label: 'Outlets', path: '/admin/outlets', icon: MapPin },
      { label: 'Tasks', path: '/admin/tasks', icon: CheckCircle2 },
      { label: 'Routes', path: '/admin/routes', icon: MapPin },
      { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
<<<<<<< HEAD
=======
      { label: 'Incidents', path: '/admin/incidents', icon: AlertCircle },
      { label: 'Tickets', path: '/admin/tickets', icon: Wrench },
      { label: 'Notices', path: '/admin/notices', icon: AlertCircle },
      { label: 'Outlet Timeline', path: '/admin/outlet-timeline', icon: BarChart3 },
>>>>>>> origin/codex/add-location-via-google-maps-y6l057
    ],
    field_agent: [
      { label: 'Dashboard', path: '/agent', icon: LayoutDashboard },
      { label: 'My Route', path: '/agent/route', icon: MapPin },
      { label: 'Start Shift', path: '/agent/shift', icon: Zap },
      { label: 'Check In', path: '/agent/check-in', icon: CheckCircle2 },
      { label: 'Log Issue', path: '/agent/issue', icon: AlertCircle },
    ],
    outlet_manager: [
      { label: 'Dashboard', path: '/outlet', icon: LayoutDashboard },
      { label: 'Notices', path: '/outlet/notices', icon: AlertCircle },
      { label: 'History', path: '/outlet/history', icon: BarChart3 },
    ],
  };

  const items = navItems[user?.role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-900 text-white
          transform transition-transform duration-300 z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          pt-4 flex flex-col
        `}
      >
        <nav className="space-y-2 px-4 mt-16 md:mt-0 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Add Outlet Button at Bottom - Not for outlet managers */}
        {user?.role !== 'outlet_manager' && (
          <div className="px-4 pb-4 border-t border-gray-700">
            <NavLink
              to="/admin/outlets"
              onClick={onClose}
              className="flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors mt-4"
            >
              <span className="text-white font-bold text-sm">+ Add Outlet</span>
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
};
