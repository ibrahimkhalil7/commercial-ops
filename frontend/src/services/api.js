/**
 * API Service
 * Handles all backend API requests with authentication
 */

const API_BASE = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiService = {
  // Auth
  login: (email, password) =>
    fetch(`${API_BASE}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  getMe: () =>
    fetch(`${API_BASE}/users/me/`, {
      headers: getAuthHeader(),
    }).then(r => r.json()),

  // Users
  getUsers: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE}/users/?${params}`, {
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  getUser: (id) =>
    fetch(`${API_BASE}/users/${id}/`, {
      headers: getAuthHeader(),
    }).then(r => r.json()),

  // Outlets
  getOutlets: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE}/outlets/?${params}`, {
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  getOutlet: (id) =>
    fetch(`${API_BASE}/outlets/${id}/`, {
      headers: getAuthHeader(),
    }).then(r => r.json()),

  // Routes
  getRoutes: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE}/routes/?${params}`, {
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  getRoute: (id) =>
    fetch(`${API_BASE}/routes/${id}/`, {
      headers: getAuthHeader(),
    }).then(r => r.json()),

  // Visits
  getVisits: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE}/visits/?${params}`, {
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  // Notices
  getNotices: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE}/notices/?${params}`, {
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  // Maintenance
  getTickets: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE}/maintenance/?${params}`, {
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  // Reports
  getDailyReport: (date) =>
    fetch(`${API_BASE}/reporting/daily-report/?date=${date}`, {
      headers: getAuthHeader(),
    }).then(r => r.json()),
};
