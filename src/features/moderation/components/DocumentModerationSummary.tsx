import { Calendar, ExternalLink, Sparkles, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { ModerationTargetDocument } from '../types/moderation.types';
import { formatDateTime } from '@/utils/date';

export interface DocumentModerationSummaryProps {
  document: ModerationTargetDocument;
  className?: string;
}

export function DocumentModerationSummary({ document, className }: DocumentModerationSummaryProps) {
  const plagiarismScore = document.latestPlagiarismScore;

  // Xác định cấu hình hiển thị điểm trùng lặp
  const getPlagiarismBadge = () => {
    if (typeof plagiarismScore !== 'number') {
      return (
        <Badge variant="neutral" showDot>
          Chưa quét AI
        </Badge>
      );
    }

    if (plagiarismScore < 20) {
      return (
        <Badge variant="success" showDot>
          Trùng lặp {plagiarismScore}% (Thấp)
        </Badge>
      );
    }

    if (plagiarismScore <= 30) {
      return (
        <Badge variant="warning" showDot>
          Trùng lặp {plagiarismScore}% (Lưu ý)
        </Badge>
      );
    }

    return (
      <Badge variant="danger" showDot>
        Trùng lặp {plagiarismScore}% (Vượt ngưỡng)
      </Badge>
    );
  };

  return (
    <div className={`p-4 rounded-xl bg-background border border-border-subtle space-y-3 ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Tài liệu kiểm duyệt #{document.fileId}
            </span>
            {document.fileTypeName && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {document.fileTypeName}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-text-main leading-snug wrap-break-word">{document.fileName}</h3>

          {(document.subMajorName || document.departmentName) && (
            <p className="text-xs text-text-muted">
              {[document.subMajorName, document.departmentName].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>

        {document.fileUrl && (
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline shrink-0 bg-surface px-3 py-1.5 rounded-lg border border-border-subtle shadow-2xs hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Xem file</span>
          </a>
        )}
      </div>

      {/* Thông tin người upload, thời gian nộp và tỷ lệ trùng lặp */}
      <div className="pt-2 border-t border-border-subtle/80 flex flex-wrap items-center justify-between gap-2.5 text-xs text-text-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {document.uploaderName && (
            <div className="flex items-center gap-1.5 text-text-main font-medium">
              <User className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <span>{document.uploaderName}</span>
              {document.uploaderEmail && (
                <span className="text-text-muted font-normal">({document.uploaderEmail})</span>
              )}
            </div>
          )}

          {document.createdAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{formatDateTime(document.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Điểm trùng lặp AI */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
          {getPlagiarismBadge()}
        </div>
      </div>
    </div>
  );
}

export default DocumentModerationSummary;
