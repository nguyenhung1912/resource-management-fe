import { Clock, ExternalLink, FileText, User } from 'lucide-react';
import { PlagiarismScoreGauge } from './PlagiarismScoreGauge';
import { ModerationQueueRowActions } from './ModerationQueueRowActions';
import { getModerationUploaderName, type ModerationResourceItemResponse } from '../types/moderation.types';
import { formatDateTime, formatRelativeTime } from '@/utils/date';

import { cn } from '@/utils/cn';

export interface ModerationQueueMobileCardProps {
  item: ModerationResourceItemResponse;
  isCheckingPlagiarism?: boolean;
  onCheckPlagiarism: (fileId: string) => void;
  onApprove: (item: ModerationResourceItemResponse) => void;
  onReject: (item: ModerationResourceItemResponse) => void;
  onViewDetail: (fileId: string) => void;
  className?: string;
}

export function ModerationQueueMobileCard({
  item,
  isCheckingPlagiarism = false,
  onCheckPlagiarism,
  onApprove,
  onReject,
  onViewDetail,
  className,
}: ModerationQueueMobileCardProps) {
  return (
    <article
      aria-label={`Tài liệu ${item.fileName}`}
      className={cn(
        'bg-surface rounded-2xl border border-border-subtle p-4 shadow-xs space-y-3.5 transition-all hover:border-border select-none',
        className,
      )}
    >
      {/* Header: Title & FileType */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
              {item.fileTypeName ?? 'Tài liệu'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded bg-neutral-100 text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" aria-hidden="true" />
              Chờ duyệt
            </span>
          </div>

          <h4
            onClick={() => onViewDetail(item.fileId)}
            className="text-sm font-semibold text-text-main hover:text-primary cursor-pointer line-clamp-2 leading-snug pt-0.5"
          >
            {item.fileName}
          </h4>
        </div>

        {item.fileUrl && (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Mở file gốc ${item.fileName}`}
            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-neutral-100 transition-colors shrink-0"
            title="Mở file gốc trong tab mới"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Meta: Uploader & Academic Scope */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-muted pt-1 border-t border-border-subtle/50">
        <div className="flex items-center gap-1.5 truncate">
          <User className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span className="truncate">{getModerationUploaderName(item)}</span>
        </div>

        <div
          className="flex items-center gap-1.5 truncate"
          title={item.createdAt ? formatDateTime(item.createdAt) : ''}
        >
          <Clock className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span>{formatRelativeTime(item.createdAt)}</span>
        </div>

        {item.subMajorName && (
          <div className="sm:col-span-2 text-[11px] text-text-muted truncate">
            <span className="font-medium text-text-main">Chuyên ngành: </span>
            {item.subMajorName}
          </div>
        )}
      </div>

      {/* Plagiarism AI Gauge */}
      <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between gap-2">
        <span className="text-xs text-text-muted font-medium">Tỷ lệ tương đồng AI:</span>
        <PlagiarismScoreGauge score={item.latestPlagiarismScore ?? item.latestModeration?.plagiarismScore} compact />
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-end">
        <ModerationQueueRowActions
          item={item}
          isCheckingPlagiarism={isCheckingPlagiarism}
          onCheckPlagiarism={onCheckPlagiarism}
          onApprove={onApprove}
          onReject={onReject}
          onViewDetail={onViewDetail}
        />
      </div>
    </article>
  );
}

export default ModerationQueueMobileCard;
