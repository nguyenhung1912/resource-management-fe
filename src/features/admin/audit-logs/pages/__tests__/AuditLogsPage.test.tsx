import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auditLogService } from '@/services/auditLogService';
import { AUDIT_ACTIONS, AUDIT_LOG_STATUS, type AuditLogDetail } from '../../types/audit-log.types';
import type { AuditLogsLoaderData } from '../auditLogsLoader';
import { AuditLogsPage } from '../AuditLogsPage';

const mockRevalidate = vi.fn();
const mockSetSearchParams = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useRevalidator: () => ({ revalidate: mockRevalidate, state: 'idle' }),
  };
});

vi.mock('@/services/auditLogService', () => ({
  auditLogService: {
    getAuditLogs: vi.fn(),
    getAuditLogDetail: vi.fn(),
  },
}));

import { useLoaderData } from 'react-router-dom';

describe('AuditLogsPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  const mockLoaderData: AuditLogsLoaderData = {
    logs: {
      items: [
        {
          logId: 'LOG-001',
          userId: 'USR-001',
          username: 'admin',
          action: AUDIT_ACTIONS.USER_STATUS_UPDATED,
          description: 'Khóa tài khoản sinh viên vi phạm',
          timestamp: '2026-09-29T10:00:00Z',
          ipaddress: '192.168.1.50',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: AUDIT_LOG_STATUS.SUCCESS,
          statusName: 'Success',
        },
        {
          logId: 'LOG-002',
          userId: 'USR-002',
          username: 'student_tester',
          action: AUDIT_ACTIONS.RESOURCE_CREATED,
          description: 'Tải lên học liệu môn Lập trình Web',
          timestamp: '2026-09-29T10:30:00Z',
          ipaddress: '10.0.0.12',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
          status: AUDIT_LOG_STATUS.FAILED,
          statusName: 'Failed',
        },
      ],
      totalItems: 25,
      pageIndex: 1,
      pageSize: 10,
      totalPages: 3,
    },
    query: {
      pageIndex: 1,
      pageSize: 10,
    },
  };

  it('render đầy đủ Header, Thẻ thống kê KPI, Thanh lọc và Bảng dữ liệu', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<AuditLogsPage />);

    expect(screen.getByText('Nhật ký Lưu vết')).toBeInTheDocument();
    expect(screen.getByText('Tổng lượt ghi nhận')).toBeInTheDocument();
    expect(screen.getAllByText('25').length).toBeGreaterThan(0);

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('Khóa tài khoản sinh viên vi phạm')).toBeInTheDocument();
    expect(screen.getByText('student_tester')).toBeInTheDocument();
    expect(screen.getByText('Tải lên học liệu môn Lập trình Web')).toBeInTheDocument();
  });

  it('kích hoạt revalidate khi người dùng nhấn nút Làm mới', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<AuditLogsPage />);

    const refreshBtn = screen.getByRole('button', { name: /Làm mới/i });
    fireEvent.click(refreshBtn);

    expect(mockRevalidate).toHaveBeenCalledTimes(1);
  });

  it('cập nhật search params khi người dùng thực hiện tìm kiếm', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<AuditLogsPage />);

    const searchInput = screen.getByPlaceholderText('Tìm theo tài khoản, thao tác hoặc mô tả...');
    fireEvent.change(searchInput, { target: { value: 'sinh viên' } });

    const submitBtn = screen.getByRole('button', { name: 'Tìm' });
    fireEvent.click(submitBtn);

    expect(mockSetSearchParams).toHaveBeenCalled();
    const nextParams = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(nextParams.get('search')).toBe('sinh viên');
  });

  it('cập nhật search params khi thay đổi trang qua Pagination', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    render(<AuditLogsPage />);

    const page2Btn = screen.getByRole('button', { name: 'Trang 2' });
    fireEvent.click(page2Btn);

    expect(mockSetSearchParams).toHaveBeenCalled();
    const nextParams = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(nextParams.get('pageIndex')).toBe('2');
  });

  it('mở modal chi tiết khi click vào nút Xem chi tiết và gọi auditLogService.getAuditLogDetail', async () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);

    const mockDetail: AuditLogDetail = {
      ...mockLoaderData.logs.items[0],
      oldValue: '{"isActive":true}',
      newValue: '{"isActive":false}',
    };
    vi.mocked(auditLogService.getAuditLogDetail).mockResolvedValueOnce(mockDetail);

    render(<AuditLogsPage />);

    const viewButtons = screen.getAllByRole('button', { name: /Xem chi tiết nhật ký/i });
    fireEvent.click(viewButtons[0]);

    expect(auditLogService.getAuditLogDetail).toHaveBeenCalledWith('LOG-001');

    await waitFor(() => {
      expect(screen.getByText('Chi tiết Nhật ký Lưu vết')).toBeInTheDocument();
      expect(screen.getByText('So sánh biến động dữ liệu (Payload Diff)')).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole('button', { name: 'Đóng' });
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Chi tiết Nhật ký Lưu vết')).not.toBeInTheDocument();
    });
  });

  it('xử lý an toàn khi auditLogService.getAuditLogDetail ném ngoại lệ', async () => {
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);
    vi.mocked(auditLogService.getAuditLogDetail).mockRejectedValueOnce(new Error('Server Error'));

    render(<AuditLogsPage />);

    const viewButtons = screen.getAllByRole('button', { name: /Xem chi tiết nhật ký/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Không thể tải dữ liệu chi tiết biến động. Hiển thị thông tin tổng quan.'),
      ).toBeInTheDocument();
    });
  });
});
