import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Plus, Trash2, Edit, UserPlus, CheckCircle, XCircle } from 'lucide-react';

export const ManagerTeam = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'field_agent'
  });

  // Fetch team members
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Filter to show only field agents and managers (not outlet managers)
        const teamMembers = data.filter(user =>
          user.role === 'field_agent' || user.role === 'manager'
        );
        // Show demo data if no users in database
        if (teamMembers.length === 0) {
          setAgents(getDemoTeamMembers());
        } else {
          setAgents(teamMembers);
        }
      } else {
        // If API fails, show demo data
        setAgents(getDemoTeamMembers());
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Fallback to demo data on error
      setAgents(getDemoTeamMembers());
    } finally {
      setLoading(false);
    }
  };

  const getDemoTeamMembers = () => {
    return [
      {
        id: 1,
        first_name: 'Ahmad',
        last_name: 'Hassan',
        email: 'ahmad.hassan@example.com',
        phone: '+20 123 456 7890',
        role: 'field_agent',
        is_active: true
      },
      {
        id: 2,
        first_name: 'Fatima',
        last_name: 'Mohamed',
        email: 'fatima.mohamed@example.com',
        phone: '+20 123 456 7891',
        role: 'field_agent',
        is_active: true
      },
      {
        id: 3,
        first_name: 'Khalid',
        last_name: 'Ali',
        email: 'khalid.ali@example.com',
        phone: '+20 123 456 7892',
        role: 'field_agent',
        is_active: true
      },
      {
        id: 4,
        first_name: 'Noor',
        last_name: 'Ibrahim',
        email: 'noor.ibrahim@example.com',
        phone: '+20 123 456 7893',
        role: 'field_agent',
        is_active: true
      },
      {
        id: 5,
        first_name: 'Sara',
        last_name: 'Ahmed',
        email: 'sara.ahmed@example.com',
        phone: '+20 123 456 7894',
        role: 'field_agent',
        is_active: true
      },
      {
        id: 6,
        first_name: 'Mohammed',
        last_name: 'Karim',
        email: 'mohammed.karim@example.com',
        phone: '+20 123 456 7895',
        role: 'manager',
        is_active: true
      },
      {
        id: 7,
        first_name: 'Leila',
        last_name: 'Saleh',
        email: 'leila.saleh@example.com',
        phone: '+20 123 456 7896',
        role: 'field_agent',
        is_active: true
      },
      {
        id: 8,
        first_name: 'Hassan',
        last_name: 'Rashid',
        email: 'hassan.rashid@example.com',
        phone: '+20 123 456 7897',
        role: 'field_agent',
        is_active: true
      }
    ];
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          password: 'defaultpassword123', // In production, generate secure password
          is_active: true,
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({ first_name: '', last_name: '', email: '', phone: '', role: 'field_agent' });
        fetchTeamMembers();
      } else {
        const error = await response.json();
        alert('Error adding team member: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error adding agent:', error);
      alert('Error adding team member');
    }
  };

  const handleRemoveAgent = async (agentId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${agentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchTeamMembers();
      } else {
        alert('Error removing team member');
      }
    } catch (error) {
      console.error('Error removing agent:', error);
      alert('Error removing team member');
    }
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setFormData({
      first_name: agent.first_name,
      last_name: agent.last_name,
      email: agent.email,
      phone: agent.phone || '',
      role: agent.role
    });
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${editingAgent.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditingAgent(null);
        setFormData({ first_name: '', last_name: '', email: '', phone: '', role: 'field_agent' });
        fetchTeamMembers();
      } else {
        const error = await response.json();
        alert('Error updating team member: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Error updating team member');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      manager: 'badge badge-primary',
      field_agent: 'badge badge-secondary'
    };
    return badges[role] || 'badge';
  };

  const getRoleLabel = (role) => {
    const labels = {
      manager: 'Manager',
      field_agent: 'Field Agent'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Team Management">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Team Management">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
            <p className="text-gray-600">{agents.length} active team members</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Add Team Member</span>
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingAgent) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingAgent ? 'Edit Team Member' : 'Add New Team Member'}
              </h3>
              <form onSubmit={editingAgent ? handleUpdateAgent : handleAddAgent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="field_agent">Field Agent</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingAgent ? 'Update' : 'Add'} Team Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAgent(null);
                      setFormData({ first_name: '', last_name: '', email: '', phone: '', role: 'field_agent' });
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Team Members Table */}
        <div className="card overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="font-medium">
                    {agent.first_name} {agent.last_name}
                  </td>
                  <td>{agent.email}</td>
                  <td>{agent.phone || 'N/A'}</td>
                  <td>
                    <span className={getRoleBadge(agent.role)}>
                      {getRoleLabel(agent.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center space-x-1 ${
                      agent.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {agent.is_active ? (
                        <>
                          <CheckCircle size={16} />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          <span>Inactive</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAgent(agent)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveAgent(agent.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};