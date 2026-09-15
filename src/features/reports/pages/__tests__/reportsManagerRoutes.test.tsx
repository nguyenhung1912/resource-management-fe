import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';
import { reportService } from '@/services/reportService';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  PagedReportResponse,
  ReportDetailResponse,
  ReportTypeResponse,
} from '@/features/reports/types/report.types';

vi.mock('@/services/reportService', () => ({
  reportService: {
    getAllReports: vi.fn(),
    getReportTypes: vi.fn(),
    getReportById: vi.fn(),
    updateReportStatus: vi.fn(),
  },
}));

describe('reports manager routes integration', () => {
  const mockTypes: ReportTypeResponse[] = [
    { reportTypeId: 1, reportTypeName: 'Vi phạm bản quyền', description: 'Sao chép trái phép' },
  ];

  const mockPagedReports: PagedReportResponse = {
    items: [
      {
        reportId: 'RPT_TEST_001',
        reporterUid: 'USR_001',
        reporterName: 'Trần Văn T',
        targetType: 'File',
        targetId: 'FIL_TEST_001',
        reportTypeId: 1,
        reportTypeName: 'Vi phạm bản quyền',
        reason: 'Nghiên cứu sao chép nguyên văn đồ án tốt nghiệp',
        status: 'Pending',
        createdAt: '2026-09-15T09:00:00Z',
      },
    ],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const mockDetail: ReportDetailResponse = {
    ...mockPagedReports.items[0],
    targetTitle: 'Nghiên cứu ứng dụng Deep Learning',
    handledByName: null,
    handledByUid: null,
    resolvedAt: null,
    handlingNotes: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'user-demo-1',
        username: 'demo_user',
        displayName: 'Giảng viên Test',
        role: 'LECTURER',
      },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('cho phép Giảng viên/Admin truy cập route và hiển thị danh sách báo cáo', async () => {
    vi.mocked(reportService.getAllReports).mockResolvedValue(mockPagedReports);
    vi.mocked(reportService.getReportTypes).mockResolvedValue(mockTypes);

    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.REPORTS_MANAGER] });
    render(<RouterProvider router={router} />);

    const heading = await screen.findByRole('heading', { name: /Quản lý & Xử lý Báo cáo vi phạm/i });
    expect(heading).toBeInTheDocument();

    const reportIdElements = await screen.findAllByText('RPT_TEST_001');
    expect(reportIdElements[0]).toBeInTheDocument();

    const reporterElements = screen.getAllByText('Trần Văn T');
    expect(reporterElements[0]).toBeInTheDocument();

    const reasonElements = screen.getAllByText('Nghiên cứu sao chép nguyên văn đồ án tốt nghiệp');
    expect(reasonElements[0]).toBeInTheDocument();
  });

  it('mở modal chi tiết khi nhấn Chi tiết và có thể đóng lại', async () => {
    vi.mocked(reportService.getAllReports).mockResolvedValue(mockPagedReports);
    vi.mocked(reportService.getReportTypes).mockResolvedValue(mockTypes);
    vi.mocked(reportService.getReportById).mockResolvedValue(mockDetail);

    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.REPORTS_MANAGER] });
    render(<RouterProvider router={router} />);

    const detailBtns = await screen.findAllByRole('button', { name: /Xem chi tiết báo cáo RPT_TEST_001/i });
    expect(detailBtns[0]).toBeInTheDocument();
    fireEvent.click(detailBtns[0]);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Chi tiết báo cáo #RPT_TEST_001/i)).toBeInTheDocument();

    const closeBtns = within(dialog).getAllByRole('button', { name: 'Đóng' });
    fireEvent.click(closeBtns[0]);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('chuyển hướng sang 403 Forbidden khi người dùng không có quyền (STUDENT)', async () => {
    useAuthStore.setState({
      user: {
        id: 'student-1',
        username: 'student',
        displayName: 'Sinh viên A',
        role: 'STUDENT',
      },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    });

    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.REPORTS_MANAGER] });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(APP_PATHS.FORBIDDEN);
    });
  });
});
