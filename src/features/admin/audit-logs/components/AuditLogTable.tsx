import { Clock, Eye, Globe, RotateCcw, ShieldAlert, User } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatDateTime } from '@/utils/date';
import type { AuditLogItem } from '../types/audit-log.types';
import { AuditActionBadge } from './AuditActionBadge';
import { AuditLogStatusBadge } from './AuditLogStatusBadge';

export interface AuditLogTableProps {
  items: AuditLogItem[];
  onViewDetail: (item: AuditLogItem) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  className?: string;
}

export function AuditLogTable({
  items,
  onViewDetail,
  hasActiveFilters = false,
  onResetFilters,
  className,
}: AuditLogTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title={hasActiveFilters ? 'Không tìm thấy nhật ký phù hợp' : 'Chưa có nhật ký lưu vết'}
        description={
          hasActiveFilters
            ? 'Không tìm thấy bản ghi nào khớp với điều kiện lọc hiện tại. Vui lòng thử tìm kiếm khác hoặc đặt lại bộ lọc.'
            : 'Hệ thống hiện tại chưa ghi nhận sự kiện kiểm toán nào.'
        }
        action={
          hasActiveFilters && onResetFilters ? (
            <Button
              type="button"
              variant="secondary"
              iconLeft={<RotateCcw className="size-4" />}
              onClick={onResetFilters}
            >
              Đặt lại bộ lọc
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border-subtle bg-surface ${className ?? ''}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap w-40">Thời gian</TableHead>
            <TableHead className="whitespace-nowrap w-40">Người thực hiện</TableHead>
            <TableHead className="whitespace-nowrap w-42.5">Hành động</TableHead>
            <TableHead className="whitespace-nowrap min-w-50">Mô tả chi tiết</TableHead>
            <TableHead className="whitespace-nowrap w-35">IP / Môi trường</TableHead>
            <TableHead className="whitespace-nowrap w-35">Trạng thái</TableHead>
            <TableHead className="whitespace-nowrap w-27.5 text-right">Chi tiết</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((log) => (
            <TableRow key={log.logId} className="group hover:bg-gray-50/60">
              {/* 1. Thời gian */}
              <TableCell className="whitespace-nowrap font-mono text-xs text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-text-muted shrink-0" />
                  <span>{formatDateTime(log.timestamp)}</span>
                </div>
              </TableCell>

              {/* 2. Người thực hiện */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-text">{log.username}</p>
                    {log.userId && <p className="truncate font-mono text-[11px] text-text-muted">{log.userId}</p>}
                  </div>
                </div>
              </TableCell>

              {/* 3. Hành động */}
              <TableCell>
                <AuditActionBadge action={log.action} />
              </TableCell>

              {/* 4. Mô tả */}
              <TableCell className="max-w-xs md:max-w-sm truncate text-xs text-text-muted">
                {log.description ? (
                  <span title={log.description} className="line-clamp-2">
                    {log.description}
                  </span>
                ) : (
                  <span className="italic text-gray-400">—</span>
                )}
              </TableCell>

              {/* 5. IP & Môi trường */}
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-xs font-mono text-text">
                    <Globe className="size-3 text-text-muted shrink-0" />
                    <span>{log.ipaddress || '—'}</span>
                  </div>
                  {log.userAgent && (
                    <span title={log.userAgent} className="max-w-30 truncate text-[10px] text-text-muted font-mono">
                      {log.userAgent}
                    </span>
                  )}
                </div>
              </TableCell>

              {/* 6. Trạng thái */}
              <TableCell className="whitespace-nowrap">
                <AuditLogStatusBadge status={log.status} />
              </TableCell>

              {/* 7. Thao tác */}
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Xem chi tiết nhật ký ${log.logId}`}
                  iconLeft={<Eye className="size-4 text-text-muted group-hover:text-primary" />}
                  onClick={() => onViewDetail(log)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default AuditLogTable;
