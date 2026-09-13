import { act, render, screen } from '@testing-library/react';
import { lazy, type ComponentType } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

describe('Layout Suspense Boundaries', () => {
  it('MainLayout renders PageLoadingState while lazy child resolves', async () => {
    let resolvePage: ((module: { default: ComponentType }) => void) | undefined;
    const LazyPage = lazy(
      () =>
        new Promise<{ default: ComponentType }>((resolve) => {
          resolvePage = resolve;
        }),
    );

    const router = createMemoryRouter([
      {
        path: '/',
        element: <MainLayout />,
        children: [{ index: true, element: <LazyPage /> }],
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải trang...');

    await act(async () => {
      resolvePage?.({ default: () => <h1>Main child loaded</h1> });
    });

    expect(await screen.findByRole('heading', { name: 'Main child loaded' })).toBeInTheDocument();
  });

  it('DashboardLayout renders PageLoadingState while lazy child resolves', async () => {
    let resolvePage: ((module: { default: ComponentType }) => void) | undefined;
    const LazyPage = lazy(
      () =>
        new Promise<{ default: ComponentType }>((resolve) => {
          resolvePage = resolve;
        }),
    );

    const router = createMemoryRouter(
      [
        {
          path: '/dashboard',
          element: <DashboardLayout />,
          children: [{ index: true, element: <LazyPage /> }],
        },
      ],
      { initialEntries: ['/dashboard'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải trang...');

    await act(async () => {
      resolvePage?.({ default: () => <h1>Dashboard child loaded</h1> });
    });

    expect(await screen.findByRole('heading', { name: 'Dashboard child loaded' })).toBeInTheDocument();
  });
});
