const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function parseResponse(res) {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      throw new Error('Invalid server response');
    }
  }
  return data;
}

let refreshPromise = null;

async function performRefresh() {
  let res;
  try {
    res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  } catch (cause) {
    const err = new Error('Gagal memperbarui sesi. Coba lagi.', { cause });
    err.code = 'REFRESH_NETWORK_ERROR';
    throw err;
  }

  const data = await parseResponse(res);
  if (!res.ok) {
    const err = new Error(data.message || 'Refresh token gagal');
    err.code = [401, 403].includes(res.status) ? 'REFRESH_AUTH_FAILED' : 'REFRESH_SERVER_ERROR';
    throw err;
  }
  const token = data.data?.token;
  if (!token) {
    const err = new Error('Refresh token tidak mengembalikan access token');
    err.code = 'REFRESH_SERVER_ERROR';
    throw err;
  }
  localStorage.setItem('token', token);
  return token;
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function request(endpoint, options = {}, canRetry = true) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: endpoint.startsWith('/auth/') ? 'include' : 'omit',
    headers,
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    const authEndpointWithoutRefresh = ['/auth/login', '/auth/register', '/auth/google', '/auth/facebook', '/auth/refresh', '/auth/logout'].includes(endpoint);
    if (res.status === 401 && canRetry && token && !authEndpointWithoutRefresh) {
      try {
        await refreshAccessToken();
      } catch (err) {
        if (err.code === 'REFRESH_AUTH_FAILED') {
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('auth:session-expired'));
          throw new Error('Sesi berakhir. Silakan login ulang.', { cause: err });
        }
        throw new Error('Gagal memperbarui sesi. Coba lagi.', { cause: err });
      }
      return request(endpoint, options, false);
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;
