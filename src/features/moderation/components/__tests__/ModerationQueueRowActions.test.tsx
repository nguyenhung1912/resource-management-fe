import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModerationQueueRowActions } from '../ModerationQueueRowActions';
import type { ModerationResourceItemResponse } from '../../types/moderation.types';

const mockItem: ModerationResourceItemResponse = {
  fileId: 'FIL_TEST_01',
  fileName: 'Nghiên cứu ứng dụng NLP',
  fileDescription: 'Mô tả tóm tắt',
  fileUrl: 'https://example.com/test.pdf',
  fileTypeId: 1,
  fileTypeName: 'Khóa luận',
  subMajorCode: 'CNTT_KTPM',
  subMajorName: 'Kỹ thuật phần mềm',
  uploaderName: 'Trần Văn B',
  uploaderEmail: 'tranvanb@example.com',
  fileStatusId: 1,
  fileStatusName: 'Pending',
  createdAt: '2026-09-20T10:00:00Z',
  latestPlagiarismScore: 12.5,
};

describe('ModerationQueueRowActions', () => {
  it('render đầy đủ các nút thao tác: Quét AI, Duyệt, Từ chối, Chi tiết', () => {
    render(
      <ModerationQueueRowActions
        item={mockItem}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: `Kích hoạt quét AI cho tài liệu ${mockItem.fileName}` }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Phê duyệt tài liệu ${mockItem.fileName}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Từ chối tài liệu ${mockItem.fileName}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Xem chi tiết tài liệu ${mockItem.fileName}` })).toBeInTheDocument();
  });

  it('gọi onCheckPlagiarism với fileId khi click nút Quét AI', () => {
    const handleCheck = vi.fn();
    render(
      <ModerationQueueRowActions
        item={mockItem}
        onCheckPlagiarism={handleCheck}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: `Kích hoạt quét AI cho tài liệu ${mockItem.fileName}` }));
    expect(handleCheck).toHaveBeenCalledWith('FIL_TEST_01');
  });

  it('gọi onApprove với item khi click nút Duyệt', () => {
    const handleApprove = vi.fn();
    render(
      <ModerationQueueRowActions
        item={mockItem}
        onCheckPlagiarism={vi.fn()}
        onApprove={handleApprove}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: `Phê duyệt tài liệu ${mockItem.fileName}` }));
    expect(handleApprove).toHaveBeenCalledWith(mockItem);
  });

  it('gọi onReject với item khi click nút Từ chối', () => {
    const handleReject = vi.fn();
    render(
      <ModerationQueueRowActions
        item={mockItem}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={handleReject}
        onViewDetail={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: `Từ chối tài liệu ${mockItem.fileName}` }));
    expect(handleReject).toHaveBeenCalledWith(mockItem);
  });

  it('gọi onViewDetail với fileId khi click nút Chi tiết', () => {
    const handleViewDetail = vi.fn();
    render(
      <ModerationQueueRowActions
        item={mockItem}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={handleViewDetail}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: `Xem chi tiết tài liệu ${mockItem.fileName}` }));
    expect(handleViewDetail).toHaveBeenCalledWith('FIL_TEST_01');
  });

  it('hiển thị trạng thái loading trên nút Quét AI khi isCheckingPlagiarism = true', () => {
    render(
      <ModerationQueueRowActions
        item={mockItem}
        isCheckingPlagiarism={true}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: `Kích hoạt quét AI cho tài liệu ${mockItem.fileName}` });
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
