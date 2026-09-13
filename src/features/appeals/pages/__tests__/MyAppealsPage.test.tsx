import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MyAppealsPage } from '../MyAppealsPage';
import type { MyAppealsLoaderResult } from '@/features/appeals/types/appeal.types';

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
const mockRevalidate = vi.fn();
let mockSearchParams = new URLSearchParams();

const mockLoadDetail = vi.fn();
const mockResetDetail = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useRevalidator: () => ({ revalidate: mockRevalidate, state: 'idle' }),
  };
});

vi.mock('@/features/appeals/hooks/useAppealDetail', () => ({
  useAppealDetail: () => ({
    isLoading: false,
    detail: null,
    error: null,
    loadDetail: mockLoadDetail,
    resetDetail: mockResetDetail,
  }),
}));

import { useLoaderData } from 'react-router-dom';

describe('MyAppealsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  const mockLoaderData: MyAppealsLoaderResult = {
    appeals: {
      items: [
        {
          appealId: 'APL_001',
          fileId: 'FIL_001',
          fileName: 'Nghiên cứu Thị giác Máy tính',
          appealAttempt: 1,
          studentExplanation: 'Đã trích dẫn nguồn đầy đủ.',
          status: 'Pending',
          assignedLecturerName: 'TS. Nguyễn Văn A',
          createdAt: '2026-09-12T10:00:00Z',
        },
      ],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    stats: {
      total: 1,
      pending: 1,
      approved: 0,
      rejected: 0,
    },
    currentStatus: undefined,
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,
  };

  it('render tiêu đề, thẻ KPI, thanh tìm kiếm và bảng khi có dữ liệu', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyAppealsPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Khiếu nại của tôi' })).toBeInTheDocument();
    expect(screen.getByText('Tổng khiếu nại')).toBeInTheDocument();
    expect(screen.getByText('Đang chờ duyệt')).toBeInTheDocument();
    expect(screen.getAllByText('Nghiên cứu Thị giác Máy tính').length).toBeGreaterThan(0);
    expect(screen.getAllByText('APL_001').length).toBeGreaterThan(0);
  });

  it('kích hoạt thay đổi searchParams khi người dùng chọn tab trạng thái', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyAppealsPage />);

    const pendingTab = screen.getByRole('button', { name: 'Chờ duyệt (1)' });
    fireEvent.click(pendingTab);

    expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
    const calledParams = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(calledParams.get('status')).toBe('Pending');
    expect(calledParams.get('page')).toBe('1');
  });

  it('kích hoạt thay đổi searchParams khi người dùng gõ vào ô tìm kiếm', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyAppealsPage />);

    const searchInput = screen.getByPlaceholderText(/Tìm theo mã, tên tài liệu/i);
    fireEvent.change(searchInput, { target: { value: 'Thị giác' } });

    expect(mockSetSearchParams).toHaveBeenCalled();
    const calledParams = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(calledParams.get('search')).toBe('Thị giác');
    expect(calledParams.get('page')).toBe('1');
  });

  it('mở modal chi tiết và gọi loadDetail khi nhấn nút Chi tiết', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyAppealsPage />);

    const detailButtons = screen.getAllByRole('button', { name: /Chi tiết/i });
    fireEvent.click(detailButtons[0]);

    expect(mockLoadDetail).toHaveBeenCalledWith('APL_001');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('gọi revalidate khi nhấn nút Làm mới', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyAppealsPage />);

    const refreshBtn = screen.getByRole('button', { name: /Làm mới/i });
    fireEvent.click(refreshBtn);

    expect(mockRevalidate).toHaveBeenCalledTimes(1);
  });

  it('hiển thị AppealEmptyState khi danh sách khiếu nại rỗng', () => {
    const emptyLoaderData: MyAppealsLoaderResult = {
      ...mockLoaderData,
      appeals: {
        items: [],
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
      stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
    };

    vi.mocked(useLoaderData).mockReturnValue(emptyLoaderData);

    render(<MyAppealsPage />);

    expect(screen.getByText('Chưa có đơn khiếu nại nào')).toBeInTheDocument();
  });
});
