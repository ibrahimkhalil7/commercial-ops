const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

const toJsonIfPresent = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return response.json();
};

export const getToken = () => localStorage.getItem('token');

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const payload = await toJsonIfPresent(response);

  if (!response.ok) {
    const detail = payload?.detail || payload?.message || 'Request failed';
    const error = new Error(detail);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};
