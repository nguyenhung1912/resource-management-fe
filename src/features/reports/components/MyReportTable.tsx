import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { ReportItemResponse } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { ReportStatusBadge } from './ReportStatusBadge';
import { ReportTargetBadge } from './ReportTargetBadge';

export interface MyReportTableProps {
  items: ReportItemResponse[];
  onViewDetail: (item: ReportItemResponse) => void;
  className?: string;
}

export function MyReportTable({ items, onViewDetail, className }: MyReportTableProps) {
  return (
    <div
      className={cn(
        'w-full bg-surface rounded-xl border border-border shadow-xs overflow-hidden select-none',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <Table aria-label="Danh sách báo cáo vi phạm cá nhân">
          <TableHeader>
            <TableRow className="border-b border-border bg-gray-50/75 hover:bg-gray-50/75">
              <TableHead className="py-3 px-4 sm:px-5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Mã & Ngày gửi
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Đối tượng vi phạm
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Loại vi phạm
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Lý do phản ánh
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-center">
                Trạng thái
              </TableHead>
              <TableHead className="py-3 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Kết luận xử lý
              </TableHead>
              <TableHead className="py-3 px-4 sm:px-5 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border text-xs">
            {items.map((item) => (
              <TableRow key={item.reportId} className="hover:bg-gray-50/60 transition-colors group">
                {/* Cột 1: Mã báo cáo & Ngày gửi */}
                <TableCell className="py-3.5 px-4 sm:px-5 align-middle">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-semibold text-xs text-text-main group-hover:text-primary transition-colors">
                      {item.reportId}
                    </span>
                    <span className="text-[11px] text-text-muted">{formatDateTime(item.createdAt)}</span>
                  </div>
                </TableCell>

                {/* Cột 2: Đối tượng vi phạm */}
                <TableCell className="py-3.5 px-4 align-middle">
                  <div className="flex flex-col gap-1 max-w-44">
                    <div className="flex items-center gap-1.5">
                      <ReportTargetBadge targetType={item.targetType} size="sm" />
                    </div>
                    <span className="font-mono text-[11px] text-text-muted truncate" title={item.targetId}>
                      {item.targetId}
                    </span>
                  </div>
                </TableCell>

                {/* Cột 3: Loại vi phạm */}
                <TableCell className="py-3.5 px-4 align-middle">
                  <span className="font-semibold text-xs text-text-main leading-tight block max-w-44">
                    {item.reportTypeName}
                  </span>
                </TableCell>

                {/* Cột 4: Lý do phản ánh */}
                <TableCell className="py-3.5 px-4 align-middle">
                  <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed max-w-64" title={item.reason}>
                    {item.reason}
                  </p>
                </TableCell>

                {/* Cột 5: Trạng thái (Pill badge) */}
                <TableCell className="py-3.5 px-4 align-middle text-center">
                  <ReportStatusBadge status={item.status} size="sm" />
                </TableCell>

                {/* Cột 6: Kết luận xử lý */}
                <TableCell className="py-3.5 px-4 align-middle max-w-56">
                  {item.handlingNotes ? (
                    <p
                      className="text-[11px] text-emerald-800 font-medium line-clamp-2 leading-relaxed bg-emerald-50/70 p-1.5 rounded border border-emerald-200/60"
                      title={item.handlingNotes}
                    >
                      {item.handlingNotes}
                    </p>
                  ) : (
                    <span className="text-[11px] text-text-muted italic">Chờ tiếp nhận & xử lý</span>
                  )}
                </TableCell>

                {/* Cột 7: Thao tác */}
                <TableCell className="py-3.5 px-4 sm:px-5 align-middle text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onViewDetail(item)}
                    iconLeft={<Eye className="h-3.5 w-3.5" />}
                    className="h-7 px-2.5 text-xs rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors"
                    aria-label={`Xem chi tiết báo cáo ${item.reportId}`}
                  >
                    <span>Chi tiết</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default MyReportTable;
