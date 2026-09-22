import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  matchRoutes,
  RouterProvider,
  type NonIndexRouteObject,
  type RouteObject,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_PATHS, ROUTE_SEGMENTS } from '@/constants/path';
import { authRoutes } from '@/routes/authRoutes';
import { dashboardRoutes } from '@/routes/dashboardRoutes';
import { mainRoutes } from '@/routes/mainRoutes';
import { useAuthStore } from '@/store/authStore';

const authenticatedState = {
  user: {
    uid: 'test-1',
    userCode: 'admin_test',
    fullName: 'Test Admin',
    email: 'admin@test.com',
    roleId: 1,
    role: 'Admin',
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

vi.mock('@/services/signalRService', () => ({
  default: {
    start: vi.fn().mockResolvedValue(undefined),
    onReceiveNotification: vi.fn(() => vi.fn()),
    onUnreadCountChanged: vi.fn(() => vi.fn()),
  },
}));

describe('main route configuration', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  it('matches APP_PATHS.HOME', () => {
    expect(matchRoutes(mainRoutes, APP_PATHS.HOME)).not.toBeNull();
  });

  it('renders the server error page when a child loader throws', async () => {
    const rootRoute = dashboardRoutes[0] as NonIndexRouteObject;
    const routesWithFailure: RouteObject[] = [
      {
        ...rootRoute,
        children: [
          {
            index: true,
            loader: () => {
              throw new Error('main loader failed');
            },
          },
        ],
      },
    ];
    const router = createMemoryRouter(routesWithFailure, {
      initialEntries: [APP_PATHS.DASHBOARD],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Đã xảy ra lỗi hệ thống' })).toBeInTheDocument();
  });
});

describe('dashboard route configuration', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  it.each([
    APP_PATHS.DASHBOARD,
    APP_PATHS.RESOURCES_MANAGER,
    APP_PATHS.RESOURCE_UPLOAD,
    APP_PATHS.MODERATION_DETAIL('FIL_TEST'),
    APP_PATHS.SOURCE_CODE,
    APP_PATHS.NOTIFICATIONS,
    APP_PATHS.APPEALS,
    APP_PATHS.ASSIGNED_APPEALS,
    APP_PATHS.PROFILE,
    APP_PATHS.CHANGE_PASSWORD,
  ])('matches %s', (path) => {
    expect(matchRoutes(dashboardRoutes, path)).not.toBeNull();
  });

  it('renders the dashboard home content for an authenticated user', async () => {
    const router = createMemoryRouter(dashboardRoutes, {
      initialEntries: [APP_PATHS.DASHBOARD],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Cổng Quản lý Tài nguyên Học liệu Số' })).toBeInTheDocument();
  });

  it('redirects the original home URL to the dashboard home page', async () => {
    const router = createMemoryRouter([...mainRoutes, ...dashboardRoutes], {
      initialEntries: [APP_PATHS.HOME],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(APP_PATHS.DASHBOARD);
    });
  });

  it('renders the server error page when a dashboard child loader throws', async () => {
    const rootRoute = dashboardRoutes[0];
    if (rootRoute.index) {
      throw new Error('Expected the dashboard root route to contain child routes');
    }

    const routesWithFailure: RouteObject[] = [
      {
        ...rootRoute,
        children: rootRoute.children?.map((route) =>
          route.path === ROUTE_SEGMENTS.RESOURCES_MANAGER
            ? {
                ...route,
                loader: () => {
                  throw new Error('dashboard loader failed');
                },
              }
            : route,
        ),
      },
    ];
    const router = createMemoryRouter(routesWithFailure, {
      initialEntries: [APP_PATHS.RESOURCES_MANAGER],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Đã xảy ra lỗi hệ thống' })).toBeInTheDocument();
  });
});

describe('auth route configuration', () => {
  it('matches /login', () => {
    expect(matchRoutes(authRoutes, APP_PATHS.LOGIN)).not.toBeNull();
  });
});
