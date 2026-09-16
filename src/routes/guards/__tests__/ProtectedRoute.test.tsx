import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

import { ProtectedRoute } from '../ProtectedRoute';

const authenticatedState = {
  user: {
    uid: 'test-1',
    userCode: 'tester',
    fullName: 'Tester',
    email: 'tester@example.com',
    roleId: 3,
    role: 'Lecturer',
  },
  token: 'valid-token',
  expiration: '2099-12-31T23:59:59Z',
  isAuthenticated: true,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

const unauthenticatedState = {
  user: null,
  token: null,
  expiration: null,
  isAuthenticated: false,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
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
      {
        initialEntries: ['/protected'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', {
        name: 'Protected Content',
      }),
    ).toBeInTheDocument();
  });

  it('redirects to /login?redirect=... when user is not authenticated', () => {
    useAuthStore.setState(unauthenticatedState);

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
      {
        initialEntries: ['/dashboard/resources-manager?filter=active'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', {
        name: 'Login Page',
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe(APP_PATHS.LOGIN);

    expect(router.state.location.search).toBe('?redirect=%2Fdashboard%2Fresources-manager%3Ffilter%3Dactive');
  });

  it('does not append redirect query when unauthenticated path is root', () => {
    useAuthStore.setState(unauthenticatedState);

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
      {
        initialEntries: ['/'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', {
        name: 'Login Page',
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe(APP_PATHS.LOGIN);

    expect(router.state.location.search).toBe('');
  });
});
