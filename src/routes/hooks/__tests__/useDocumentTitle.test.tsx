import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useDocumentTitle } from '../useDocumentTitle';

function TitleTestComponent() {
  useDocumentTitle('Default Title');
  return <h1>Title Tester</h1>;
}

describe('useDocumentTitle', () => {
  it('updates document.title based on route meta title', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/notifications',
          element: <TitleTestComponent />,
          handle: { meta: { title: 'Trung tâm thông báo' } },
        },
      ],
      { initialEntries: ['/notifications'] },
    );

    render(<RouterProvider router={router} />);

    expect(document.title).toBe('Trung tâm thông báo | Resource Management System');
  });

  it('falls back to fallbackTitle when route has no meta title', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/no-title',
          element: <TitleTestComponent />,
        },
      ],
      { initialEntries: ['/no-title'] },
    );

    render(<RouterProvider router={router} />);

    expect(document.title).toBe('Default Title');
  });
});
