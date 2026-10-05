import { Fragment } from 'react';
import { Clock, ExternalLink, FileText, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { PlagiarismScoreGauge } from './PlagiarismScoreGauge';
import { ModerationQueueMobileCard } from './ModerationQueueMobileCard';
import { ModerationQueueEmptyState } from './ModerationQueueEmptyState';
import { PlagiarismCheckResult } from './PlagiarismCheckResult';
import {
  getModerationUploaderName,
  type ModerationResourceItemResponse,
  type PlagiarismCheckResponse,
} from '../types/moderation.types';
import { formatDateTime, formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';

export interface ModerationQueueTableProps {
  items: ModerationResourceItemResponse[];
  plagiarismResults?: Record<string, PlagiarismCheckResponse>;
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
  plagiarismResults = {},
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
            plagiarismResult={plagiarismResults[item.fileId]}
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
              <TableHead className="w-[40%] pl-6">Tên tài liệu & Định dạng</TableHead>
              <TableHead className="w-[22%]">Người tải & Thời gian</TableHead>
              <TableHead className="w-[18%]">Chuyên ngành</TableHead>
              <TableHead className="w-[10%]">Đạo văn AI</TableHead>
              <TableHead className="w-[10%] pr-6">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => {
              const result = plagiarismResults[item.fileId];
              return (
                <Fragment key={item.fileId}>
                  <TableRow className="group hover:bg-neutral-50/60 transition-colors">
                    {/* Cột 1: Tên tài liệu & Loại */}
                    <TableCell className="py-3 pl-6 align-middle">
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewDetail(item.fileId)}
                            className="text-left font-medium text-text-main hover:text-primary transition-colors line-clamp-1 text-sm cursor-pointer select-none"
                            title={item.fileName}
                          >
                            {item.fileName}
                          </button>

                          {item.fileUrl && (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Mở file gốc ${item.fileName}`}
                              title="Mở file gốc"
                              className="text-text-muted hover:text-primary transition-colors p-0.5 rounded shrink-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.2 rounded bg-neutral-100 text-text-muted border border-border-subtle shrink-0">
                            <FileText className="h-3 w-3" aria-hidden="true" />
                            {item.fileTypeName ?? 'Tài liệu'}
                          </span>
                          {item.fileDescription && (
                            <span className="text-xs text-text-muted line-clamp-1 max-w-sm">
                              {item.fileDescription}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Người tải & Thời gian */}
                    <TableCell className="py-3 align-middle">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-text-main truncate max-w-50">
                          <User className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
                          <span className="truncate">{getModerationUploaderName(item)}</span>
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
                    <TableCell className="py-3 align-middle">
                      <div className="text-xs text-text-muted truncate max-w-40" title={item.subMajorName ?? ''}>
                        {item.subMajorName ?? '-'}
                      </div>
                    </TableCell>

                    {/* Cột 4: Tỷ lệ đạo văn AI */}
                    <TableCell className="py-3 align-middle">
                      <PlagiarismScoreGauge
                        score={item.latestPlagiarismScore ?? item.latestModeration?.plagiarismScore}
                      />
                    </TableCell>

                    {/* Cột 5: Trạng thái */}
                    <TableCell className="py-3 pr-6 align-middle">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-normal text-text-muted bg-neutral-100 select-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" aria-hidden="true" />
                        Chờ duyệt
                      </span>
                    </TableCell>
                  </TableRow>
                  {result && (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-0">
                        <PlagiarismCheckResult result={result} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ModerationQueueTable;
