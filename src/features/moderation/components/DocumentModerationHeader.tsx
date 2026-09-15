import { ArrowLeft, Calendar, CheckCircle2, Download, ExternalLink, Sparkles, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import type { ModerationResourceDetailResponse } from '../types/moderation.types';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/cn';

export interface DocumentModerationHeaderProps {
  document: ModerationResourceDetailResponse;
  isCheckingPlagiarism?: boolean;
  onCheckPlagiarism?: () => void;
  onOpenApprove?: () => void;
  onOpenReject?: () => void;
  className?: string;
}

export function DocumentModerationHeader({
  document,
  isCheckingPlagiarism = false,
  onCheckPlagiarism,
  onOpenApprove,
  onOpenReject,
  className,
}: DocumentModerationHeaderProps) {
  const fileUrl = document.fileUrl;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Back button & context indicator */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={APP_PATHS.MODERATION}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-main transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md py-1 pr-2 select-none"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Quay lại hàng đợi kiểm duyệt</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="font-mono text-[11px] bg-background px-2 py-0.5 rounded border border-border-subtle">
            #{document.fileId}
          </span>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl bg-surface border border-border-subtle shadow-xs">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {document.fileTypeName && (
              <Badge variant="primary" showDot={false} className="font-semibold text-[11px]">
                {document.fileTypeName}
              </Badge>
            )}
            {document.subMajorName && (
              <span className="text-xs font-medium text-text-muted">
                {document.subMajorName}
                {document.departmentName ? ` • ${document.departmentName}` : ''}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight leading-snug wrap-break-word">
            {document.fileName}
          </h1>

          {document.createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Thời gian tải lên: {formatDateTime(document.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border-subtle">
          {/* Action: Trigger AI scan */}
          {onCheckPlagiarism && (
            <Button
              type="button"
              variant="outline"
              size="md"
              isLoading={isCheckingPlagiarism}
              disabled={isCheckingPlagiarism}
              iconLeft={<Sparkles className="h-4 w-4 text-primary" />}
              onClick={onCheckPlagiarism}
              className="hover:bg-primary/5 active:bg-primary/10"
            >
              Quét trùng lặp AI
            </Button>
          )}

          {/* Action: Download file or external open */}
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-lg text-xs sm:text-sm font-medium bg-surface text-text-main border border-border-subtle hover:bg-gray-50 active:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-gray-300 shadow-xs select-none"
            >
              <Download className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <span className="hidden sm:inline">Tải tệp gốc</span>
              <ExternalLink className="h-3.5 w-3.5 text-text-muted sm:hidden" aria-hidden="true" />
            </a>
          )}

          {/* Action: Reject Modal */}
          {onOpenReject && (
            <Button
              type="button"
              variant="danger"
              size="md"
              iconLeft={<XCircle className="h-4 w-4" />}
              onClick={onOpenReject}
              className="bg-danger hover:bg-red-700 active:bg-red-800"
            >
              Từ chối
            </Button>
          )}

          {/* Action: Approve Modal */}
          {onOpenApprove && (
            <Button
              type="button"
              size="md"
              iconLeft={<CheckCircle2 className="h-4 w-4" />}
              onClick={onOpenApprove}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus-visible:ring-emerald-500/40"
            >
              Phê duyệt
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentModerationHeader;
