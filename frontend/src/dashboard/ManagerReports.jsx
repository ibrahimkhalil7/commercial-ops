import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const ManagerReports = () => {
  return (
    <DashboardLayout pageTitle="Reports">
      <div className="card">
        <h2 className="text-xl font-semibold">Reporting</h2>
        <p className="text-gray-600 mt-2">Coming soon: detailed analytics for operational performance.</p>
      </div>
    </DashboardLayout>
  );
};