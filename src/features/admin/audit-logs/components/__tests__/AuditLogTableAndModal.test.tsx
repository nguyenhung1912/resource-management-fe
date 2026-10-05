import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuditLogDiffViewer } from '../AuditLogDiffViewer';
import { AuditLogDetailModal } from '../AuditLogDetailModal';
import { AuditLogTable } from '../AuditLogTable';
import type { AuditLogDetail, AuditLogItem } from '../../types/audit-log.types';

describe('AuditLogDiffViewer', () => {
  it('hiển thị thông báo không có thay đổi khi cả oldValue và newValue đều null/rỗng', () => {
    render(<AuditLogDiffViewer oldValue={null} newValue={null} />);
    expect(screen.getByText(/Không có dữ liệu thay đổi/i)).toBeInTheDocument();
  });

  it('định dạng JSON đẹp mắt khi truyền dữ liệu dạng JSON string', () => {
    const oldValue = '{"status":1,"name":"Test"}';
    const newValue = '{"status":2,"name":"Test Updated"}';

    render(<AuditLogDiffViewer oldValue={oldValue} newValue={newValue} />);

    expect(screen.getByText(/So sánh biến động dữ liệu/i)).toBeInTheDocument();
    expect(screen.getByText(/Dữ liệu cũ/i)).toBeInTheDocument();
    expect(screen.getByText(/Dữ liệu mới/i)).toBeInTheDocument();
  });

  it('xử lý an toàn khi giá trị là chuỗi thường không phải JSON', () => {
    render(<AuditLogDiffViewer oldValue="Plain text old" newValue="Plain text new" />);

    expect(screen.getByText('Plain text old')).toBeInTheDocument();
    expect(screen.getByText('Plain text new')).toBeInTheDocument();
  });
});

describe('AuditLogDetailModal', () => {
  const mockDetail: AuditLogDetail = {
    logId: 'LOG-001',
    userId: 'USR-001',
    username: 'admin',
    action: 'USER_ROLE_UPDATED',
    description: 'Admin đổi quyền thành công',
    timestamp: '2026-09-29T10:00:00Z',
    ipaddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 Windows',
    status: 1,
    statusName: 'Success',
    oldValue: '{"Role":"Lecturer"}',
    newValue: '{"Role":"Admin"}',
  };

  it('hiển thị loading khi isLoading = true', () => {
    render(<AuditLogDetailModal isOpen={true} onClose={vi.fn()} log={null} isLoading={true} />);

    expect(screen.getByTestId('audit-log-modal-loading')).toBeInTheDocument();
    expect(screen.getByText('Đang tải dữ liệu chi tiết...')).toBeInTheDocument();
  });

  it('hiển thị đầy đủ thông tin chi tiết của nhật ký khi có dữ liệu', () => {
    render(<AuditLogDetailModal isOpen={true} onClose={vi.fn()} log={mockDetail} isLoading={false} />);

    expect(screen.getByTestId('audit-log-detail-content')).toBeInTheDocument();
    expect(screen.getByText('LOG-001')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('ID: USR-001')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('Mozilla/5.0 Windows')).toBeInTheDocument();
    expect(screen.getByText('Admin đổi quyền thành công')).toBeInTheDocument();
  });

  it('kích hoạt onClose khi người dùng nhấn nút Đóng', () => {
    const handleClose = vi.fn();
    render(<AuditLogDetailModal isOpen={true} onClose={handleClose} log={mockDetail} isLoading={false} />);

    const closeButtons = screen.getAllByRole('button', { name: 'Đóng' });
    fireEvent.click(closeButtons[0]);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('AuditLogTable', () => {
  const mockItems: AuditLogItem[] = [
    {
      logId: 'LOG-1',
      userId: 'USR-1',
      username: 'nguyenhung',
      action: 'RESOURCE_CREATED',
      description: 'Đăng tải tài liệu môn học',
      timestamp: '2026-09-29T10:00:00Z',
      ipaddress: '10.0.0.1',
      userAgent: 'Chrome on macOS',
      status: 1,
      statusName: 'Success',
    },
    {
      logId: 'LOG-2',
      userId: 'USR-2',
      username: 'lecturer',
      action: 'RESOURCE_REJECTED',
      description: null,
      timestamp: '2026-09-29T11:00:00Z',
      ipaddress: null,
      userAgent: null,
      status: 0,
      statusName: 'Failed',
    },
  ];

  it('render đầy đủ danh sách các dòng và cột trong bảng', () => {
    render(<AuditLogTable items={mockItems} onViewDetail={vi.fn()} />);

    expect(screen.getByText('nguyenhung')).toBeInTheDocument();
    expect(screen.getByText('USR-1')).toBeInTheDocument();
    expect(screen.getByText('Đăng tải tài liệu môn học')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();

    expect(screen.getByText('lecturer')).toBeInTheDocument();
    expect(screen.getByText('USR-2')).toBeInTheDocument();
  });

  it('kích hoạt onViewDetail khi người dùng bấm nút xem chi tiết', () => {
    const handleViewDetail = vi.fn();
    render(<AuditLogTable items={mockItems} onViewDetail={handleViewDetail} />);

    const viewButtons = screen.getAllByRole('button', { name: /Xem chi tiết nhật ký/i });
    fireEvent.click(viewButtons[0]);

    expect(handleViewDetail).toHaveBeenCalledWith(mockItems[0]);
  });

  it('hiển thị EmptyState khi danh sách rỗng', () => {
    render(<AuditLogTable items={[]} onViewDetail={vi.fn()} hasActiveFilters={false} />);

    expect(screen.getByText('Chưa có nhật ký lưu vết')).toBeInTheDocument();
  });

  it('hiển thị nút Đặt lại bộ lọc trong EmptyState khi có filter đang áp dụng', () => {
    const handleReset = vi.fn();
    render(<AuditLogTable items={[]} onViewDetail={vi.fn()} hasActiveFilters={true} onResetFilters={handleReset} />);

    expect(screen.getByText('Không tìm thấy nhật ký phù hợp')).toBeInTheDocument();
    const resetBtn = screen.getByRole('button', { name: 'Đặt lại bộ lọc' });
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
