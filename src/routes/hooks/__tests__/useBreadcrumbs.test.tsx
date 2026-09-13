import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useBreadcrumbs } from '../useBreadcrumbs';

function BreadcrumbsInspector() {
  const crumbs = useBreadcrumbs();
  return (
    <div>
      {crumbs.map((c) => (
        <span key={c.path} data-testid="crumb">
          {c.label}:{c.path}:{c.isCurrent ? 'current' : 'parent'}
        </span>
      ))}
    </div>
  );
}

describe('useBreadcrumbs', () => {
  it('generates breadcrumbs from route hierarchy declaring handle.breadcrumb', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/dashboard',
          handle: { meta: { breadcrumb: 'Dashboard' } },
          children: [
            {
              path: 'resources-manager',
              handle: { meta: { breadcrumb: 'Tài nguyên' } },
              children: [
                {
                  path: 'upload',
                  element: <BreadcrumbsInspector />,
                  handle: { meta: { breadcrumb: 'Tải lên' } },
                },
              ],
            },
          ],
        },
      ],
      { initialEntries: ['/dashboard/resources-manager/upload'] },
    );

    render(<RouterProvider router={router} />);

    const crumbs = screen.getAllByTestId('crumb');
    expect(crumbs).toHaveLength(3);
    expect(crumbs[0]).toHaveTextContent('Dashboard:/dashboard:parent');
    expect(crumbs[1]).toHaveTextContent('Tài nguyên:/dashboard/resources-manager:parent');
    expect(crumbs[2]).toHaveTextContent('Tải lên:/dashboard/resources-manager/upload:current');
  });

  it('filters out routes without handle.breadcrumb', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/unlabeled',
          children: [
            {
              path: 'child',
              element: <BreadcrumbsInspector />,
              handle: { meta: { breadcrumb: 'Child Only' } },
            },
          ],
        },
      ],
      { initialEntries: ['/unlabeled/child'] },
    );

    render(<RouterProvider router={router} />);

    const crumbs = screen.getAllByTestId('crumb');
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0]).toHaveTextContent('Child Only:/unlabeled/child:current');
  });
});
