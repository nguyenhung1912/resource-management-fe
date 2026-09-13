import { render, screen } from '@testing-library/react';
import { createMemoryRouter, matchRoutes, RouterProvider, type RouteObject } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { APP_PATHS, ROUTE_SEGMENTS } from '@/constants/path';
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

    const routesWithFailure: RouteObject[] = [
      {
        ...rootRoute,
        children: rootRoute.children?.map((route) =>
          route.path === ROUTE_SEGMENTS.NOTIFICATIONS
            ? {
                ...route,
                loader: () => {
                  throw new Error('loader failed');
                },
              }
            : route,
        ),
      },
    ];
    const router = createMemoryRouter(routesWithFailure, {
      initialEntries: [APP_PATHS.NOTIFICATIONS],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Đã xảy ra lỗi hệ thống' })).toBeInTheDocument();
  });
});
