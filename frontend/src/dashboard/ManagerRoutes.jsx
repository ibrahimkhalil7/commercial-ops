import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const ManagerRoutes = () => {
  const routes = [
    { name: 'Route A', progress: '80%', status: 'Active' },
    { name: 'Route B', progress: '100%', status: 'Completed' },
    { name: 'Route C', progress: '55%', status: 'Active' },
  ];

  return (
    <DashboardLayout pageTitle="Route Management">
      <div className="space-y-4">
        <div className="card">
          <h2 className="text-xl font-semibold">Routes</h2>
          <p className="text-sm text-gray-500">Review active and completed routes with performance.</p>
        </div>

        <div className="card overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Route</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, idx) => (
                <tr key={idx} className="hover:bg-gray-50 cursor-pointer">
                  <td>{route.name}</td>
                  <td>{route.progress}</td>
                  <td>{route.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};