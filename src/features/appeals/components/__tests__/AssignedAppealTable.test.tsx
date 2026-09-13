import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssignedAppealTable } from '../AssignedAppealTable';
import type { AppealItemResponse } from '@/features/appeals/types/appeal.types';

describe('AssignedAppealTable', () => {
  const mockItems: AppealItemResponse[] = [
    {
      appealId: 'APL_001',
      fileId: 'FIL_001',
      fileName: 'Nghiên cứu Thị giác Máy tính',
      fileUrl: 'https://example.com/vision.pdf',
      appealAttempt: 1,
      studentName: 'Lê Văn Nam',
      studentEmail: 'nam@example.com',
      studentExplanation: 'Đã bổ sung tài liệu tham khảo theo quy chuẩn',
      status: 'Pending',
      createdAt: '2026-09-12T10:00:00Z',
    },
    {
      appealId: 'APL_002',
      fileId: 'FIL_002',
      fileName: 'Giáo trình Kỹ thuật Lập trình',
      appealAttempt: 2,
      studentName: 'Hoàng Thùy Linh',
      studentEmail: 'linh@example.com',
      studentExplanation: 'Chỉnh sửa toàn bộ mục 3',
      status: 'Approved',
      createdAt: '2026-09-10T08:00:00Z',
      resolvedAt: '2026-09-11T09:00:00Z',
    },
  ];

  it('hiển thị đầy đủ thông tin sinh viên, tài liệu và trạng thái của các đơn khiếu nại', () => {
    render(<AssignedAppealTable items={mockItems} onViewDetail={vi.fn()} onResolve={vi.fn()} />);

    expect(screen.getByText('APL_001')).toBeInTheDocument();
    expect(screen.getByText('Lần giải trình: 1')).toBeInTheDocument();
    expect(screen.getByText('Nghiên cứu Thị giác Máy tính')).toBeInTheDocument();
    expect(screen.getByText('Lê Văn Nam')).toBeInTheDocument();
    expect(screen.getByText('nam@example.com')).toBeInTheDocument();

    expect(screen.getByText('APL_002')).toBeInTheDocument();
    expect(screen.getByText('Giáo trình Kỹ thuật Lập trình')).toBeInTheDocument();
    expect(screen.getByText('Hoàng Thùy Linh')).toBeInTheDocument();
    expect(screen.getByText('linh@example.com')).toBeInTheDocument();
  });

  it('hiển thị nút Giải quyết đối với đơn Pending và gọi callback onResolve khi nhấn', () => {
    const handleResolve = vi.fn();
    render(<AssignedAppealTable items={mockItems} onViewDetail={vi.fn()} onResolve={handleResolve} />);

    const resolveBtn = screen.getByRole('button', { name: /Giải quyết/i });
    expect(resolveBtn).toBeInTheDocument();

    fireEvent.click(resolveBtn);
    expect(handleResolve).toHaveBeenCalledWith(mockItems[0]);
  });

  it('gọi callback onViewDetail khi nhấn nút Chi tiết', () => {
    const handleViewDetail = vi.fn();
    render(<AssignedAppealTable items={mockItems} onViewDetail={handleViewDetail} onResolve={vi.fn()} />);

    const detailButtons = screen.getAllByRole('button', { name: /Chi tiết/i });
    fireEvent.click(detailButtons[0]);

    expect(handleViewDetail).toHaveBeenCalledWith(mockItems[0]);
  });
});
