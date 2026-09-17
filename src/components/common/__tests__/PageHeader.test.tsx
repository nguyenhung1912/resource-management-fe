import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Files } from 'lucide-react';
import { PageHeader } from '../PageHeader';

describe('PageHeader component', () => {
  it('render tiêu đề và mô tả chính xác', () => {
    render(<PageHeader title="Quản lý Tài nguyên" description="Theo dõi và kiểm tra tài liệu học tập." />);

    expect(screen.getByRole('heading', { level: 1, name: 'Quản lý Tài nguyên' })).toBeInTheDocument();
    expect(screen.getByText('Theo dõi và kiểm tra tài liệu học tập.')).toBeInTheDocument();
  });

  it('render icon và áp dụng iconBg tùy chỉnh', () => {
    const { container } = render(<PageHeader title="Tiêu đề test" icon={Files} iconBg="bg-amber-50 text-warning" />);

    const iconWrapper = container.querySelector('.bg-amber-50');
    expect(iconWrapper).toBeInTheDocument();
    expect(iconWrapper).toHaveClass('text-warning');
  });

  it('render badge và action buttons trong các slot tương ứng', () => {
    render(
      <PageHeader
        title="Tiêu đề có action"
        badge={<span data-testid="test-badge">Badge Test</span>}
        actions={<button type="button">Nút Hành Động</button>}
      />,
    );

    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nút Hành Động' })).toBeInTheDocument();
  });
});
