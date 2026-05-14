import React, { createContext, useState, useEffect, useCallback } from 'react';
import { request } from '../services/httpClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const userData = await request('/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Token verification error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await request('/api/auth/token/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const newToken = data.access;

      setToken(newToken);
      localStorage.setItem('token', newToken);

      // Fetch user details
      const userData = await request('/api/users/me/', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
