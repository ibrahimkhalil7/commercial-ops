import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AlertCircle, FileText, BarChart3, ExternalLink } from 'lucide-react';

/**
 * Outlet Manager Portal
 * Simple, restricted interface for external outlet users
 */
export const OutletPortal = () => {
  return (
    <DashboardLayout pageTitle="Outlet Manager Portal">
      <div className="space-y-6 max-w-4xl">
        {/* Outlet Information Card */}
        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Outlet</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Outlet Name</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">Downtown Plaza</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">Retail</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">Cairo, Egypt</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">manager@outlet.com</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Recent Notices</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
              </div>
              <AlertCircle className="text-orange-600" size={24} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
              </div>
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Compliance</p>
                <p className="text-3xl font-bold text-green-600 mt-2">92%</p>
              </div>
              <BarChart3 className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Recent Notices */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notices</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: 'Mar 20, 2026',
                    type: 'Warning',
                    desc: 'Missing promotional signage',
                    status: 'active',
                  },
                  {
                    date: 'Mar 15, 2026',
                    type: 'Fine',
                    desc: 'Cleanliness violation',
                    status: 'active',
                  },
                  {
                    date: 'Mar 10, 2026',
                    type: 'Notice',
                    desc: 'Operational update',
                    status: 'read',
                  },
                ].map((notice, idx) => (
                  <tr key={idx}>
                    <td className="text-sm">{notice.date}</td>
                    <td>
                      <span className={`badge badge-${notice.type.toLowerCase()}`}>
                        {notice.type}
                      </span>
                    </td>
                    <td className="text-sm">{notice.desc}</td>
                    <td>
                      <span
                        className={`badge ${
                          notice.status === 'active'
                            ? 'badge-danger'
                            : 'badge-gray'
                        }`}
                      >
                        {notice.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="text-blue-600 hover:text-blue-700">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notice Details */}
        <div className="card border-l-4 border-orange-500">
          <div className="flex items-start space-x-4">
            <AlertCircle className="text-orange-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900">Latest Notice</h4>
              <p className="text-gray-600 mt-2">Missing promotional signage is required</p>
              <div className="mt-4 flex space-x-2">
                <button className="btn btn-secondary btn-sm">View Details</button>
                <button className="btn btn-secondary btn-sm">Download PDF</button>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This portal is for viewing notices and outlet history only.
            For disputes or payment inquiries, please contact your assigned manager directly.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
