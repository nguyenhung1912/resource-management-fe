import { BookOpen, Code, Download, Eye, FileText, Files, GraduationCap, HardDrive, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { LibraryResourceItem } from '../types/all-resources.types';
import { formatFileSize, getFileTypeBadgeClass } from '../utils/allResourcesUtils';

export interface LibraryResourceCardProps {
  item: LibraryResourceItem;
  onSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName?: string) => void;
  isDownloading?: boolean;
}

function FallbackCoverIcon({ fileTypeName }: { fileTypeName?: string | null }) {
  if (/bài giảng|giáo trình/i.test(fileTypeName || '')) {
    return <BookOpen className="size-5.5" aria-hidden="true" />;
  }
  if (/khóa luận|luận văn/i.test(fileTypeName || '')) {
    return <GraduationCap className="size-5.5" aria-hidden="true" />;
  }
  if (/báo cáo|đề tài/i.test(fileTypeName || '')) {
    return <FileText className="size-5.5" aria-hidden="true" />;
  }
  if (/mã nguồn|source\s*code/i.test(fileTypeName || '')) {
    return <Code className="size-5.5" aria-hidden="true" />;
  }
  return <Files className="size-5.5" aria-hidden="true" />;
}

export function LibraryResourceCard({ item, onSelect, onDownload, isDownloading = false }: LibraryResourceCardProps) {
  const bannerSrc = item.bannerUrl || item.bannerImage;
  const formattedSize = formatFileSize(item.fileSize);
  const badgeClass = getFileTypeBadgeClass(item.fileTypeName);

  return (
    <article className="rounded-xl border border-border-subtle bg-surface shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Cover Banner / Academic Book Spine Fallback */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 select-none">
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={item.fileName}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="size-full bg-linear-to-br from-blue-50/80 via-slate-50 to-indigo-50/60 flex flex-col items-center justify-center p-4 text-center">
              <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-2xs transition-transform duration-300 group-hover:scale-110">
                <FallbackCoverIcon fileTypeName={item.fileTypeName} />
              </div>
              <span className="text-xs font-semibold text-text-main line-clamp-1 max-w-[80%]">
                {item.courseCode || item.subMajorCode || 'Học liệu số'}
              </span>
              <span className="text-[11px] text-text-muted mt-0.5">Thư viện QNU</span>
            </div>
          )}

          {/* Top-left: File Type Pill Badge */}
          {item.fileTypeName && (
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-xs border',
                  badgeClass,
                )}
              >
                {item.fileTypeName}
              </span>
            </div>
          )}

          {/* Top-right: Year Completed or Status Dot */}
          {item.yearCompleted && (
            <div className="absolute top-3 right-3">
              <Badge variant="neutral" className="bg-surface/95 backdrop-blur-xs font-semibold shadow-xs">
                {item.yearCompleted}
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <h3 className="font-semibold text-sm sm:text-base text-text-main line-clamp-2 leading-snug">
            <button
              type="button"
              onClick={() => onSelect(item.fileId)}
              className="text-left hover:text-primary transition-colors cursor-pointer"
              title={item.fileName}
            >
              {item.fileName}
            </button>
          </h3>

          {item.fileDescription && (
            <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{item.fileDescription}</p>
          )}

          {/* Academic & Author Metadata */}
          <div className="pt-1.5 space-y-1.5 text-xs text-text-muted">
            <div className="flex items-center gap-1.5 truncate">
              <User className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
              <span className="truncate" title={item.uploadBy || 'Tác giả chưa cập nhật'}>
                {item.uploadBy || 'Tác giả chưa cập nhật'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {item.subMajorCode && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-text-main">{item.subMajorCode}</span>
              )}
              {item.courseCode && (
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-primary font-medium">{item.courseCode}</span>
              )}
              {formattedSize && (
                <span className="inline-flex items-center gap-1 text-text-muted ml-auto">
                  <HardDrive className="size-3" aria-hidden="true" />
                  {formattedSize}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 sm:px-5 border-t border-border-subtle/70 bg-gray-50/50 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(item.fileId)}
          className="gap-1.5 text-xs h-8 flex-1"
          aria-label={`Xem chi tiết tài liệu ${item.fileName}`}
        >
          <Eye className="size-3.5" aria-hidden="true" />
          <span>Chi tiết</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onDownload(item.fileId, item.fileName)}
          disabled={isDownloading}
          className="gap-1.5 text-xs h-8 flex-1 shadow-2xs"
          aria-label={`Tải xuống tài liệu ${item.fileName}`}
        >
          <Download className="size-3.5" aria-hidden="true" />
          <span>Tải về</span>
        </Button>
      </div>
    </article>
  );
}

export default LibraryResourceCard;
