import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { getRoleLabel } from '../utils/helpers';

export const ManagerTeam = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Unable to load team directory.');

      const data = await response.json();
      const users = Array.isArray(data) ? data : (data.results || []);
      const teamMembers = users.filter((user) =>
        ['field_agent', 'manager', 'admin'].includes(user.role)
      );
      setAgents(teamMembers);
    } catch (e) {
      setError(e.message || 'Unable to load team directory.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Team Directory">
        <div className="flex items-center justify-center min-h-64"><div className="spinner" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Team Directory">
      <div className="space-y-4">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900">Team Directory</h2>
          <p className="text-sm text-gray-600 mt-1">View managers and field agents assigned to operations.</p>
        </div>
        {error && <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded">{error}</div>}

        <div className="card overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>{`${agent.first_name || ''} ${agent.last_name || ''}`.trim() || 'N/A'}</td>
                  <td>{agent.email}</td>
                  <td>{agent.phone || 'N/A'}</td>
                  <td>{getRoleLabel(agent.role)}</td>
                  <td>{agent.is_active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
              {!agents.length && !error && (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500">No team members are currently assigned.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
