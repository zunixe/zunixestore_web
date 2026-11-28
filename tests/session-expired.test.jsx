import { describe, it, expect, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import authReducer from '../src/features/auth/authSlice';
import SessionExpiredHandler from '../src/features/auth/SessionExpiredHandler';

function renderSessionApp(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <SessionExpiredHandler />
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

afterEach(() => localStorage.clear());

describe('SessionExpiredHandler', () => {
  it('logout dan redirect ke /login saat event auth:session-expired diterima', async () => {
    localStorage.setItem('token', 'expired-token');
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: { user: null, token: 'expired-token', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    renderSessionApp(store);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(store.getState().auth.isAuthenticated).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event('auth:session-expired'));
    });

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
