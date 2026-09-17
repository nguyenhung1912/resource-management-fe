import { ExternalLink, Eye, FileText, Gavel, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { AppealStatusBadge } from './AppealStatusBadge';
import type { AppealItemResponse } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';

export interface AssignedAppealTableProps {
  items: AppealItemResponse[];
  onViewDetail: (item: AppealItemResponse) => void;
  onResolve: (item: AppealItemResponse) => void;
  className?: string;
}

export function AssignedAppealTable({ items, onViewDetail, onResolve, className }: AssignedAppealTableProps) {
  return (
    <div className={cn('bg-surface rounded-xl border border-border-subtle shadow-xs overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn / Lần gửi</TableHead>
            <TableHead>Tài liệu nghiên cứu</TableHead>
            <TableHead className="hidden md:table-cell">Sinh viên gửi đơn</TableHead>
            <TableHead className="hidden lg:table-cell">Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isPending = item.status === 'Pending';

            return (
              <TableRow key={item.appealId} className="group">
                {/* Appeal ID & Attempt */}
                <TableCell className="whitespace-nowrap">
                  <div className="font-mono font-medium text-text-main text-xs">{item.appealId}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">Lần giải trình: {item.appealAttempt}</div>
                </TableCell>

                {/* File Name & Snippet */}
                <TableCell className="max-w-xs sm:max-w-sm">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-medium text-text-main line-clamp-1 block leading-snug"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </span>
                        {item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Mở file ${item.fileName}`}
                            className="text-text-muted hover:text-primary transition-colors shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                      <span
                        className="text-[11px] text-text-muted block line-clamp-1 mt-0.5"
                        title={item.studentExplanation}
                      >
                        {item.studentExplanation}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Student Info */}
                <TableCell className="whitespace-nowrap hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-text-main">
                    <User className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                    <span className="font-medium">{item.studentName || 'Sinh viên'}</span>
                  </div>
                  {item.studentEmail ? (
                    <div className="text-[11px] text-text-muted pl-5 mt-0.5">{item.studentEmail}</div>
                  ) : null}
                </TableCell>

                {/* Time */}
                <TableCell className="whitespace-nowrap hidden lg:table-cell">
                  <div className="text-text-main">{formatDateTime(item.createdAt)}</div>
                  {item.resolvedAt ? (
                    <div className="text-[11px] text-text-muted mt-0.5">Xử lý: {formatDateTime(item.resolvedAt)}</div>
                  ) : null}
                </TableCell>

                {/* Status Badge */}
                <TableCell className="whitespace-nowrap">
                  <AppealStatusBadge status={item.status} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    {isPending ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onResolve(item)}
                        iconLeft={<Gavel className="h-3.5 w-3.5" />}
                        className="h-7 text-xs px-2.5 rounded-lg shadow-2xs font-semibold cursor-pointer"
                      >
                        Giải quyết
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewDetail(item)}
                      iconLeft={<Eye className="h-3.5 w-3.5 text-text-muted" />}
                      className="h-7 text-xs px-2.5 rounded-lg cursor-pointer"
                    >
                      Chi tiết
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default AssignedAppealTable;
