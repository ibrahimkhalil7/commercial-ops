import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const OutletHistory = () => (
  <DashboardLayout pageTitle="Outlet History">
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-lg font-semibold">Compliance Timeline</h3>
        <p className="text-gray-600 mt-2">
          History is currently limited for outlet accounts.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Use Outlet Notices and Outlet Overview to track the latest compliance actions.
        </p>
      </div>

      <div className="card">
        <h4 className="font-medium text-gray-900">Available now</h4>
        <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>Notice list with issue date, reason, and status</li>
          <li>Latest compliance actions in Outlet Overview</li>
        </ul>
      </div>
    </div>
  </DashboardLayout>
);
