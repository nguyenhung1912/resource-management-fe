import { Code2, Download, ExternalLink, Eye, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { SourceCodeItem } from '@/features/digital-resources/source-code/types/source-code.types';
import { formatYearCompleted, getSourceCodeStatusBadge, isValidGithubUrl } from '../utils/sourceCodeUtils';

export interface SourceCodeCardItemProps {
  item: SourceCodeItem;
  onSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName?: string) => void;
}

export function SourceCodeCardItem({ item, onSelect, onDownload }: SourceCodeCardItemProps) {
  const statusBadge = getSourceCodeStatusBadge(item.fileStatusId, item.fileStatusName);
  const hasGithub = isValidGithubUrl(item.githubLink);

  return (
    <article
      aria-label={`Dự án: ${item.fileName}`}
      className="group relative flex flex-col rounded-xl border border-border-subtle bg-surface shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 overflow-hidden"
    >
      {/* Thumbnail Header / Tech Banner */}
      <div className="relative h-40 w-full overflow-hidden bg-linear-to-br from-dashboard-shell to-slate-900 flex items-center justify-center select-none">
        {item.bannerUrl ? (
          <img
            src={item.bannerUrl}
            alt={`Banner ${item.fileName}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/70 space-y-1.5 p-4 text-center">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-primary backdrop-blur-xs">
              <Code2 className="size-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xs font-mono font-medium tracking-wider text-slate-300">
              {item.courseCode || item.subMajorCode || 'SOURCE CODE'}
            </span>
          </div>
        )}

        {/* Status Badge overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant={statusBadge.variant} className="shadow-sm backdrop-blur-md bg-surface/90 font-medium">
            {statusBadge.label}
          </Badge>
        </div>

        {/* Year Pill overlay */}
        {item.yearCompleted ? (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 text-white backdrop-blur-xs">
              Năm {formatYearCompleted(item.yearCompleted)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
        {/* Academic context tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {item.subMajorCode ? (
            <Badge variant="neutral" showDot={false} className="text-[11px] font-medium">
              {item.subMajorCode}
            </Badge>
          ) : null}
          {item.courseCode ? (
            <Badge variant="neutral" showDot={false} className="text-[11px] font-medium text-text-muted">
              {item.courseCode}
            </Badge>
          ) : null}
        </div>

        {/* Title */}
        <h2
          onClick={() => onSelect(item.fileId)}
          className="text-base font-bold text-text-main leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer"
          title={item.fileName}
        >
          {item.fileName}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-muted line-clamp-2 leading-relaxed flex-1">
          {item.fileDescription || 'Dự án học liệu mã nguồn lập trình phục vụ nghiên cứu và tham khảo.'}
        </p>

        {/* Footer Action Toolbar */}
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
          {/* GitHub Repo Button */}
          {hasGithub && item.githubLink ? (
            <a
              href={item.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Mở repository GitHub của ${item.fileName}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-main hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
            >
              <GitBranch className="size-3.5 text-primary" aria-hidden="true" />
              <span>GitHub</span>
              <ExternalLink className="size-3 text-text-muted" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-[11px] text-text-muted italic">Mã nguồn lưu trữ</span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelect(item.fileId)}
              aria-label={`Xem chi tiết dự án ${item.fileName}`}
            >
              <Eye className="size-3.5 mr-1" aria-hidden="true" />
              Chi tiết
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onDownload(item.fileId, item.fileName)}
              aria-label={`Tải mã nguồn ${item.fileName}`}
            >
              <Download className="size-3.5 mr-1" aria-hidden="true" />
              Tải về
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default SourceCodeCardItem;
