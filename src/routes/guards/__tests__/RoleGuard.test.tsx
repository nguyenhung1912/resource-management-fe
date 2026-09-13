import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { RoleGuard } from '../RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';

const defaultAuthState = {
  user: { id: 'test-1', username: 'lecturer_user', displayName: 'Lecturer', role: 'LECTURER' },
  token: 'valid-token',
  isAuthenticated: true,
  isLoading: false,
};

describe('RoleGuard', () => {
  beforeEach(() => {
    useAuthStore.setState(defaultAuthState);
  });

  afterEach(() => {
    useAuthStore.setState(defaultAuthState);
  });

  it('renders children when user has an allowed role', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/resources',
          element: (
            <RoleGuard allowedRoles={['ADMIN', 'LECTURER']}>
              <h1>Lecturer Resources</h1>
            </RoleGuard>
          ),
        },
      ],
      { initialEntries: ['/resources'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Lecturer Resources' })).toBeInTheDocument();
  });

  it('redirects to /403 when user role is not in allowedRoles', () => {
    useAuthStore.setState({
      user: { id: 'test-2', username: 'student_user', displayName: 'Student', role: 'STUDENT' },
      token: 'valid-token',
      isAuthenticated: true,
    });

    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: (
            <RoleGuard allowedRoles={['ADMIN']}>
              <h1>Admin Only</h1>
            </RoleGuard>
          ),
        },
        {
          path: APP_PATHS.FORBIDDEN,
          element: <h1>Forbidden Page</h1>,
        },
      ],
      { initialEntries: ['/admin'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Forbidden Page' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(APP_PATHS.FORBIDDEN);
  });

  it('redirects to /403 when user is null', () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });

    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: (
            <RoleGuard allowedRoles={['ADMIN']}>
              <h1>Admin Only</h1>
            </RoleGuard>
          ),
        },
        {
          path: APP_PATHS.FORBIDDEN,
          element: <h1>Forbidden Page</h1>,
        },
      ],
      { initialEntries: ['/admin'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Forbidden Page' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(APP_PATHS.FORBIDDEN);
  });
});
