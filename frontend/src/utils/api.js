const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '/api').trim();

const normalizeBase = (base) => {
  if (!base) return '/api';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const API_BASE = normalizeBase(rawApiBase);

export const apiUrl = (path = '') => {
  const normalizedPath = String(path).trim() || '/';
  const pathWithSlash = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

  if (API_BASE.endsWith('/api') && pathWithSlash.startsWith('/api/')) {
    return `${API_BASE}${pathWithSlash.slice(4)}`;
  }

  return `${API_BASE}${pathWithSlash}`;
};

export const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const configureApiFetch = () => {
  if (window.__API_FETCH_CONFIGURED__) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return originalFetch(apiUrl(input), init);
    }

    if (input instanceof Request) {
      const requestUrl = new URL(input.url, window.location.origin);
      if (requestUrl.pathname.startsWith('/api/')) {
        const rewrittenUrl = `${apiUrl(requestUrl.pathname)}${requestUrl.search}`;
        const request = new Request(rewrittenUrl, input);
        return originalFetch(request, init);
      }
    }

    return originalFetch(input, init);
  };

  window.__API_FETCH_CONFIGURED__ = true;
};
