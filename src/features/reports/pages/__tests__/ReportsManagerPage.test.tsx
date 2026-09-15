import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReportsLoaderResult } from '@/features/reports/types/report.types';
import { ReportsManagerPage } from '../ReportsManagerPage';

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

vi.mock('@/features/reports/hooks/useReportDetail', () => ({
  useReportDetail: () => ({
    isLoading: false,
    detail: null,
    error: null,
    loadDetail: mockLoadDetail,
    resetDetail: mockResetDetail,
  }),
}));

import { useLoaderData } from 'react-router-dom';

describe('ReportsManagerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  const mockLoaderData: ReportsLoaderResult = {
    reports: {
      items: [
        {
          reportId: 'RPT_001',
          reporterUid: 'USR_001',
          reporterName: 'Lê Văn C',
          targetType: 'File',
          targetId: 'FIL_001',
          reportTypeId: 1,
          reportTypeName: 'Vi phạm bản quyền',
          reason: 'Sao chép nguyên văn đồ án tốt nghiệp',
          status: 'Pending',
          createdAt: '2026-09-15T08:00:00Z',
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
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    },
    reportTypes: [{ reportTypeId: 1, reportTypeName: 'Vi phạm bản quyền', description: 'Sao chép' }],
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,
  };

  it('render tiêu đề, role badge và các chỉ số thống kê', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<ReportsManagerPage />);

    expect(screen.getByRole('heading', { name: /Quản lý & Xử lý Báo cáo vi phạm/i })).toBeInTheDocument();
    expect(screen.getByText('Giảng viên / Quản trị viên')).toBeInTheDocument();
    expect(screen.getByText('Tất cả báo cáo')).toBeInTheDocument();
    expect(screen.getAllByText('Chờ xử lý')[0]).toBeInTheDocument();
    expect(screen.getAllByText('RPT_001')[0]).toBeInTheDocument();
  });

  it('gọi setSearchParams khi chọn lọc trạng thái', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<ReportsManagerPage />);

    const pendingCard = screen.getByRole('button', { name: /Lọc theo Chờ xử lý: 1/i });
    fireEvent.click(pendingCard);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('gọi revalidator.revalidate khi nhấn Làm mới', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<ReportsManagerPage />);

    const refreshButton = screen.getByRole('button', { name: /Làm mới/i });
    fireEvent.click(refreshButton);

    expect(mockRevalidate).toHaveBeenCalled();
  });

  it('mở modal chi tiết khi nhấn Chi tiết trên dòng báo cáo', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<ReportsManagerPage />);

    const detailButtons = screen.getAllByRole('button', { name: /Xem chi tiết báo cáo RPT_001/i });
    fireEvent.click(detailButtons[0]);

    expect(mockLoadDetail).toHaveBeenCalledWith('RPT_001');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('mở dialog xử lý khi nhấn Xử lý trên dòng báo cáo', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<ReportsManagerPage />);

    const resolveButtons = screen.getAllByRole('button', { name: /Xử lý báo cáo RPT_001/i });
    fireEvent.click(resolveButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Xử lý báo cáo #RPT_001/i)).toBeInTheDocument();
  });

  it('hiển thị empty state khi không có báo cáo nào', () => {
    const emptyLoaderData: ReportsLoaderResult = {
      ...mockLoaderData,
      reports: {
        ...mockLoaderData.reports,
        items: [],
        totalCount: 0,
      },
      stats: {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
      },
    };
    vi.mocked(useLoaderData).mockReturnValue(emptyLoaderData);

    render(<ReportsManagerPage />);

    expect(screen.getByText('Không có báo cáo vi phạm nào')).toBeInTheDocument();
  });
});
