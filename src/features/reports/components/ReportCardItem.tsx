import { Eye, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ReportItemResponse } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { ReportStatusBadge } from './ReportStatusBadge';
import { ReportTargetBadge } from './ReportTargetBadge';

export interface ReportCardItemProps {
  item: ReportItemResponse;
  onViewDetail: (item: ReportItemResponse) => void;
  onResolve: (item: ReportItemResponse) => void;
  className?: string;
}

export function ReportCardItem({ item, onViewDetail, onResolve, className }: ReportCardItemProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border p-4 shadow-xs space-y-3 select-none transition-colors hover:border-gray-300',
        className,
      )}
    >
      {/* Header: ID + Time + Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono font-bold text-xs text-text-main">{item.reportId}</span>
          <span className="text-[11px] text-text-muted">{formatDateTime(item.createdAt)}</span>
        </div>
        <ReportStatusBadge status={item.status} size="sm" />
      </div>

      {/* Target Entity */}
      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle text-xs">
        <span className="text-[11px] text-text-muted shrink-0">Đối tượng:</span>
        <ReportTargetBadge targetType={item.targetType} size="sm" />
        <span className="font-mono text-[11px] text-text-muted truncate" title={item.targetId}>
          {item.targetId}
        </span>
      </div>

      {/* Violation Info */}
      <div className="space-y-1 bg-gray-50/70 p-2.5 rounded-lg border border-border-subtle">
        <div className="text-xs font-semibold text-text-main">{item.reportTypeName}</div>
        <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">{item.reason}</p>
      </div>

      {/* Reporter Info */}
      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>
          Người gửi: <strong className="text-text-main font-medium">{item.reporterName}</strong>
        </span>
        <span className="font-mono">{item.reporterUid}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetail(item)}
          iconLeft={<Eye className="h-3.5 w-3.5" />}
          className="flex-1 h-8 text-xs rounded-lg"
          aria-label={`Xem chi tiết báo cáo ${item.reportId}`}
        >
          Chi tiết
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onResolve(item)}
          iconLeft={<Gavel className="h-3.5 w-3.5" />}
          className="flex-1 h-8 text-xs rounded-lg"
          aria-label={`Xử lý báo cáo ${item.reportId}`}
        >
          Xử lý
        </Button>
      </div>
    </div>
  );
}

export default ReportCardItem;
