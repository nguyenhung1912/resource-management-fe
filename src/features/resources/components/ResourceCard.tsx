import {
  CalendarDays,
  Eye,
  FileAudio2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Star,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ResourceCardProps {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string | null;
  fileType: string;
  views: number;
  rating: number;
  updatedAt: string;
  className?: string;
}

// Cấu hình icon theo loại file để người dùng nhanh nhận biết định dạng tài liệu.
function FileIconRenderer({ fileType, ...props }: { fileType: string } & LucideProps) {
  const normalizedType = fileType.trim().toLowerCase();

  if (normalizedType.includes('pdf') || normalizedType.includes('doc') || normalizedType.includes('text')) {
    return <FileText {...props} />;
  }

  if (normalizedType.includes('image') || normalizedType.includes('png') || normalizedType.includes('jpg')) {
    return <FileImage {...props} />;
  }

  if (normalizedType.includes('video') || normalizedType.includes('mp4') || normalizedType.includes('mov')) {
    return <FileVideo {...props} />;
  }

  if (normalizedType.includes('excel') || normalizedType.includes('sheet') || normalizedType.includes('csv')) {
    return <FileSpreadsheet {...props} />;
  }

  if (normalizedType.includes('audio') || normalizedType.includes('mp3')) {
    return <FileAudio2 {...props} />;
  }

  return <FileText {...props} />;
}

// Định dạng ngày theo chuẩn Việt Nam để card luôn dễ đọc và đồng nhất với phần còn lại của app.
function formatUpdatedAt(updatedAt: string) {
  const parsedDate = new Date(updatedAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Vừa cập nhật';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
}

export function ResourceCard({
  id,
  title,
  author,
  thumbnailUrl,
  fileType,
  views,
  rating,
  updatedAt,
  className,
}: ResourceCardProps) {
  const normalizedFileType = fileType.trim() || 'Tài liệu';
  const formattedUpdatedAt = formatUpdatedAt(updatedAt);

  return (
    <article
      id={id}
      className={cn(
        'group overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
      aria-label={`Tài nguyên ${title}`}
    >
      {/* Khu vực ảnh thumbnail: nếu có URL hợp lệ thì hiển thị ảnh bìa, nếu không thì hiển thị khối placeholder theo chuẩn design system. */}
      <div className="relative h-40 overflow-hidden border-b border-border bg-background">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-background">
            <div className="flex size-16 items-center justify-center rounded-xl border border-border bg-surface text-primary shadow-sm">
              <FileIconRenderer fileType={normalizedFileType} className="size-8" strokeWidth={1.7} aria-hidden="true" />
            </div>
          </div>
        )}

        <span className="absolute right-3 top-3 inline-flex rounded-full border border-border bg-surface/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted backdrop-blur-sm">
          {normalizedFileType}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* Thông tin chính của tài liệu: tiêu đề to rõ, tác giả mờ nhẹ và ngày cập nhật giúp người dùng biết độ mới của nội dung. */}
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-text-main">{title}</h3>
          <div className="flex items-center justify-between gap-2 text-sm text-text-muted">
            <span className="truncate">{author}</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <CalendarDays className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              {formattedUpdatedAt}
            </span>
          </div>
        </div>

        {/* Dòng thống kê dưới cùng dùng icon rõ nghĩa và điều hòa với thiết kế dashboard chuyên nghiệp. */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Eye className="size-3.5 text-primary" strokeWidth={1.9} aria-hidden="true" />
            <span>{views.toLocaleString('vi-VN')}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Star className="size-3.5 text-warning" strokeWidth={1.9} aria-hidden="true" />
            <span>{rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <FileIconRenderer
              fileType={normalizedFileType}
              className="size-3.5 text-secondary"
              strokeWidth={1.9}
              aria-hidden="true"
            />
            <span>{normalizedFileType}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ResourceCard;
