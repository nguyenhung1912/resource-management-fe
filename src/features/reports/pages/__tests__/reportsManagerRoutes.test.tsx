import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';
import { reportService } from '@/services/reportService';
import { useAuthStore } from '@/store/authStore';

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

const lecturerAuthState = {
  user: {
    uid: 'user-demo-1',
    userCode: 'demo_user',
    fullName: 'Giảng viên Test',
    email: 'lecturer@test.com',
    roleId: 3,
    role: 'Lecturer',
  },
  token: 'mock-token',
  expiration: '2099-12-31T23:59:59Z',
  isAuthenticated: true,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

const studentAuthState = {
  user: {
    uid: 'student-1',
    userCode: 'student',
    fullName: 'Sinh viên A',
    email: 'student@test.com',
    roleId: 2,
    role: 'Student',
  },
  token: 'mock-token',
  expiration: '2099-12-31T23:59:59Z',
  isAuthenticated: true,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

describe('reports manager routes integration', () => {
  const mockTypes: ReportTypeResponse[] = [
    {
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      description: 'Sao chép trái phép',
    },
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

    useAuthStore.setState(lecturerAuthState);
  });

  it('cho phép Giảng viên/Admin truy cập route và hiển thị danh sách báo cáo', async () => {
    vi.mocked(reportService.getAllReports).mockResolvedValue(mockPagedReports);
    vi.mocked(reportService.getReportTypes).mockResolvedValue(mockTypes);

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.REPORTS_MANAGER],
    });

    render(<RouterProvider router={router} />);

    const heading = await screen.findByRole(
      'heading',
      {
        name: /Quản lý & Xử lý Báo cáo vi phạm/i,
      },
      { timeout: 5000 },
    );

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

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.REPORTS_MANAGER],
    });

    render(<RouterProvider router={router} />);

    const detailBtns = await screen.findAllByRole('button', {
      name: /Xem chi tiết báo cáo RPT_TEST_001/i,
    });

    expect(detailBtns[0]).toBeInTheDocument();

    fireEvent.click(detailBtns[0]);

    const dialog = await screen.findByRole('dialog', undefined, { timeout: 5000 });

    expect(dialog).toBeInTheDocument();

    expect(within(dialog).getByText(/Chi tiết báo cáo #RPT_TEST_001/i)).toBeInTheDocument();

    const closeBtns = within(dialog).getAllByRole('button', {
      name: 'Đóng',
    });

    fireEvent.click(closeBtns[0]);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('chuyển hướng sang 403 Forbidden khi người dùng không có quyền (STUDENT)', async () => {
    useAuthStore.setState(studentAuthState);

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.REPORTS_MANAGER],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(APP_PATHS.FORBIDDEN);
    });
  });
});
