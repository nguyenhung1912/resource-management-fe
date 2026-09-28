import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SourceFileLinkCell } from '../SourceFileLinkCell';
import { APP_PATHS } from '@/constants/path';

describe('SourceFileLinkCell', () => {
  it('render link chi tiết và nút tải file khi có sourceFileId', () => {
    render(<SourceFileLinkCell sourceFileId="FIL_SAMPLE_001" sourceFileName="Khóa luận Tốt nghiệp - AI trong Y tế" />);

    // Tên file hiển thị
    const detailLink = screen.getByRole('link', { name: /Khóa luận Tốt nghiệp - AI trong Y tế/i });
    expect(detailLink).toBeInTheDocument();
    expect(detailLink).toHaveAttribute('title', 'Xem chi tiết tài liệu: Khóa luận Tốt nghiệp - AI trong Y tế');
    expect(detailLink).toHaveAttribute('href', APP_PATHS.RESOURCE_DETAIL('FIL_SAMPLE_001'));
    expect(detailLink).toHaveAttribute('target', '_blank');
    expect(detailLink).toHaveAttribute('rel', 'noopener noreferrer');

    // ID hiển thị
    expect(screen.getByText('ID: FIL_SAMPLE_001')).toBeInTheDocument();

    // Nút tải file gốc
    const downloadLink = screen.getByRole('link', { name: /Tải file gốc/i });
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/api/Resources/FIL_SAMPLE_001/download');
  });

  it('render an toàn khi không có sourceFileId', () => {
    render(<SourceFileLinkCell sourceFileId="" sourceFileName="Tài liệu tham khảo ẩn danh" />);

    expect(screen.getByText('Tài liệu tham khảo ẩn danh')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Xem chi tiết tài liệu/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Tải file gốc/i })).not.toBeInTheDocument();
    expect(screen.getByText('Tài liệu tham khảo đối chiếu')).toBeInTheDocument();
  });
});
