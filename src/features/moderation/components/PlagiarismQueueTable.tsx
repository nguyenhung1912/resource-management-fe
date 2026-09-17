import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { PlagiarismScoreGauge } from './PlagiarismScoreGauge';
import type { ModerationResourceItemResponse } from '../types/moderation.types';
import { APP_PATHS } from '@/constants/path';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';

export interface PlagiarismQueueTableProps {
  items: ModerationResourceItemResponse[];
  className?: string;
}

function FileStatusBadge({ statusName }: { statusName?: string }) {
  const name = statusName ?? 'Pending';
  const variantMap: Record<string, string> = {
    Approved: 'bg-success/10 text-success border-success/20',
    Rejected: 'bg-danger/10 text-danger border-danger/20',
    Pending: 'bg-warning/10 text-warning border-warning/20',
  };
  const classes = variantMap[name] ?? 'bg-gray-100 text-text-muted border-border-subtle';
  const dotMap: Record<string, string> = {
    Approved: 'bg-success',
    Rejected: 'bg-danger',
    Pending: 'bg-warning',
  };
  const dot = dotMap[name] ?? 'bg-gray-400';

  const labelMap: Record<string, string> = {
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
    Pending: 'Chờ duyệt',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border select-none',
        classes,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} aria-hidden="true" />
      {labelMap[name] ?? name}
    </span>
  );
}

function EmptyTableState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
        <FileText className="h-6 w-6 text-text-muted" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text-main">Không tìm thấy tài liệu</p>
      <p className="text-xs text-text-muted text-center max-w-xs">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
    </div>
  );
}

// Desktop Table
function DesktopTable({
  items,
  onNavigate,
}: {
  items: ModerationResourceItemResponse[];
  onNavigate: (fileId: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface">
      <Table aria-label="Danh sách tài liệu kiểm tra đạo văn AI">
        <TableHeader>
          <TableRow className="border-b border-border-subtle bg-background hover:bg-background">
            {['Tên tài liệu', 'Chuyên ngành', 'Người upload', 'Ngày tạo', 'Trạng thái', 'Tỷ lệ AI', ''].map((col) => (
              <TableHead
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border-subtle bg-surface">
          {items.map((item) => (
            <TableRow key={item.fileId} className="hover:bg-background/60 transition-colors duration-100">
              {/* Docs Name */}
              <TableCell className="px-4 py-3.5 max-w-55 align-middle">
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-main text-xs leading-snug line-clamp-2" title={item.fileName}>
                      {item.fileName}
                    </p>
                    {item.fileTypeName ? (
                      <p className="text-[11px] text-text-muted mt-0.5">{item.fileTypeName}</p>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              {/* Major */}
              <TableCell className="px-4 py-3.5 align-middle">
                <p className="text-xs text-text-main">{item.subMajorName ?? '—'}</p>
                {item.subMajorCode ? (
                  <p className="text-[11px] text-text-muted font-mono mt-0.5">{item.subMajorCode}</p>
                ) : null}
              </TableCell>

              {/* Uploader */}
              <TableCell className="px-4 py-3.5 align-middle">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <User className="h-3 w-3 text-secondary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-main truncate max-w-30" title={item.uploaderName}>
                      {item.uploaderName ?? '—'}
                    </p>
                    {item.uploaderEmail ? (
                      <p className="text-[11px] text-text-muted truncate max-w-30">{item.uploaderEmail}</p>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              {/* CreatedAt */}
              <TableCell className="px-4 py-3.5 whitespace-nowrap align-middle">
                <p className="text-xs text-text-muted">{formatRelativeTime(item.createdAt)}</p>
              </TableCell>

              {/* Status */}
              <TableCell className="px-4 py-3.5 align-middle">
                <FileStatusBadge statusName={item.fileStatusName} />
              </TableCell>

              <TableCell className="px-4 py-3.5 align-middle">
                <PlagiarismScoreGauge score={item.latestPlagiarismScore} />
              </TableCell>

              <TableCell className="px-4 py-3.5 align-middle text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  iconRight={<ArrowRight className="h-3.5 w-3.5" />}
                  onClick={() => onNavigate(item.fileId)}
                  className="text-xs whitespace-nowrap"
                >
                  Xem chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MobileCard({
  item,
  onNavigate,
}: {
  item: ModerationResourceItemResponse;
  onNavigate: (fileId: string) => void;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4 space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-main leading-snug line-clamp-2">{item.fileName}</p>
            {item.fileTypeName ? <p className="text-[11px] text-text-muted mt-0.5">{item.fileTypeName}</p> : null}
          </div>
        </div>
        <FileStatusBadge statusName={item.fileStatusName} />
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-muted">
        {item.subMajorName ? (
          <span>
            Chuyên ngành: <span className="text-text-main font-medium">{item.subMajorName}</span>
          </span>
        ) : null}
        {item.uploaderName ? (
          <span>
            Người tải: <span className="text-text-main font-medium">{item.uploaderName}</span>
          </span>
        ) : null}
        {item.createdAt ? <span>{formatRelativeTime(item.createdAt)}</span> : null}
      </div>

      {/* Score + Action */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border-subtle/60">
        <PlagiarismScoreGauge score={item.latestPlagiarismScore} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          iconRight={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => onNavigate(item.fileId)}
          className="text-xs shrink-0"
        >
          Xem chi tiết
        </Button>
      </div>
    </div>
  );
}

// Main Component
export function PlagiarismQueueTable({ items, className }: PlagiarismQueueTableProps) {
  const navigate = useNavigate();

  const handleNavigate = (fileId: string) => {
    navigate(APP_PATHS.MODERATION_DETAIL(fileId));
  };

  if (items.length === 0) {
    return (
      <div className={cn('bg-surface rounded-2xl border border-border-subtle shadow-xs', className)}>
        <EmptyTableState />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <DesktopTable items={items} onNavigate={handleNavigate} />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <MobileCard key={item.fileId} item={item} onNavigate={handleNavigate} />
        ))}
      </div>
    </div>
  );
}

export default PlagiarismQueueTable;
