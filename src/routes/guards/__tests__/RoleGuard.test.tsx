import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

import { RoleGuard } from '../RoleGuard';

const authenticatedState = {
  user: {
    uid: 'test-1',
    userCode: 'lecturer_user',
    fullName: 'Lecturer User',
    email: 'lecturer@test.com',
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

describe('RoleGuard', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  it('renders children when user has an allowed role', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/resources',
          element: (
            <RoleGuard allowedRoles={['Admin', 'Lecturer']}>
              <h1>Lecturer Resources</h1>
            </RoleGuard>
          ),
        },
      ],
      {
        initialEntries: ['/resources'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', {
        name: 'Lecturer Resources',
      }),
    ).toBeInTheDocument();
  });

  it('redirects to /403 when user role is not in allowedRoles', () => {
    useAuthStore.setState({
      user: {
        uid: 'test-2',
        userCode: 'student_user',
        fullName: 'Student User',
        email: 'student@test.com',
        roleId: 2,
        role: 'Student',
      },
      token: 'valid-token',
      expiration: '2099-12-31T23:59:59Z',
      isAuthenticated: true,
      isLoading: false,
    });

    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: (
            <RoleGuard allowedRoles={['Admin']}>
              <h1>Admin Only</h1>
            </RoleGuard>
          ),
        },
        {
          path: APP_PATHS.FORBIDDEN,
          element: <h1>Forbidden Page</h1>,
        },
      ],
      {
        initialEntries: ['/admin'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', {
        name: 'Forbidden Page',
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe(APP_PATHS.FORBIDDEN);
  });

  it('redirects to /403 when user is null', () => {
    useAuthStore.setState(unauthenticatedState);

    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: (
            <RoleGuard allowedRoles={['Admin']}>
              <h1>Admin Only</h1>
            </RoleGuard>
          ),
        },
        {
          path: APP_PATHS.FORBIDDEN,
          element: <h1>Forbidden Page</h1>,
        },
      ],
      {
        initialEntries: ['/admin'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', {
        name: 'Forbidden Page',
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe(APP_PATHS.FORBIDDEN);
  });
});
