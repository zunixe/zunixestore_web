import { describe, it, expect, vi, afterEach } from 'vitest';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  };
}

async function loadApi() {
  vi.resetModules();
  const mod = await import('../src/utils/api.js');
  return mod.default;
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('api auth session', () => {




  it('request non-auth tidak mengirim credentials agar tetap cocok dengan CORS wildcard', async () => {
    localStorage.setItem('token', 'valid-token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const api = await loadApi();
    await api.get('/stores');

    expect(fetchMock.mock.calls[0][1].credentials).toBe('omit');
  });

  it('gangguan network saat refresh tidak membersihkan sesi lokal', async () => {
    localStorage.setItem('token', 'expired-token');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Token expired' }))
      .mockRejectedValueOnce(new TypeError('network down'));
    vi.stubGlobal('fetch', fetchMock);
    const listener = vi.fn();
    window.addEventListener('auth:session-expired', listener);

    const api = await loadApi();
    await expect(api.get('/auth/me')).rejects.toThrow('Gagal memperbarui sesi');

    expect(localStorage.getItem('token')).toBe('expired-token');
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('auth:session-expired', listener);
  });

  it('refresh gagal membersihkan token dan mengirim event session expired', async () => {
    localStorage.setItem('token', 'expired-token');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Token expired' }))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Refresh token invalid atau expired' }));
    vi.stubGlobal('fetch', fetchMock);
    const listener = vi.fn();
    window.addEventListener('auth:session-expired', listener);

    const api = await loadApi();
    await expect(api.get('/auth/me')).rejects.toThrow('Sesi berakhir');

    expect(localStorage.getItem('token')).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    window.removeEventListener('auth:session-expired', listener);
  });

  it('request 401 bersamaan berbagi satu refresh request', async () => {
    localStorage.setItem('token', 'expired-token');
    const counts = {};
    const fetchMock = vi.fn((url) => {
      if (url.endsWith('/auth/refresh')) {
        return Promise.resolve(jsonResponse(200, { data: { token: 'fresh-token' } }));
      }
      counts[url] = (counts[url] || 0) + 1;
      if (counts[url] === 1) return Promise.resolve(jsonResponse(401, { message: 'Token expired' }));
      return Promise.resolve(jsonResponse(200, { data: { ok: true } }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const api = await loadApi();
    const results = await Promise.all([api.get('/auth/me'), api.get('/stores')]);

    expect(results).toHaveLength(2);
    const refreshCalls = fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
    expect(localStorage.getItem('token')).toBe('fresh-token');
  });

  it('refresh access token lewat cookie lalu mengulang request saat token expired', async () => {
    localStorage.setItem('token', 'expired-token');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Token expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { data: { token: 'fresh-token' } }))
      .mockResolvedValueOnce(jsonResponse(200, { data: { email: 'owner@zunixe.test' } }));
    vi.stubGlobal('fetch', fetchMock);

    const api = await loadApi();
    const result = await api.get('/auth/me');

    expect(result.data.email).toBe('owner@zunixe.test');
    expect(fetchMock).toHaveBeenCalledTimes(3);

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE}/auth/me`);
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer expired-token');

    expect(fetchMock.mock.calls[1][0]).toBe(`${API_BASE}/auth/refresh`);
    expect(fetchMock.mock.calls[1][1].method).toBe('POST');
    expect(fetchMock.mock.calls[1][1].credentials).toBe('include');

    expect(localStorage.getItem('token')).toBe('fresh-token');
    expect(fetchMock.mock.calls[2][0]).toBe(`${API_BASE}/auth/me`);
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer fresh-token');
  });
});
