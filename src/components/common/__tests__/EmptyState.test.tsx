import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Search } from 'lucide-react';
import { EmptyState } from '../EmptyState';

describe('EmptyState component', () => {
  it('render tiêu đề và mô tả trạng thái rỗng', () => {
    render(
      <EmptyState
        title="Không tìm thấy tài liệu"
        description="Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc tìm kiếm."
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Không tìm thấy tài liệu' })).toBeInTheDocument();
    expect(screen.getByText('Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc tìm kiếm.')).toBeInTheDocument();
  });

  it('render icon tùy chọn và nút hành động', () => {
    render(<EmptyState icon={Search} title="Không có kết quả" action={<button type="button">Đặt lại</button>} />);

    expect(screen.getByRole('button', { name: 'Đặt lại' })).toBeInTheDocument();
  });
});
