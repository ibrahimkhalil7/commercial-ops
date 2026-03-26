import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Edit, Trash2, Plus, MapPin, Phone, Mail } from 'lucide-react';

export const ManagerOutlets = () => {
  const [outlets, setOutlets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
    contact_person: '',
    email: '',
    phone: '',
    operating_notes: ''
  });

  // Fetch outlets and categories
  useEffect(() => {
    fetchOutlets();
    fetchCategories();
  }, []);

  const fetchOutlets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/outlets/');
      if (response.ok) {
        const data = await response.json();
        setOutlets(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/outlets/categories/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddOutlet = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/outlets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({
          name: '', category: '', address: '', latitude: '', longitude: '',
          contact_person: '', email: '', phone: '', operating_notes: ''
        });
        fetchOutlets();
      } else {
        const error = await response.json();
        alert('Error adding outlet: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error adding outlet:', error);
      alert('Error adding outlet');
    }
  };

  const handleEditOutlet = (outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      category: outlet.category,
      address: outlet.address,
      latitude: outlet.latitude.toString(),
      longitude: outlet.longitude.toString(),
      contact_person: outlet.contact_person || '',
      email: outlet.email || '',
      phone: outlet.phone || '',
      operating_notes: outlet.operating_notes || ''
    });
  };

  const handleUpdateOutlet = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/outlets/${editingOutlet.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });

      if (response.ok) {
        setEditingOutlet(null);
        setFormData({
          name: '', category: '', address: '', latitude: '', longitude: '',
          contact_person: '', email: '', phone: '', operating_notes: ''
        });
        fetchOutlets();
      } else {
        const error = await response.json();
        alert('Error updating outlet: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error updating outlet:', error);
      alert('Error updating outlet');
    }
  };

  const handleRemoveOutlet = async (outletId) => {
    if (!confirm('Are you sure you want to remove this outlet?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/outlets/${outletId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOutlets();
      } else {
        alert('Error removing outlet');
      }
    } catch (error) {
      console.error('Error removing outlet:', error);
      alert('Error removing outlet');
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Outlet Management">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Outlet Management">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Outlets</h2>
            <p className="text-gray-600">{outlets.length} outlets registered</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Outlet</span>
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingOutlet) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingOutlet ? 'Edit Outlet' : 'Add New Outlet'}
              </h3>
              <form onSubmit={editingOutlet ? handleUpdateOutlet : handleAddOutlet} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outlet Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Notes
                  </label>
                  <textarea
                    value={formData.operating_notes}
                    onChange={(e) => setFormData({...formData, operating_notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingOutlet ? 'Update' : 'Add'} Outlet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingOutlet(null);
                      setFormData({
                        name: '', category: '', address: '', latitude: '', longitude: '',
                        contact_person: '', email: '', phone: '', operating_notes: ''
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

        {/* Outlets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => (
            <div key={outlet.id} className="card hover:shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{outlet.name}</h3>
                  <span className="badge badge-primary">{outlet.category_name || 'Unknown'}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditOutlet(outlet)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleRemoveOutlet(outlet.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{outlet.address}</span>
                </div>

                {outlet.contact_person && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Contact:</span>
                    <span>{outlet.contact_person}</span>
                  </div>
                )}

                {outlet.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} />
                    <span>{outlet.phone}</span>
                  </div>
                )}

                {outlet.email && (
                  <div className="flex items-center space-x-2">
                    <Mail size={16} />
                    <span>{outlet.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <strong>Coordinates:</strong> {outlet.latitude.toFixed(6)}, {outlet.longitude.toFixed(6)}
                </div>
                {outlet.operating_notes && (
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Notes:</strong> {outlet.operating_notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};