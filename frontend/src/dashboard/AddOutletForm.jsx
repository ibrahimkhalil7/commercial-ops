import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AlertCircle } from 'lucide-react';

const API_BASE = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const AddOutletForm = () => {
  const navigate = useNavigate();
  const extractCoordinatesFromGoogleMapsUrl = (url) => {
    if (!url) return null;

    const decodedUrl = decodeURIComponent(url.trim());
    const patterns = [
      /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
      /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
      /[?&](?:q|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    ];

    for (const pattern of patterns) {
      const match = decodedUrl.match(pattern);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }
    }

    return null;
  };

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    google_maps_url: '',
    contact_person: '',
    email: '',
    phone: '',
    operating_notes: '',
  });

  const [categories, setCategories] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [outletsLoading, setOutletsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/outlets/categories/`, {
          headers: getAuthHeader(),
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data.results || data);
        } else {
          console.error('Error fetching categories:', response.status, response.statusText);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      setOutletsLoading(true);
      const response = await fetch(`${API_BASE}/outlets/`, {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setOutlets(data.results || data);
      } else {
        console.error('Error fetching outlets:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error fetching outlets:', err);
    } finally {
      setOutletsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.address || !formData.google_maps_url) {
        setError('Name, category, address, and Google Maps location are required.');
        setLoading(false);
        return;
      }

      const coordinates = extractCoordinatesFromGoogleMapsUrl(formData.google_maps_url);
      if (!coordinates) {
        setError('Please paste a valid Google Maps link that contains location coordinates.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/outlets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          address: formData.address,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          operating_notes: formData.operating_notes,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      });

      if (response.ok) {
        const newOutlet = await response.json();
        setSuccess(`Outlet "${newOutlet.name}" created successfully!`);
        fetchOutlets();
        // Reset form
        setFormData({
          name: '',
          category: '',
          address: '',
          google_maps_url: '',
          contact_person: '',
          email: '',
          phone: '',
          operating_notes: '',
        });
        // Redirect after 2 seconds
        setTimeout(() => navigate('/'), 2000);
      } else {
        const errorData = await response.json();
        setError(
          errorData.detail ||
          Object.values(errorData).flatMap((v) => (Array.isArray(v) ? v : [v])).join(', ') ||
          'Failed to create outlet.'
        );
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Add New Outlet">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Form Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Outlet</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Outlet Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Downtown Plaza"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Address */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Row 3: Google Maps URL */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Google Maps Location *
              </label>
              <input
                type="url"
                name="google_maps_url"
                value={formData.google_maps_url}
                onChange={handleChange}
                placeholder="Paste Google Maps share link"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Open Google Maps, choose location, click Share, and paste the link here.
              </p>
            </div>

            {/* Row 4: Contact Person and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Row 5: Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Row 6: Operating Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Operating Notes
              </label>
              <textarea
                name="operating_notes"
                value={formData.operating_notes}
                onChange={handleChange}
                placeholder="Any additional operating notes..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 py-3"
              >
                {loading ? 'Creating...' : 'Create Outlet'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary flex-1 py-3"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Fields marked with * are required. All other fields are optional.
          </p>
        </div>

        {/* Outlet Database View */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Outlets in Django Database</h3>
            <button
              type="button"
              onClick={fetchOutlets}
              className="btn btn-secondary text-sm px-3 py-1"
            >
              Refresh
            </button>
          </div>

          {outletsLoading ? (
            <div className="text-sm text-gray-600">Loading outlets...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Address</th>
                    <th className="py-2 pr-4">Coordinates</th>
                  </tr>
                </thead>
                <tbody>
                  {outlets.map((outlet) => (
                    <tr key={outlet.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium text-gray-900">{outlet.name}</td>
                      <td className="py-2 pr-4 text-gray-700">{outlet.category_name || '—'}</td>
                      <td className="py-2 pr-4 text-gray-700">{outlet.address}</td>
                      <td className="py-2 pr-4 text-gray-600">
                        {Number(outlet.latitude).toFixed(6)}, {Number(outlet.longitude).toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!outlets.length && (
                <p className="text-sm text-gray-500 py-3">No outlets found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
