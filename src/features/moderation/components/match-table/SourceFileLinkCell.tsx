import { memo } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { APP_PATHS } from '@/constants/path';
import { cn } from '@/utils/cn';

export interface SourceFileLinkCellProps {
  sourceFileId: string;
  sourceFileName: string;
  className?: string;
}

export const SourceFileLinkCell = memo(function SourceFileLinkCell({
  sourceFileId,
  sourceFileName,
  className,
}: SourceFileLinkCellProps) {
  const hasFileId = Boolean(sourceFileId && sourceFileId.trim().length > 0);
  const detailUrl = hasFileId ? APP_PATHS.RESOURCE_DETAIL(sourceFileId) : null;
  const downloadUrl = hasFileId ? `/api/Resources/${encodeURIComponent(sourceFileId)}/download` : null;

  return (
    <div className={cn('flex items-start gap-2.5 max-w-sm sm:max-w-md min-w-50', className)}>
      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <FileText className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        {detailUrl ? (
          <a
            href={detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex items-center gap-1 font-medium text-xs text-text-main hover:text-primary transition-colors max-w-full leading-tight"
            title={`Xem chi tiết tài liệu: ${sourceFileName}`}
          >
            <span className="truncate">{sourceFileName}</span>
            <ExternalLink
              className="h-3 w-3 shrink-0 text-text-muted group-hover/link:text-primary transition-colors"
              aria-hidden="true"
            />
          </a>
        ) : (
          <span className="font-medium text-xs text-text-main truncate block" title={sourceFileName}>
            {sourceFileName}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
          {hasFileId ? (
            <>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-background border border-border-subtle shrink-0">
                ID: {sourceFileId}
              </span>

              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  download
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary-hover hover:underline transition-colors shrink-0"
                  title="Tải tệp tin nguồn gốc để đối chiếu trực tiếp"
                >
                  <Download className="h-3 w-3" aria-hidden="true" />
                  <span>Tải file gốc</span>
                </a>
              ) : null}
            </>
          ) : (
            <span className="text-[10px] italic">Tài liệu tham khảo đối chiếu</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default SourceFileLinkCell;
