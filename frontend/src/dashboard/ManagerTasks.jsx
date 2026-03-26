import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Plus, Calendar, User, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const ManagerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    outlet: '',
    priority: 'medium',
    due_date: '',
    task_type: 'visit'
  });

  // Mock tasks data - in a real app, this would come from an API
  const mockTasks = [
    {
      id: 1,
      title: 'Weekly Maintenance Check',
      description: 'Perform routine maintenance and inspection',
      assigned_to: 'Ahmad Hassan',
      outlet: 'Downtown Plaza',
      priority: 'high',
      status: 'pending',
      due_date: '2024-01-15',
      task_type: 'maintenance'
    },
    {
      id: 2,
      title: 'Inventory Stock Check',
      description: 'Verify stock levels and report discrepancies',
      assigned_to: 'Fatima Mohamed',
      outlet: 'Mall Shopping Center',
      priority: 'medium',
      status: 'in_progress',
      due_date: '2024-01-16',
      task_type: 'inventory'
    },
    {
      id: 3,
      title: 'Customer Feedback Collection',
      description: 'Gather customer feedback and suggestions',
      assigned_to: 'Sara Omar',
      outlet: 'Airport Mall',
      priority: 'low',
      status: 'completed',
      due_date: '2024-01-14',
      task_type: 'survey'
    }
  ];

  // Fetch data
  useEffect(() => {
    fetchAgents();
    fetchOutlets();
    // For now, use mock tasks
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const teamMembers = data.filter(user =>
          user.role === 'field_agent' || user.role === 'manager'
        );
        setAgents(teamMembers);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchOutlets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/outlets/');
      if (response.ok) {
        const data = await response.json();
        setOutlets(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      // In a real app, this would make an API call
      const newTask = {
        id: Date.now(),
        ...formData,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      setTasks([...tasks, newTask]);
      setShowAddForm(false);
      setFormData({
        title: '', description: '', assigned_to: '', outlet: '',
        priority: 'medium', due_date: '', task_type: 'visit'
      });
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'in_progress':
        return <Clock className="text-blue-600" size={16} />;
      case 'pending':
        return <AlertCircle className="text-yellow-600" size={16} />;
      default:
        return <AlertCircle className="text-gray-600" size={16} />;
    }
  };

  const getTaskTypeLabel = (type) => {
    const labels = {
      visit: 'Site Visit',
      maintenance: 'Maintenance',
      inventory: 'Inventory',
      survey: 'Survey',
      delivery: 'Delivery'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Task Management">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Task Management">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task Assignments</h2>
            <p className="text-gray-600">{tasks.length} tasks assigned</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Assign Task</span>
          </button>
        </div>

        {/* Add Task Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Assign New Task</h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Weekly Maintenance Check"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Task details and instructions"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To *
                    </label>
                    <select
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select agent</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={`${agent.first_name} ${agent.last_name}`}>
                          {agent.first_name} {agent.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outlet *
                    </label>
                    <select
                      value={formData.outlet}
                      onChange={(e) => setFormData({...formData, outlet: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select outlet</option>
                      {outlets.map(outlet => (
                        <option key={outlet.id} value={outlet.name}>
                          {outlet.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Type
                    </label>
                    <select
                      value={formData.task_type}
                      onChange={(e) => setFormData({...formData, task_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="visit">Site Visit</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inventory">Inventory</option>
                      <option value="survey">Survey</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Assign Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        title: '', description: '', assigned_to: '', outlet: '',
                        priority: 'medium', due_date: '', task_type: 'visit'
                      });
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

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="card hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="badge badge-secondary">
                      {getTaskTypeLabel(task.task_type)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{task.description}</p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User size={16} />
                      <span>{task.assigned_to}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{task.outlet}</span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(task.status)}
                  <span className="text-sm font-medium capitalize">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};