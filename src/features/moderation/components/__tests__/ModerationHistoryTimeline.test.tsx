import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModerationHistoryTimeline } from '../ModerationHistoryTimeline';
import type { ModerationHistorySummaryDto } from '../../types/moderation.types';

describe('ModerationHistoryTimeline', () => {
  it('hiển thị thông báo khi chưa có lịch sử kiểm duyệt nào', () => {
    const { rerender } = render(<ModerationHistoryTimeline history={[]} />);
    expect(screen.getByText('Chưa có lịch sử kiểm duyệt nào trước đó')).toBeInTheDocument();

    rerender(<ModerationHistoryTimeline history={undefined} />);
    expect(screen.getByText('Chưa có lịch sử kiểm duyệt nào trước đó')).toBeInTheDocument();
  });

  it('render timeline với các quyết định Phê duyệt và Từ chối', () => {
    const mockHistory: ModerationHistorySummaryDto[] = [
      {
        historyId: 'MDH_01',
        action: 'Reject',
        moderatorName: 'TS. Trần Văn Thầy',
        reason: 'Độ trùng lặp 35.5% vượt quá giới hạn.',
        notes: 'Cần bổ sung nguồn tham khảo cho chương 3.',
        plagiarismScore: 35.5,
        createdAt: '2026-09-10T09:30:00Z',
      },
      {
        historyId: 'MDH_02',
        action: 'Approve',
        moderatorName: 'PGS. TS. Lê Thị Ban',
        notes: 'Đã hoàn thiện nội dung chỉnh sửa chuẩn xác.',
        createdAt: '2026-09-12T15:00:00Z',
      },
    ];

    render(<ModerationHistoryTimeline history={mockHistory} />);

    expect(screen.getByText(/Nhật ký Kiểm duyệt & Lịch sử \(2\)/i)).toBeInTheDocument();

    // Event 1 (Reject)
    expect(screen.getByText('Từ chối')).toBeInTheDocument();
    expect(screen.getByText('Kiểm duyệt viên: TS. Trần Văn Thầy')).toBeInTheDocument();
    expect(screen.getByText('Độ trùng lặp 35.5% vượt quá giới hạn.')).toBeInTheDocument();
    expect(screen.getByText('Cần bổ sung nguồn tham khảo cho chương 3.')).toBeInTheDocument();
    expect(screen.getByText('Trùng lặp: 35.5%')).toBeInTheDocument();

    // Event 2 (Approve)
    expect(screen.getByText('Phê duyệt')).toBeInTheDocument();
    expect(screen.getByText('Kiểm duyệt viên: PGS. TS. Lê Thị Ban')).toBeInTheDocument();
    expect(screen.getByText('Đã hoàn thiện nội dung chỉnh sửa chuẩn xác.')).toBeInTheDocument();
  });
});
