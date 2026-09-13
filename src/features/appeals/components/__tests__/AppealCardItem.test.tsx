import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppealCardItem } from '../AppealCardItem';
import type { AppealItemResponse } from '@/features/appeals/types/appeal.types';

describe('AppealCardItem', () => {
  const mockItem: AppealItemResponse = {
    appealId: 'APL_TEST',
    fileId: 'FIL_TEST',
    fileName: 'Đồ án Chuyên ngành Mạng',
    appealAttempt: 1,
    studentExplanation: 'Đoạn mã nguồn được viết riêng cho đề tài này.',
    status: 'Pending',
    assignedLecturerName: 'TS. Phan Văn C',
    createdAt: '2026-09-12T11:00:00Z',
  };

  it('hiển thị thông tin tóm tắt trong card', () => {
    render(<AppealCardItem item={mockItem} onViewDetail={vi.fn()} />);

    expect(screen.getByText('Đồ án Chuyên ngành Mạng')).toBeInTheDocument();
    expect(screen.getByText('APL_TEST')).toBeInTheDocument();
    expect(screen.getByText('Lần 1')).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
    expect(screen.getByText('TS. Phan Văn C')).toBeInTheDocument();
  });

  it('gọi onViewDetail khi người dùng nhấn nút Chi tiết trên card', () => {
    const handleViewDetail = vi.fn();
    render(<AppealCardItem item={mockItem} onViewDetail={handleViewDetail} />);

    const button = screen.getByRole('button', { name: /Chi tiết/i });
    fireEvent.click(button);

    expect(handleViewDetail).toHaveBeenCalledWith(mockItem);
  });
});
