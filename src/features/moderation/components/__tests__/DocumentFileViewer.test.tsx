import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentFileViewer } from '../DocumentFileViewer';

describe('DocumentFileViewer', () => {
  it('render iframe xem trước khi có fileUrl', () => {
    render(
      <DocumentFileViewer
        fileId="FIL_001"
        fileName="Báo cáo NCKH.pdf"
        fileUrl="https://example.com/files/report.pdf"
      />,
    );

    expect(screen.getByText('Báo cáo NCKH.pdf')).toBeInTheDocument();
    const iframe = screen.getByTitle('Trình xem tài liệu: Báo cáo NCKH.pdf');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com/files/report.pdf');

    const openTabLink = screen.getByRole('link', { name: /Mở tab mới/i });
    expect(openTabLink).toHaveAttribute('href', 'https://example.com/files/report.pdf');
    expect(openTabLink).toHaveAttribute('target', '_blank');

    const downloadLink = screen.getByRole('link', { name: /Tải về/i });
    expect(downloadLink).toHaveAttribute('href', 'https://example.com/files/report.pdf');
  });

  it('chuyển đổi chế độ toàn màn hình khi người dùng nhấn nút fullscreen toggle', () => {
    render(
      <DocumentFileViewer
        fileId="FIL_001"
        fileName="Báo cáo NCKH.pdf"
        fileUrl="https://example.com/files/report.pdf"
      />,
    );

    const toggleBtn = screen.getByRole('button', { name: 'Xem toàn màn hình' });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: 'Thu nhỏ cửa sổ xem' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Thu nhỏ cửa sổ xem' }));
    expect(screen.getByRole('button', { name: 'Xem toàn màn hình' })).toBeInTheDocument();
  });

  it('hiển thị thông báo và nút tải API khi fileUrl không tồn tại', () => {
    render(<DocumentFileViewer fileId="FIL_EMPTY" fileName="Chưa có file.pdf" />);

    expect(screen.getByText('Không thể hiển thị xem trước trực tiếp')).toBeInTheDocument();
    expect(screen.getByText(/Tài liệu chưa có đường dẫn xem trước trực tuyến khả dụng/i)).toBeInTheDocument();

    const apiDownloadLink = screen.getByRole('link', { name: /Tải tài liệu gốc về máy/i });
    expect(apiDownloadLink).toHaveAttribute('href', '/api/Resources/FIL_EMPTY/download');
  });
});
