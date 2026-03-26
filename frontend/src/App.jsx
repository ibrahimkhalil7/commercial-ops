import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, RoleRoute } from './utils/ProtectedRoutes';

// Pages
import { LoginPage } from './pages/LoginPage';
import { ManagerDashboard } from './dashboard/ManagerDashboard';
import { ManagerTeam } from './dashboard/ManagerTeam';
import { ManagerOutlets } from './dashboard/ManagerOutlets';
import { ManagerTasks } from './dashboard/ManagerTasks';
import { ManagerRoutes } from './dashboard/ManagerRoutes';
import { ManagerReports } from './dashboard/ManagerReports';
import { FieldAgentDashboard } from './dashboard/FieldAgentDashboard';
import { AgentRoute } from './dashboard/AgentRoute';
import { AgentShift } from './dashboard/AgentShift';
import { AgentCheckIn } from './dashboard/AgentCheckIn';
import { AgentIssue } from './dashboard/AgentIssue';
import { OutletPortal } from './dashboard/OutletPortal';
import { OutletNotices } from './dashboard/OutletNotices';
import { OutletHistory } from './dashboard/OutletHistory';
import { AddOutletForm } from './dashboard/AddOutletForm';

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
            <Route
              path="/outlet/notices"
              element={
                <RoleRoute
                  component={OutletNotices}
                  allowedRoles={['outlet_manager']}
                />
              }
            />
            <Route
              path="/outlet/history"
              element={
                <RoleRoute
                  component={OutletHistory}
                  allowedRoles={['outlet_manager']}
                />
              }
            />

            {/* Field Agent extra views */}
            <Route
              path="/agent/route"
              element={
                <RoleRoute
                  component={AgentRoute}
                  allowedRoles={['field_agent']}
                />
              }
            />
            <Route
              path="/agent/shift"
              element={
                <RoleRoute
                  component={AgentShift}
                  allowedRoles={['field_agent']}
                />
              }
            />
            <Route
              path="/agent/check-in"
              element={
                <RoleRoute
                  component={AgentCheckIn}
                  allowedRoles={['field_agent']}
                />
              }
            />
            <Route
              path="/agent/issue"
              element={
                <RoleRoute
                  component={AgentIssue}
                  allowedRoles={['field_agent']}
                />
              }
            />

            {/* Manager extra views */}
            <Route
              path="/manager/team"
              element={
                <RoleRoute
                  component={ManagerTeam}
                  allowedRoles={['admin', 'manager']}
                />
              }
            />
            <Route
              path="/manager/outlets"
              element={
                <RoleRoute
                  component={ManagerOutlets}
                  allowedRoles={['admin', 'manager']}
                />
              }
            />
            <Route
              path="/manager/tasks"
              element={
                <RoleRoute
                  component={ManagerTasks}
                  allowedRoles={['admin', 'manager']}
                />
              }
            />
            <Route
              path="/manager/routes"
              element={
                <RoleRoute
                  component={ManagerRoutes}
                  allowedRoles={['admin', 'manager']}
                />
              }
            />
            <Route
              path="/manager/reports"
              element={
                <RoleRoute
                  component={ManagerReports}
                  allowedRoles={['admin', 'manager']}
                />
              }
            />

            {/* Add Outlet Form - Available to all authenticated users */}
            <Route
              path="/add-outlet"
              element={<AddOutletForm />}
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
