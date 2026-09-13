import { ExternalLink, Eye, FileText, Gavel, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-background/50 text-text-muted uppercase tracking-wider font-semibold text-[11px]">
              <th scope="col" className="py-3 px-4 sm:px-6">
                Mã đơn / Lần gửi
              </th>
              <th scope="col" className="py-3 px-4 sm:px-6">
                Tài liệu nghiên cứu
              </th>
              <th scope="col" className="py-3 px-4 sm:px-6 hidden md:table-cell">
                Sinh viên gửi đơn
              </th>
              <th scope="col" className="py-3 px-4 sm:px-6 hidden lg:table-cell">
                Thời gian
              </th>
              <th scope="col" className="py-3 px-4 sm:px-6">
                Trạng thái
              </th>
              <th scope="col" className="py-3 px-4 sm:px-6 text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-main">
            {items.map((item) => {
              const isPending = item.status === 'Pending';

              return (
                <tr key={item.appealId} className="hover:bg-gray-50/80 transition-colors duration-100 group">
                  {/* Appeal ID & Attempt */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                    <div className="font-mono font-medium text-text-main text-xs">{item.appealId}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">Lần giải trình: {item.appealAttempt}</div>
                  </td>

                  {/* File Name & Snippet */}
                  <td className="py-3.5 px-4 sm:px-6 max-w-xs sm:max-w-sm">
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
                          {item.fileUrl && (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Mở file ${item.fileName}`}
                              className="text-text-muted hover:text-primary transition-colors shrink-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <span
                          className="text-[11px] text-text-muted block line-clamp-1 mt-0.5"
                          title={item.studentExplanation}
                        >
                          {item.studentExplanation}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Student Info */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-text-main">
                      <User className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                      <span className="font-medium">{item.studentName || 'Sinh viên'}</span>
                    </div>
                    {item.studentEmail && (
                      <div className="text-[11px] text-text-muted pl-5 mt-0.5">{item.studentEmail}</div>
                    )}
                  </td>

                  {/* Time */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-text-main">{formatDateTime(item.createdAt)}</div>
                    {item.resolvedAt && (
                      <div className="text-[11px] text-text-muted mt-0.5">Xử lý: {formatDateTime(item.resolvedAt)}</div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                    <AppealStatusBadge status={item.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {isPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onResolve(item)}
                          iconLeft={<Gavel className="h-3.5 w-3.5" />}
                          className="h-7 text-xs px-2.5 rounded-lg shadow-2xs font-semibold"
                        >
                          Phân xử
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewDetail(item)}
                        iconLeft={<Eye className="h-3.5 w-3.5 text-text-muted" />}
                        className="h-7 text-xs px-2.5 rounded-lg"
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignedAppealTable;
