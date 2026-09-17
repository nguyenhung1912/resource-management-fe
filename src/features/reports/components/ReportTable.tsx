import { Eye, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
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
        <Table aria-label="Danh sách báo cáo vi phạm">
          <TableHeader>
            <TableRow className="border-b border-border bg-gray-50/75 hover:bg-gray-50/75">
              <TableHead className="py-3 px-4 sm:px-5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Mã & Ngày gửi
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Đối tượng vi phạm
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Loại & Lý do phản ánh
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Người báo cáo
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-center">
                Trạng thái
              </TableHead>
              <TableHead className="py-3 px-4 sm:px-5 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border text-xs">
            {items.map((item) => (
              <TableRow key={item.reportId} className="hover:bg-gray-50/60 transition-colors group">
                {/* Column 1: Report ID & Date */}
                <TableCell className="py-3.5 px-4 sm:px-5 align-middle">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-semibold text-xs text-text-main group-hover:text-primary transition-colors">
                      {item.reportId}
                    </span>
                    <span className="text-[11px] text-text-muted">{formatDateTime(item.createdAt)}</span>
                  </div>
                </TableCell>

                {/* Column 2: Target Entity */}
                <TableCell className="py-3.5 px-4 align-middle">
                  <div className="flex flex-col gap-1 max-w-50">
                    <div className="flex items-center gap-1.5">
                      <ReportTargetBadge targetType={item.targetType} size="sm" />
                    </div>
                    <span className="font-mono text-[11px] text-text-muted truncate" title={item.targetId}>
                      {item.targetId}
                    </span>
                  </div>
                </TableCell>

                {/* Column 3: Violation Type & Reason */}
                <TableCell className="py-3.5 px-4 align-middle">
                  <div className="flex flex-col gap-0.5 max-w-70">
                    <span className="font-semibold text-xs text-text-main leading-tight">{item.reportTypeName}</span>
                    <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed" title={item.reason}>
                      {item.reason}
                    </p>
                  </div>
                </TableCell>

                {/* Column 4: Reporter Info */}
                <TableCell className="py-3.5 px-4 align-middle">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-xs text-text-main">{item.reporterName}</span>
                    <span className="font-mono text-[11px] text-text-muted">{item.reporterUid}</span>
                  </div>
                </TableCell>

                {/* Column 5: Status Badge */}
                <TableCell className="py-3.5 px-4 align-middle text-center">
                  <ReportStatusBadge status={item.status} size="sm" />
                </TableCell>

                {/* Column 6: Actions */}
                <TableCell className="py-3.5 px-4 sm:px-5 align-middle text-right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ReportTable;
