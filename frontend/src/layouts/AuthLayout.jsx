import React from 'react';

/**
 * Auth Layout
 * Simple layout for login and authentication pages
 */
export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-blue-600">CO</span>
          </div>
          <h1 className="text-3xl font-bold text-white">CommOps</h1>
          <p className="text-blue-100 mt-2">Commercial Operations Platform</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-xl p-8">{children}</div>
      </div>
    </div>
  );
};
