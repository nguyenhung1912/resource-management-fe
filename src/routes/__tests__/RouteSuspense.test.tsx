import { act, render, screen } from '@testing-library/react';
import { lazy, type ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { RouteSuspense } from '../RouteSuspense';

describe('RouteSuspense', () => {
  it('shows the shared loading state until the lazy page resolves', async () => {
    let resolvePage: ((module: { default: ComponentType }) => void) | undefined;
    const LazyPage = lazy(
      () =>
        new Promise<{ default: ComponentType }>((resolve) => {
          resolvePage = resolve;
        }),
    );

    render(
      <RouteSuspense>
        <LazyPage />
      </RouteSuspense>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải trang...');

    await act(async () => {
      resolvePage?.({ default: () => <h1>Lazy page loaded</h1> });
    });

    expect(await screen.findByRole('heading', { name: 'Lazy page loaded' })).toBeInTheDocument();
  });
});
