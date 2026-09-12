import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppealTable } from '../AppealTable';
import type { AppealItemResponse } from '@/features/appeals/types/appeal.types';

describe('AppealTable', () => {
  const mockItems: AppealItemResponse[] = [
    {
      appealId: 'APL_001',
      fileId: 'FIL_001',
      fileName: 'Nghiên cứu Thị giác Máy tính',
      appealAttempt: 1,
      studentExplanation: 'Đã bổ sung tài liệu tham khảo theo quy chuẩn',
      status: 'Pending',
      assignedLecturerName: 'TS. Nguyễn Văn A',
      createdAt: '2026-09-12T10:00:00Z',
    },
    {
      appealId: 'APL_002',
      fileId: 'FIL_002',
      fileName: 'Giáo trình Kỹ thuật Lập trình',
      appealAttempt: 2,
      studentExplanation: 'Chỉnh sửa toàn bộ mục 3',
      status: 'Approved',
      assignedLecturerName: 'ThS. Trần Thị B',
      createdAt: '2026-09-10T08:00:00Z',
      resolvedAt: '2026-09-11T09:00:00Z',
    },
  ];

  it('hiển thị danh sách các cột và các dòng dữ liệu', () => {
    render(<AppealTable items={mockItems} onViewDetail={vi.fn()} />);

    expect(screen.getByText('APL_001')).toBeInTheDocument();
    expect(screen.getByText('Lần giải trình: 1')).toBeInTheDocument();
    expect(screen.getByText('Nghiên cứu Thị giác Máy tính')).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn A')).toBeInTheDocument();

    expect(screen.getByText('APL_002')).toBeInTheDocument();
    expect(screen.getByText('Lần giải trình: 2')).toBeInTheDocument();
    expect(screen.getByText('Giáo trình Kỹ thuật Lập trình')).toBeInTheDocument();
    expect(screen.getByText('ThS. Trần Thị B')).toBeInTheDocument();
  });

  it('kích hoạt callback onViewDetail khi nhấn nút Chi tiết', () => {
    const handleViewDetail = vi.fn();
    render(<AppealTable items={mockItems} onViewDetail={handleViewDetail} />);

    const detailButtons = screen.getAllByRole('button', { name: /Chi tiết/i });
    fireEvent.click(detailButtons[0]);

    expect(handleViewDetail).toHaveBeenCalledWith(mockItems[0]);
  });
});
