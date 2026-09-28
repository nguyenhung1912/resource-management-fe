import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

import { GuestRoute } from '../GuestRoute';

const authenticatedState = {
  user: {
    uid: 'test-1',
    userCode: 'tester',
    fullName: 'Tester',
    email: 'tester@example.com',
    roleId: 3,
    role: 'Student',
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

describe('GuestRoute', () => {
  beforeEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  it('renders children when user is not authenticated', () => {
    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.LOGIN,
          element: (
            <GuestRoute>
              <h1>Login Form Page</h1>
            </GuestRoute>
          ),
        },
      ],
      {
        initialEntries: [APP_PATHS.LOGIN],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Login Form Page' })).toBeInTheDocument();
  });

  it('renders Outlet when user is not authenticated and children prop is omitted', () => {
    const router = createMemoryRouter(
      [
        {
          element: <GuestRoute />,
          children: [
            {
              path: APP_PATHS.LOGIN,
              element: <h1>Outlet Login Page</h1>,
            },
          ],
        },
      ],
      {
        initialEntries: [APP_PATHS.LOGIN],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Outlet Login Page' })).toBeInTheDocument();
  });

  it('redirects to APP_PATHS.DASHBOARD when user is authenticated without redirect query', () => {
    useAuthStore.setState(authenticatedState);

    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.LOGIN,
          element: (
            <GuestRoute>
              <h1>Login Form Page</h1>
            </GuestRoute>
          ),
        },
        {
          path: APP_PATHS.DASHBOARD,
          element: <h1>Dashboard Hub</h1>,
        },
      ],
      {
        initialEntries: [APP_PATHS.LOGIN],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Dashboard Hub' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(APP_PATHS.DASHBOARD);
  });

  it('redirects to custom redirect query target when user is authenticated', () => {
    useAuthStore.setState(authenticatedState);

    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.LOGIN,
          element: (
            <GuestRoute>
              <h1>Login Form Page</h1>
            </GuestRoute>
          ),
        },
        {
          path: APP_PATHS.APPEALS,
          element: <h1>My Appeals Page</h1>,
        },
      ],
      {
        initialEntries: [`${APP_PATHS.LOGIN}?redirect=${encodeURIComponent(APP_PATHS.APPEALS)}`],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'My Appeals Page' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(APP_PATHS.APPEALS);
  });
});
