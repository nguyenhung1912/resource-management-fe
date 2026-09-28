import { Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ReportItemResponse } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { ReportStatusBadge } from './ReportStatusBadge';
import { ReportTargetBadge } from './ReportTargetBadge';

export interface MyReportCardItemProps {
  item: ReportItemResponse;
  onViewDetail: (item: ReportItemResponse) => void;
  className?: string;
}

export function MyReportCardItem({ item, onViewDetail, className }: MyReportCardItemProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3 transition-colors hover:border-border-subtle',
        className,
      )}
    >
      {/* Header: Mã báo cáo & Trạng thái */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-bold text-xs text-text-main">{item.reportId}</span>
        <ReportStatusBadge status={item.status} size="sm" />
      </div>

      {/* Target entity */}
      <div className="flex items-center justify-between text-xs gap-2 pt-1 border-t border-border-subtle">
        <div className="flex items-center gap-1.5 min-w-0">
          <ReportTargetBadge targetType={item.targetType} size="sm" />
          <span className="font-mono text-[11px] text-text-muted truncate" title={item.targetId}>
            {item.targetId}
          </span>
        </div>
        <span className="font-semibold text-xs text-text-main shrink-0">{item.reportTypeName}</span>
      </div>

      {/* Reason */}
      <div>
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed bg-gray-50/70 p-2 rounded-lg border border-border-subtle">
          {item.reason}
        </p>
      </div>

      {/* Handling Notes if any */}
      {item.handlingNotes && (
        <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60 leading-relaxed">
          <span className="font-medium block text-emerald-900 mb-0.5">Kết luận xử lý:</span>
          <p className="line-clamp-2">{item.handlingNotes}</p>
        </div>
      )}

      {/* Footer: Date & Action */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle text-[11px] text-text-muted">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{formatDateTime(item.createdAt)}</span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetail(item)}
          iconLeft={<Eye className="h-3.5 w-3.5" />}
          className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
          aria-label={`Xem chi tiết báo cáo ${item.reportId}`}
        >
          Chi tiết
        </Button>
      </div>
    </div>
  );
}

export default MyReportCardItem;
