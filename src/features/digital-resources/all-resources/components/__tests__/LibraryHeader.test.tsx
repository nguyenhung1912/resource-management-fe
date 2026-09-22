import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { LibraryHeader } from '../LibraryHeader';

describe('LibraryHeader', () => {
  it('render đầy đủ tiêu đề, mô tả và nút đăng tải tài nguyên', () => {
    render(
      <MemoryRouter>
        <LibraryHeader totalCount={1248} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Thư viện Tài nguyên Số' })).toBeInTheDocument();
    expect(screen.getByText(/Khám phá, tra cứu và tải xuống học liệu, giáo trình/i)).toBeInTheDocument();
    expect(screen.getByText('1.248 tài liệu')).toBeInTheDocument();

    const uploadLink = screen.getByRole('link', { name: /đăng tải tài nguyên/i });
    expect(uploadLink).toHaveAttribute('href', APP_PATHS.RESOURCE_UPLOAD);
  });

  it('hiển thị badge thể loại đang được chọn nếu có', () => {
    render(
      <MemoryRouter>
        <LibraryHeader totalCount={45} activeCategoryName="Bài giảng & Giáo trình" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Bài giảng & Giáo trình')).toBeInTheDocument();
    expect(screen.getByText('45 tài liệu')).toBeInTheDocument();
  });

  it('gọi callback onRefresh khi người dùng nhấn nút Làm mới', () => {
    const handleRefresh = vi.fn();

    render(
      <MemoryRouter>
        <LibraryHeader onRefresh={handleRefresh} />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole('button', { name: /làm mới/i });
    fireEvent.click(refreshButton);

    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('vô hiệu hóa nút Làm mới khi đang refreshing', () => {
    const handleRefresh = vi.fn();

    render(
      <MemoryRouter>
        <LibraryHeader onRefresh={handleRefresh} isRefreshing={true} />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole('button', { name: /làm mới/i });
    expect(refreshButton).toBeDisabled();
  });
});
