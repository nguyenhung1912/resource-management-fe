import { Eye, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { AppealStatusBadge } from './AppealStatusBadge';
import type { AppealItemResponse } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';

export interface AppealTableProps {
  items: AppealItemResponse[];
  onViewDetail: (item: AppealItemResponse) => void;
  className?: string;
}

export function AppealTable({ items, onViewDetail, className }: AppealTableProps) {
  return (
    <div className={cn('bg-surface rounded-xl border border-border-subtle shadow-xs overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn / Lần gửi</TableHead>
            <TableHead>Tài liệu</TableHead>
            <TableHead className="hidden md:table-cell">Giảng viên phụ trách</TableHead>
            <TableHead className="hidden lg:table-cell">Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.appealId} className="group">
              <TableCell className="whitespace-nowrap">
                <div className="font-mono font-medium text-text-main text-xs">{item.appealId}</div>
                <div className="text-[11px] text-text-muted mt-0.5">Lần giải trình: {item.appealAttempt}</div>
              </TableCell>

              {/* File Name */}
              <TableCell className="max-w-xs sm:max-w-sm">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <span className="font-medium text-text-main line-clamp-1 block leading-snug" title={item.fileName}>
                      {item.fileName}
                    </span>
                    <span
                      className="text-[11px] text-text-muted block line-clamp-1 mt-0.5"
                      title={item.studentExplanation}
                    >
                      {item.studentExplanation}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Assigned Lecturer */}
              <TableCell className="whitespace-nowrap hidden md:table-cell">
                {item.assignedLecturerName ? (
                  <div className="flex items-center gap-1.5 text-text-main">
                    <User className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                    <span>{item.assignedLecturerName}</span>
                  </div>
                ) : (
                  <span className="text-text-muted italic">Đang chờ phân công</span>
                )}
              </TableCell>

              {/* Time */}
              <TableCell className="whitespace-nowrap hidden lg:table-cell">
                <div className="text-text-main">{formatDateTime(item.createdAt)}</div>
                {item.resolvedAt && (
                  <div className="text-[11px] text-text-muted mt-0.5">Duyệt: {formatDateTime(item.resolvedAt)}</div>
                )}
              </TableCell>

              {/* Status */}
              <TableCell className="whitespace-nowrap">
                <AppealStatusBadge status={item.status} />
              </TableCell>

              {/* Action */}
              <TableCell className="text-right whitespace-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail(item)}
                  iconLeft={<Eye className="h-3.5 w-3.5 text-primary" />}
                  className="h-7 text-xs px-2.5 rounded-lg cursor-pointer"
                >
                  Chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default AppealTable;
