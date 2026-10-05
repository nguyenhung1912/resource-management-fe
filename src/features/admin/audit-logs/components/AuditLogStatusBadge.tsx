import { cn } from '@/utils/cn';
import { AUDIT_LOG_STATUS } from '../types/audit-log.types';

export interface AuditLogStatusBadgeProps {
  status: number;
  className?: string;
}

export function AuditLogStatusBadge({ status, className }: AuditLogStatusBadgeProps) {
  switch (status) {
    case AUDIT_LOG_STATUS.SUCCESS:
      return (
        <span
          role="status"
          aria-label="Trạng thái: Thành công"
          className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700', className)}
        >
          <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
          <span>Thành công</span>
        </span>
      );
    case AUDIT_LOG_STATUS.WARNING:
      return (
        <span
          role="status"
          aria-label="Trạng thái: Cảnh báo"
          className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-amber-700', className)}
        >
          <span className="size-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
          <span>Cảnh báo</span>
        </span>
      );
    case AUDIT_LOG_STATUS.FAILED:
      return (
        <span
          role="status"
          aria-label="Trạng thái: Thất bại"
          className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-rose-700', className)}
        >
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden="true" />
          <span>Thất bại</span>
        </span>
      );
    default:
      return (
        <span
          role="status"
          aria-label="Trạng thái: Không xác định"
          className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-text-muted', className)}
        >
          <span className="size-1.5 rounded-full bg-gray-400 shrink-0" aria-hidden="true" />
          <span>Không xác định</span>
        </span>
      );
  }
}

export default AuditLogStatusBadge;
