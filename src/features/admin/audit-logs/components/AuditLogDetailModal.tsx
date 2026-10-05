import { Calendar, Globe, Hash, Laptop, Loader2, User } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/utils/date';
import type { AuditLogDetail } from '../types/audit-log.types';
import { AuditActionBadge } from './AuditActionBadge';
import { AuditLogDiffViewer } from './AuditLogDiffViewer';
import { AuditLogStatusBadge } from './AuditLogStatusBadge';

export interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogDetail | null;
  isLoading?: boolean;
}

export function AuditLogDetailModal({ isOpen, onClose, log, isLoading = false }: AuditLogDetailModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Nhật ký Lưu vết"
      description="Xem chi tiết thông tin sự kiện, người thực hiện và dữ liệu biến động"
      maxWidth="3xl"
      footer={
        <div className="flex justify-end w-full">
          <Button type="button" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div
          data-testid="audit-log-modal-loading"
          className="flex flex-col items-center justify-center py-12 text-text-muted space-y-2"
        >
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Đang tải dữ liệu chi tiết...</p>
        </div>
      ) : !log ? (
        <div className="py-8 text-center text-sm text-text-muted">Không có dữ liệu nhật ký để hiển thị.</div>
      ) : (
        <div className="space-y-5" data-testid="audit-log-detail-content">
          {/* Header Metadata Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-gray-50/60 p-3">
            <div className="flex items-center gap-2">
              <Hash className="size-4 text-text-muted" />
              <span className="font-mono text-xs font-semibold text-text">{log.logId}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Calendar className="size-3.5" />
                <span>{formatDateTime(log.timestamp)}</span>
              </div>
              <AuditLogStatusBadge status={log.status} />
            </div>
          </div>

          {/* Section 1: Người thực hiện & Môi trường */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-lg border border-border-subtle bg-surface p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <User className="size-3.5 text-primary" />
                <span>Người thực hiện</span>
              </div>
              <p className="text-sm font-semibold text-text">{log.username}</p>
              {log.userId && <p className="font-mono text-xs text-text-muted">ID: {log.userId}</p>}
            </div>

            <div className="space-y-1 rounded-lg border border-border-subtle bg-surface p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <Globe className="size-3.5 text-primary" />
                <span>Địa chỉ IP</span>
              </div>
              <p className="font-mono text-sm font-medium text-text">{log.ipaddress || 'Chưa xác định'}</p>
            </div>
          </div>

          {/* Section 2: Thiết bị / User Agent */}
          <div className="space-y-1 rounded-lg border border-border-subtle bg-surface p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <Laptop className="size-3.5 text-primary" />
              <span>Thiết bị & Trình duyệt (User Agent)</span>
            </div>
            <p className="break-all font-mono text-xs text-text-muted">{log.userAgent || 'Chưa ghi nhận User Agent'}</p>
          </div>

          {/* Section 3: Hành động & Mô tả */}
          <div className="space-y-2 rounded-lg border border-border-subtle bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-muted">Hành động ghi nhận:</span>
              <AuditActionBadge action={log.action} />
            </div>
            <div className="text-xs font-mono text-text-muted">{log.action}</div>
            {log.description && (
              <p className="mt-2 text-xs leading-relaxed text-text bg-gray-50 p-2.5 rounded-lg border border-border-subtle">
                {log.description}
              </p>
            )}
          </div>

          {/* Section 4: So sánh thay đổi dữ liệu */}
          <AuditLogDiffViewer oldValue={log.oldValue} newValue={log.newValue} />
        </div>
      )}
    </BaseModal>
  );
}

export default AuditLogDetailModal;
