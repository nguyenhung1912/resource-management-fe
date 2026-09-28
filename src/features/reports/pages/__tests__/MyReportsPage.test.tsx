import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MyReportsPage } from '../MyReportsPage';
import type { MyReportsLoaderResult } from '@/features/reports/types/report.types';

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

describe('MyReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  const mockLoaderData: MyReportsLoaderResult = {
    reports: {
      items: [
        {
          reportId: 'RPT_MY_001',
          reporterUid: 'USR_ME',
          reporterName: 'Tôi',
          targetType: 'File',
          targetId: 'FIL_001',
          reportTypeId: 1,
          reportTypeName: 'Vi phạm bản quyền',
          reason: 'Tài liệu sao chép nghiên cứu',
          status: 'Pending',
          createdAt: '2026-09-18T08:00:00Z',
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
    reportTypes: [{ reportTypeId: 1, reportTypeName: 'Vi phạm bản quyền', description: 'Sao chép nội dung' }],
    currentStatus: undefined,
    currentTargetType: undefined,
    currentReportTypeId: undefined,
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,
  };

  it('render tiêu đề, thẻ KPI, thanh tìm kiếm và bảng khi có dữ liệu', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyReportsPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Báo cáo vi phạm của tôi' })).toBeInTheDocument();
    expect(screen.getByText('Tất cả báo cáo')).toBeInTheDocument();
    expect(screen.getAllByText('Chờ xử lý').length).toBeGreaterThan(0);
    expect(screen.getAllByText('RPT_MY_001').length).toBeGreaterThan(0);
    expect(screen.getAllByText('FIL_001').length).toBeGreaterThan(0);
  });

  it('kích hoạt thay đổi searchParams khi người dùng chọn tab trạng thái', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyReportsPage />);

    const pendingCard = screen.getByRole('button', { name: /lọc theo chờ xử lý/i });
    fireEvent.click(pendingCard);

    expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
    const calledParams = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(calledParams.get('status')).toBe('Pending');
    expect(calledParams.get('page')).toBe('1');
  });

  it('mở modal chi tiết khi người dùng nhấn nút Chi tiết', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyReportsPage />);

    const detailButtons = screen.getAllByRole('button', { name: /xem chi tiết báo cáo rpt_my_001/i });
    fireEvent.click(detailButtons[0]);

    expect(mockLoadDetail).toHaveBeenCalledWith('RPT_MY_001');
    expect(screen.getByText('Chi tiết báo cáo #RPT_MY_001')).toBeInTheDocument();
  });

  it('hiển thị trạng thái rỗng khi không có báo cáo nào', () => {
    vi.mocked(useLoaderData).mockReturnValue({
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
    });

    render(<MyReportsPage />);

    expect(screen.getByText('Bạn chưa gửi báo cáo vi phạm nào')).toBeInTheDocument();
  });

  it('gọi revalidator khi nhấn nút Làm mới', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<MyReportsPage />);

    const refreshButton = screen.getByRole('button', { name: /làm mới danh sách báo cáo/i });
    fireEvent.click(refreshButton);

    expect(mockRevalidate).toHaveBeenCalledTimes(1);
  });
});
