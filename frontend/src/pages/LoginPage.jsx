import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!credentials.email || !credentials.password) {
      setLocalError('Please enter both email and password');
      return;
    }

    const success = await login(credentials.email, credentials.password);

    if (success) {
      // Get redirect path based on user role
      // Wait a moment for the user context to be updated
      setTimeout(() => {
        const redirectPath = getRedirectPath();
        navigate(redirectPath);
      }, 100);
    } else {
      setLocalError(error || 'Login failed');
    }
  };

  const getRedirectPath = () => {
    // Get the user data from local storage since it was just saved
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      switch (user.role) {
        case 'outlet_manager':
          return '/outlet';
        case 'field_agent':
          return '/agent';
        case 'admin':
        case 'manager':
          return '/';
        default:
          return '/';
      }
    }
    return '/';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign In</h2>

        {/* Email Field */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            className="form-input"
            placeholder="you@elgouna.com"
            disabled={loading}
          />
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="form-input"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {(localError || error) && (
          <div className="alert alert-danger flex items-start space-x-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{localError || error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="spinner"></span>
              <span>Signing in...</span>
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Demo Credentials Note */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-600">
            <strong>Manager:</strong> manager@elgouna.com / password
          </p>
          <p className="text-xs text-gray-600">
            <strong>Agent:</strong> agent@elgouna.com / password
          </p>
          <p className="text-xs text-gray-600">
            <strong>Outlet:</strong> outlet@example.com / password
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
