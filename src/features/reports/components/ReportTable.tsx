import { Eye, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ReportItemResponse } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { ReportStatusBadge } from './ReportStatusBadge';
import { ReportTargetBadge } from './ReportTargetBadge';

export interface ReportTableProps {
  items: ReportItemResponse[];
  onViewDetail: (item: ReportItemResponse) => void;
  onResolve: (item: ReportItemResponse) => void;
  className?: string;
}

export function ReportTable({ items, onViewDetail, onResolve, className }: ReportTableProps) {
  return (
    <div
      className={cn(
        'w-full bg-surface rounded-xl border border-border shadow-xs overflow-hidden select-none',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Danh sách báo cáo vi phạm">
          <thead>
            <tr className="border-b border-border bg-gray-50/75 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 sm:px-5">
                Mã & Ngày gửi
              </th>
              <th scope="col" className="py-3 px-4">
                Đối tượng vi phạm
              </th>
              <th scope="col" className="py-3 px-4">
                Loại & Lý do phản ánh
              </th>
              <th scope="col" className="py-3 px-4">
                Người báo cáo
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                Trạng thái
              </th>
              <th scope="col" className="py-3 px-4 sm:px-5 text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {items.map((item) => (
              <tr key={item.reportId} className="hover:bg-gray-50/60 transition-colors group">
                {/* Column 1: Report ID & Date */}
                <td className="py-3.5 px-4 sm:px-5 align-middle">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-semibold text-xs text-text-main group-hover:text-primary transition-colors">
                      {item.reportId}
                    </span>
                    <span className="text-[11px] text-text-muted">{formatDateTime(item.createdAt)}</span>
                  </div>
                </td>

                {/* Column 2: Target Entity */}
                <td className="py-3.5 px-4 align-middle">
                  <div className="flex flex-col gap-1 max-w-50">
                    <div className="flex items-center gap-1.5">
                      <ReportTargetBadge targetType={item.targetType} size="sm" />
                    </div>
                    <span className="font-mono text-[11px] text-text-muted truncate" title={item.targetId}>
                      {item.targetId}
                    </span>
                  </div>
                </td>

                {/* Column 3: Violation Type & Reason */}
                <td className="py-3.5 px-4 align-middle">
                  <div className="flex flex-col gap-0.5 max-w-70">
                    <span className="font-semibold text-xs text-text-main leading-tight">{item.reportTypeName}</span>
                    <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed" title={item.reason}>
                      {item.reason}
                    </p>
                  </div>
                </td>

                {/* Column 4: Reporter Info */}
                <td className="py-3.5 px-4 align-middle">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-xs text-text-main">{item.reporterName}</span>
                    <span className="font-mono text-[11px] text-text-muted">{item.reporterUid}</span>
                  </div>
                </td>

                {/* Column 5: Status Badge */}
                <td className="py-3.5 px-4 align-middle text-center">
                  <ReportStatusBadge status={item.status} size="sm" />
                </td>

                {/* Column 6: Actions */}
                <td className="py-3.5 px-4 sm:px-5 align-middle text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewDetail(item)}
                      iconLeft={<Eye className="h-3.5 w-3.5" />}
                      className="h-7 px-2 text-xs rounded-lg cursor-pointer"
                      aria-label={`Xem chi tiết báo cáo ${item.reportId}`}
                    >
                      <span className="hidden sm:inline">Chi tiết</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onResolve(item)}
                      iconLeft={<Gavel className="h-3.5 w-3.5" />}
                      className="h-7 px-2 text-xs rounded-lg cursor-pointer"
                      aria-label={`Xử lý báo cáo ${item.reportId}`}
                    >
                      <span>Xử lý</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportTable;
