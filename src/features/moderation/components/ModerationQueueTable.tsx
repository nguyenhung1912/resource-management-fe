import { Clock, ExternalLink, FileText, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { PlagiarismScoreGauge } from './PlagiarismScoreGauge';
import { ModerationQueueMobileCard } from './ModerationQueueMobileCard';
import { ModerationQueueRowActions } from './ModerationQueueRowActions';
import { ModerationQueueEmptyState } from './ModerationQueueEmptyState';
import type { ModerationResourceItemResponse } from '../types/moderation.types';
import { formatDateTime, formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';

export interface ModerationQueueTableProps {
  items: ModerationResourceItemResponse[];
  checkingPlagiarismFileIds?: Set<string>;
  onCheckPlagiarism: (fileId: string) => void;
  onApprove: (item: ModerationResourceItemResponse) => void;
  onReject: (item: ModerationResourceItemResponse) => void;
  onViewDetail: (fileId: string) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  className?: string;
}

export function ModerationQueueTable({
  items,
  checkingPlagiarismFileIds,
  onCheckPlagiarism,
  onApprove,
  onReject,
  onViewDetail,
  hasActiveFilters = false,
  onResetFilters,
  className,
}: ModerationQueueTableProps) {
  if (items.length === 0) {
    return (
      <ModerationQueueEmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile & Tablet Cards View (< lg) */}
      <div className="block lg:hidden space-y-3">
        {items.map((item) => (
          <ModerationQueueMobileCard
            key={item.fileId}
            item={item}
            isCheckingPlagiarism={checkingPlagiarismFileIds?.has(item.fileId)}
            onCheckPlagiarism={onCheckPlagiarism}
            onApprove={onApprove}
            onReject={onReject}
            onViewDetail={onViewDetail}
          />
        ))}
      </div>

      {/* Desktop Table View (>= lg) */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-xs">
        <Table aria-label="Bảng danh sách hàng đợi kiểm duyệt">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[32%]">Tên tài liệu & Định dạng</TableHead>
              <TableHead className="w-[20%]">Người tải & Thời gian</TableHead>
              <TableHead className="w-[16%]">Chuyên ngành</TableHead>
              <TableHead className="w-[14%]">Đạo văn AI</TableHead>
              <TableHead className="w-[10%]">Trạng thái</TableHead>
              <TableHead className="w-[8%] text-right pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => {
              const isChecking = checkingPlagiarismFileIds?.has(item.fileId) ?? false;

              return (
                <TableRow key={item.fileId} className="group">
                  {/* Cột 1: Tên tài liệu & Loại */}
                  <TableCell className="py-3.5 pl-6 align-middle">
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                          <FileText className="h-3 w-3" aria-hidden="true" />
                          {item.fileTypeName ?? 'Tài liệu'}
                        </span>

                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Mở file gốc ${item.fileName}`}
                            title="Mở file gốc"
                            className="text-text-muted hover:text-primary transition-colors p-0.5 rounded"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onViewDetail(item.fileId)}
                        className="text-left font-medium text-text-main group-hover:text-primary transition-colors line-clamp-1 text-sm cursor-pointer select-none"
                        title={item.fileName}
                      >
                        {item.fileName}
                      </button>

                      {item.fileDescription && (
                        <p className="text-xs text-text-muted line-clamp-1 max-w-md">{item.fileDescription}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Cột 2: Người tải & Thời gian */}
                  <TableCell className="py-3.5 align-middle">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-text-main truncate max-w-50">
                        <User className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.uploaderName ?? item.uploaderEmail ?? 'Người dùng'}</span>
                      </div>

                      <div
                        className="flex items-center gap-1.5 text-text-muted text-[11px]"
                        title={item.createdAt ? formatDateTime(item.createdAt) : ''}
                      >
                        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span>{formatRelativeTime(item.createdAt)}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Cột 3: Chuyên ngành */}
                  <TableCell className="py-3.5 align-middle">
                    <div className="text-xs text-text-main truncate max-w-40" title={item.subMajorName ?? ''}>
                      {item.subMajorName ?? '-'}
                    </div>
                  </TableCell>

                  {/* Cột 4: Tỷ lệ đạo văn AI */}
                  <TableCell className="py-3.5 align-middle">
                    <PlagiarismScoreGauge score={item.latestPlagiarismScore} />
                  </TableCell>

                  {/* Cột 5: Trạng thái */}
                  <TableCell className="py-3.5 align-middle">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20 select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" aria-hidden="true" />
                      Chờ duyệt
                    </span>
                  </TableCell>

                  {/* Cột 6: Thao tác */}
                  <TableCell className="py-3.5 pr-6 align-middle text-right">
                    <div className="flex justify-end">
                      <ModerationQueueRowActions
                        item={item}
                        isCheckingPlagiarism={isChecking}
                        onCheckPlagiarism={onCheckPlagiarism}
                        onApprove={onApprove}
                        onReject={onReject}
                        onViewDetail={onViewDetail}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ModerationQueueTable;
