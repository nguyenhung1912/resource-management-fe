import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

const defaultAuthState = {
  user: { id: 'test-1', username: 'tester', displayName: 'Tester', role: 'LECTURER' },
  token: 'valid-token',
  isAuthenticated: true,
  isLoading: false,
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState(defaultAuthState);
  });

  afterEach(() => {
    useAuthStore.setState(defaultAuthState);
  });

  it('renders children when user is authenticated', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/protected',
          element: (
            <ProtectedRoute>
              <h1>Protected Content</h1>
            </ProtectedRoute>
          ),
        },
      ],
      { initialEntries: ['/protected'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Protected Content' })).toBeInTheDocument();
  });

  it('redirects to /login?redirect=... when user is not authenticated', () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });

    const router = createMemoryRouter(
      [
        {
          path: '/dashboard/resources-manager',
          element: (
            <ProtectedRoute>
              <h1>Protected Dashboard</h1>
            </ProtectedRoute>
          ),
        },
        {
          path: APP_PATHS.LOGIN,
          element: <h1>Login Page</h1>,
        },
      ],
      { initialEntries: ['/dashboard/resources-manager?filter=active'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Login Page' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(APP_PATHS.LOGIN);
    expect(router.state.location.search).toBe('?redirect=%2Fdashboard%2Fresources-manager%3Ffilter%3Dactive');
  });

  it('does not append redirect query when unauthenticated path is root', () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <ProtectedRoute>
              <h1>Protected Root</h1>
            </ProtectedRoute>
          ),
        },
        {
          path: APP_PATHS.LOGIN,
          element: <h1>Login Page</h1>,
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Login Page' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(APP_PATHS.LOGIN);
    expect(router.state.location.search).toBe('');
  });
});
