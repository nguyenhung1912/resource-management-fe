import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuditLogStatusBadge } from '../AuditLogStatusBadge';
import { AuditActionBadge } from '../AuditActionBadge';
import { AuditLogStatsCards } from '../AuditLogStatsCards';
import { AuditLogFilterToolbar } from '../AuditLogFilterToolbar';
import { AUDIT_ACTIONS, AUDIT_LOG_STATUS, type PagedAuditLogResponse } from '../../types/audit-log.types';

describe('AuditLogStatusBadge', () => {
  it('hiển thị nhãn Thành công khi status = 1', () => {
    render(<AuditLogStatusBadge status={AUDIT_LOG_STATUS.SUCCESS} />);
    expect(screen.getByText('Thành công')).toBeInTheDocument();
  });

  it('hiển thị nhãn Cảnh báo khi status = 2', () => {
    render(<AuditLogStatusBadge status={AUDIT_LOG_STATUS.WARNING} />);
    expect(screen.getByText('Cảnh báo')).toBeInTheDocument();
  });

  it('hiển thị nhãn Thất bại khi status = 0', () => {
    render(<AuditLogStatusBadge status={AUDIT_LOG_STATUS.FAILED} />);
    expect(screen.getByText('Thất bại')).toBeInTheDocument();
  });

  it('hiển thị nhãn Không xác định khi status không hợp lệ', () => {
    render(<AuditLogStatusBadge status={99} />);
    expect(screen.getByText('Không xác định')).toBeInTheDocument();
  });
});

describe('AuditActionBadge', () => {
  it('hiển thị nhãn tiếng Việt chuẩn cho action hợp lệ', () => {
    render(<AuditActionBadge action={AUDIT_ACTIONS.USER_CREATED} />);
    expect(screen.getByText('Tạo tài khoản')).toBeInTheDocument();
  });

  it('hiển thị nhãn tiếng Việt cho action kiểm duyệt', () => {
    render(<AuditActionBadge action={AUDIT_ACTIONS.RESOURCE_APPROVED} />);
    expect(screen.getByText('Phê duyệt tài liệu')).toBeInTheDocument();
  });

  it('hiển thị chính action đó khi không có trong từ điển action', () => {
    render(<AuditActionBadge action="CUSTOM_UNKNOWN_ACTION" />);
    expect(screen.getByText('CUSTOM_UNKNOWN_ACTION')).toBeInTheDocument();
  });
});

describe('AuditLogStatsCards', () => {
  const mockLogs: PagedAuditLogResponse = {
    items: [
      {
        logId: '1',
        userId: 'U1',
        username: 'admin',
        action: 'USER_CREATED',
        description: null,
        timestamp: '2026-09-29T10:00:00Z',
        ipaddress: '127.0.0.1',
        userAgent: null,
        status: AUDIT_LOG_STATUS.SUCCESS,
        statusName: 'Success',
      },
      {
        logId: '2',
        userId: 'U2',
        username: 'user1',
        action: 'COMMENT_CREATED',
        description: null,
        timestamp: '2026-09-29T10:05:00Z',
        ipaddress: '127.0.0.1',
        userAgent: null,
        status: AUDIT_LOG_STATUS.WARNING,
        statusName: 'Warning',
      },
      {
        logId: '3',
        userId: 'U3',
        username: 'user2',
        action: 'REPORT_CREATED',
        description: null,
        timestamp: '2026-09-29T10:10:00Z',
        ipaddress: '127.0.0.1',
        userAgent: null,
        status: AUDIT_LOG_STATUS.FAILED,
        statusName: 'Failed',
      },
    ],
    totalItems: 42,
    pageIndex: 1,
    pageSize: 10,
    totalPages: 5,
  };

  it('hiển thị đầy đủ 4 thẻ thống kê với giá trị chính xác', () => {
    render(<AuditLogStatsCards logs={mockLogs} />);

    expect(screen.getByText('Tổng lượt ghi nhận')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    expect(screen.getByText('Thao tác thành công')).toBeInTheDocument();
    expect(screen.getByText('Cảnh báo an toàn')).toBeInTheDocument();
    expect(screen.getByText('Thao tác thất bại')).toBeInTheDocument();
  });

  it('kích hoạt onSelectStatus khi người dùng bấm vào thẻ trạng thái', () => {
    const handleSelectStatus = vi.fn();
    render(<AuditLogStatsCards logs={mockLogs} onSelectStatus={handleSelectStatus} />);

    fireEvent.click(screen.getByText('Thao tác thất bại').closest('button')!);
    expect(handleSelectStatus).toHaveBeenCalledWith(AUDIT_LOG_STATUS.FAILED);

    fireEvent.click(screen.getByText('Tổng lượt ghi nhận').closest('button')!);
    expect(handleSelectStatus).toHaveBeenCalledWith(undefined);
  });
});

describe('AuditLogFilterToolbar', () => {
  it('kích hoạt onSearchChange khi submit form tìm kiếm', () => {
    const handleSearch = vi.fn();
    render(
      <AuditLogFilterToolbar
        onSearchChange={handleSearch}
        onActionChange={vi.fn()}
        onStatusChange={vi.fn()}
        onDateChange={vi.fn()}
        onReset={vi.fn()}
        hasActiveFilters={false}
      />,
    );

    const input = screen.getByPlaceholderText('Tìm theo tài khoản, thao tác hoặc mô tả...');
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleSearch).toHaveBeenCalledWith('admin');
  });

  it('kích hoạt onActionChange khi chọn hành động trong dropdown', () => {
    const handleAction = vi.fn();
    render(
      <AuditLogFilterToolbar
        onSearchChange={vi.fn()}
        onActionChange={handleAction}
        onStatusChange={vi.fn()}
        onDateChange={vi.fn()}
        onReset={vi.fn()}
        hasActiveFilters={false}
      />,
    );

    const select = screen.getByLabelText('Lọc theo hành động');
    fireEvent.change(select, { target: { value: AUDIT_ACTIONS.USER_CREATED } });

    expect(handleAction).toHaveBeenCalledWith(AUDIT_ACTIONS.USER_CREATED);
  });

  it('kích hoạt onStatusChange khi chọn trạng thái', () => {
    const handleStatus = vi.fn();
    render(
      <AuditLogFilterToolbar
        onSearchChange={vi.fn()}
        onActionChange={vi.fn()}
        onStatusChange={handleStatus}
        onDateChange={vi.fn()}
        onReset={vi.fn()}
        hasActiveFilters={false}
      />,
    );

    const select = screen.getByLabelText('Lọc theo trạng thái');
    fireEvent.change(select, { target: { value: '0' } });

    expect(handleStatus).toHaveBeenCalledWith(0);
  });

  it('hiển thị nút Đặt lại bộ lọc khi hasActiveFilters = true và kích hoạt onReset', () => {
    const handleReset = vi.fn();
    render(
      <AuditLogFilterToolbar
        onSearchChange={vi.fn()}
        onActionChange={vi.fn()}
        onStatusChange={vi.fn()}
        onDateChange={vi.fn()}
        onReset={handleReset}
        hasActiveFilters={true}
      />,
    );

    const resetButton = screen.getByText('Đặt lại bộ lọc');
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(handleReset).toHaveBeenCalled();
  });
});
