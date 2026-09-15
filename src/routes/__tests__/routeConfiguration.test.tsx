import { render, screen } from '@testing-library/react';
import { createMemoryRouter, matchRoutes, RouterProvider, type RouteObject } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { APP_PATHS, ROUTE_SEGMENTS } from '@/constants/path';
import { authRoutes } from '@/routes/authRoutes';
import { dashboardRoutes } from '@/routes/dashboardRoutes';
import { mainRoutes } from '@/routes/mainRoutes';

vi.mock('@/services/signalRService', () => ({
  default: {
    start: vi.fn().mockResolvedValue(undefined),
    onReceiveNotification: vi.fn(() => vi.fn()),
    onUnreadCountChanged: vi.fn(() => vi.fn()),
  },
}));

describe('main route configuration', () => {
  it.each([APP_PATHS.HOME, APP_PATHS.NOTIFICATIONS, APP_PATHS.APPEALS, APP_PATHS.ASSIGNED_APPEALS])(
    'matches %s',
    (path) => {
      expect(matchRoutes(mainRoutes, path)).not.toBeNull();
    },
  );

  it('renders the server error page when a child loader throws', async () => {
    const rootRoute = mainRoutes[0];
    if (rootRoute.index) {
      throw new Error('Expected the main root route to contain child routes');
    }

    const injectFailingLoader = (routes?: RouteObject[]): RouteObject[] | undefined =>
      routes?.map((route) => {
        if (route.path === ROUTE_SEGMENTS.NOTIFICATIONS) {
          return {
            ...route,
            loader: () => {
              throw new Error('loader failed');
            },
          };
        }
        if (route.children) {
          return {
            ...route,
            children: injectFailingLoader(route.children),
          };
        }
        return route;
      });

    const routesWithFailure: RouteObject[] = [
      {
        ...rootRoute,
        children: injectFailingLoader(rootRoute.children),
      },
    ];
    const router = createMemoryRouter(routesWithFailure, {
      initialEntries: [APP_PATHS.NOTIFICATIONS],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Đã xảy ra lỗi hệ thống' })).toBeInTheDocument();
  });
});

describe('dashboard route configuration', () => {
  it.each([
    APP_PATHS.DASHBOARD,
    APP_PATHS.RESOURCES_MANAGER,
    APP_PATHS.RESOURCE_UPLOAD,
    APP_PATHS.MODERATION_DETAIL('FIL_TEST'),
  ])('matches %s', (path) => {
    expect(matchRoutes(dashboardRoutes, path)).not.toBeNull();
  });

  it('redirects from /dashboard to /dashboard/resources-manager', async () => {
    const router = createMemoryRouter(dashboardRoutes, {
      initialEntries: [APP_PATHS.DASHBOARD],
    });

    render(<RouterProvider router={router} />);

    expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER);
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
