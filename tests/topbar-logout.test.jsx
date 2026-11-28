import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import authReducer from '../src/features/auth/authSlice';
import storesReducer from '../src/features/stores/storeSlice';
import Topbar from '../src/features/layout/Topbar';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  };
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('Topbar logout', () => {
  it('memanggil endpoint logout untuk mencabut refresh cookie sebelum membersihkan sesi lokal', async () => {
    localStorage.setItem('token', 'access-token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { status: 'success', data: null }));
    vi.stubGlobal('fetch', fetchMock);
    const store = configureStore({
      reducer: { auth: authReducer, stores: storesReducer },
      preloadedState: {
        auth: { user: null, token: 'access-token', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<Topbar />} />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /toko saya/i }));
    fireEvent.click(screen.getByRole('button', { name: /keluar/i }));

    expect(await screen.findByText('Login')).toBeInTheDocument();
    const logoutCalls = fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/logout'));
    expect(logoutCalls).toHaveLength(1);
    expect(logoutCalls[0][1].credentials).toBe('include');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
