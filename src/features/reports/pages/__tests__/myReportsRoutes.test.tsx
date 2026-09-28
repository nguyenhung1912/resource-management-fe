import { fireEvent, render, screen, within } from '@testing-library/react';
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
    getMyReports: vi.fn(),
    getAllReports: vi.fn(),
    getReportTypes: vi.fn(),
    getReportById: vi.fn(),
    updateReportStatus: vi.fn(),
  },
}));

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

describe('my reports routes integration', () => {
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
        reportId: 'RPT_MY_ROUTE_001',
        reporterUid: 'student-1',
        reporterName: 'Sinh viên A',
        targetType: 'File',
        targetId: 'FIL_TEST_001',
        reportTypeId: 1,
        reportTypeName: 'Vi phạm bản quyền',
        reason: 'Nghiên cứu sao chép đồ án tốt nghiệp của tôi',
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
    useAuthStore.setState(studentAuthState);
  });

  it('cho phép Sinh viên truy cập route /my-reports và hiển thị danh sách báo cáo', async () => {
    vi.mocked(reportService.getMyReports).mockResolvedValue(mockPagedReports);
    vi.mocked(reportService.getReportTypes).mockResolvedValue(mockTypes);

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.MY_REPORTS],
    });

    render(<RouterProvider router={router} />);

    const heading = await screen.findByRole(
      'heading',
      {
        name: /Báo cáo vi phạm của tôi/i,
      },
      { timeout: 5000 },
    );
    expect(heading).toBeInTheDocument();

    const reportIdElements = await screen.findAllByText('RPT_MY_ROUTE_001');
    expect(reportIdElements[0]).toBeInTheDocument();

    const reasonElements = screen.getAllByText('Nghiên cứu sao chép đồ án tốt nghiệp của tôi');
    expect(reasonElements[0]).toBeInTheDocument();
  });

  it('mở modal chi tiết khi nhấn Chi tiết từ route /my-reports', async () => {
    vi.mocked(reportService.getMyReports).mockResolvedValue(mockPagedReports);
    vi.mocked(reportService.getReportTypes).mockResolvedValue(mockTypes);
    vi.mocked(reportService.getReportById).mockResolvedValue(mockDetail);

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.MY_REPORTS],
    });

    render(<RouterProvider router={router} />);

    const detailBtns = await screen.findAllByRole('button', {
      name: /xem chi tiết báo cáo rpt_my_route_001/i,
    });
    expect(detailBtns[0]).toBeInTheDocument();

    fireEvent.click(detailBtns[0]);

    const dialog = await screen.findByRole('dialog', undefined, { timeout: 5000 });
    expect(dialog).toBeInTheDocument();

    expect(within(dialog).getByText(/Chi tiết báo cáo #RPT_MY_ROUTE_001/i)).toBeInTheDocument();
  });
});
