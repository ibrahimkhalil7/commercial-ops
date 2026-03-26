import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, RoleRoute } from './utils/ProtectedRoutes';

// Pages
import { LoginPage } from './pages/LoginPage';
import { ManagerDashboard } from './dashboard/ManagerDashboard';
import { FieldAgentDashboard } from './dashboard/FieldAgentDashboard';
import { OutletPortal } from './dashboard/OutletPortal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Dashboard */}
          <Route element={<PrivateRoute />}>
            {/* Manager Dashboard - accessible by admin and manager roles */}
            <Route
              path="/"
              element={
                <RoleRoute
                  component={ManagerDashboard}
                  allowedRoles={['admin', 'manager']}
                />
              }
            />

            {/* Field Agent Dashboard */}
            <Route
              path="/agent"
              element={
                <RoleRoute
                  component={FieldAgentDashboard}
                  allowedRoles={['field_agent']}
                />
              }
            />

            {/* Outlet Portal */}
            <Route
              path="/outlet"
              element={
                <RoleRoute
                  component={OutletPortal}
                  allowedRoles={['outlet_manager']}
                />
              }
            />
          </Route>

          {/* Fallback Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
