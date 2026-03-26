import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Navigation,
} from 'lucide-react';

/**
 * Field Agent Dashboard
 * Mobile-first interface for field operations
 */
export const FieldAgentDashboard = () => {
  const navigate = useNavigate();
  const [shiftActive, setShiftActive] = React.useState(true);
  const [shiftStartTime, setShiftStartTime] = React.useState('08:00 AM');

  const handleStartShift = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setShiftStartTime(time);
    setShiftActive(true);
  };

  const handleEndShift = () => {
    setShiftActive(false);
  };
  return (
    <DashboardLayout pageTitle="My Route">
      <div className="space-y-6 max-w-2xl">
        {/* Shift Status */}
        <div className="card border-2 border-green-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Shift Status</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {shiftActive ? 'Active' : 'Inactive'}
              </p>
              <p className="text-xs text-green-700 mt-2">
                {shiftActive ? `Started at ${shiftStartTime}` : 'No active shift'}
              </p>
            </div>
            {shiftActive ? (
              <button className="btn btn-danger" onClick={handleEndShift}>
                End Shift
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleStartShift}>
                Start Shift
              </button>
            )}
          </div>
        </div>

        {/* Today's Route Overview */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Route</h3>
            <span className="badge badge-primary">6 of 8 completed</span>
          </div>

          {!shiftActive && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-700">Start your shift to view today's route</p>
            </div>
          )}

          {shiftActive && (
            <>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>

          {/* Route Stops */}
          <div className="space-y-3">
            {[
              { name: 'Downtown Plaza', time: '08:30', status: 'completed', distance: '0 m' },
              {
                name: 'Mall Shopping Center',
                time: '10:15',
                status: 'completed',
                distance: '2.3 km',
              },
              {
                name: 'Market District',
                time: '12:00',
                status: 'completed',
                distance: '1.5 km',
              },
              {
                name: 'Harbor Outlet',
                time: '1:30 PM',
                status: 'current',
                distance: '3.2 km',
              },
              { name: 'North Station', time: '3:00 PM', status: 'pending', distance: '4.1 km' },
              { name: 'Airport Mall', time: '4:30 PM', status: 'pending', distance: '8.5 km' },
            ].map((stop, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{stop.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center space-x-1">
                      <MapPin size={12} />
                      <span>{stop.distance}</span>
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">{stop.time}</p>
                  {stop.status === 'completed' && (
                    <CheckCircle2 className="text-green-600 ml-auto mt-1" size={20} />
                  )}
                  {stop.status === 'current' && (
                    <Zap className="text-blue-600 ml-auto mt-1 animate-pulse" size={20} />
                  )}
                </div>
              </div>
            ))}
          </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            className="btn btn-primary py-4 text-base font-medium"
            onClick={() => navigate('/agent/check-in')}
            disabled={!shiftActive}
          >
            <CheckCircle2 className="inline-block mr-2" size={20} />
            Check In
          </button>
          <button
            className="btn btn-secondary py-4 text-base font-medium"
            onClick={() => navigate('/agent/issue')}
            disabled={!shiftActive}
          >
            <AlertCircle className="inline-block mr-2" size={20} />
            Log Issue
          </button>
        </div>

        {/* Location & GPS */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
            <Navigation className="text-blue-600" size={20} />
          </div>
          <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center mb-4">
            <p className="text-gray-600 text-center">
              <span className="block text-2xl font-bold text-gray-400 mb-2">📍</span>
              GPS tracking active
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Latitude</p>
              <p className="font-mono text-gray-900">30.0131°N</p>
            </div>
            <div>
              <p className="text-gray-600">Longitude</p>
              <p className="font-mono text-gray-900">31.3589°E</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
