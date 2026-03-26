import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

/**
 * Dashboard Layout
 * Provides consistent header, sidebar, and main content area
 */
export const DashboardLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 pd-4 md:p-8">
          {pageTitle && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
