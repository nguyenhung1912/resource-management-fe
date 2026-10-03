import { Calendar, FileText, GraduationCap, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { SearchResultItem } from '@/features/home/types/home.types';
import { cn } from '@/utils/cn';

export interface HomeResourceCardProps {
  item: SearchResultItem;
  className?: string;
}

export function HomeResourceCard({ item, className }: HomeResourceCardProps) {
  const displayTitle = item.fileName || 'Tài liệu không tên';
  const displayAuthor = item.uploadBy || 'Tác giả ẩn danh';
  const displayYear = item.yearCompleted ? String(item.yearCompleted) : null;
  const displayType = item.fileTypeName || 'Tài liệu học thuật';

  return (
    <article
      aria-label={displayTitle}
      className={cn(
        'group flex flex-col justify-between rounded-xl border border-border-subtle bg-surface p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm select-none',
        className,
      )}
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="primary" className="rounded-full text-[11px] font-semibold py-0.5 px-2.5">
            <FileText className="size-3 mr-1" aria-hidden="true" />
            <span className="truncate max-w-36">{displayType}</span>
          </Badge>

          {displayYear ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
              <Calendar className="size-3" aria-hidden="true" />
              {displayYear}
            </span>
          ) : null}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-sm font-bold text-text-main line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {displayTitle}
          </h3>

          {item.fileDescription ? (
            <p className="mt-1.5 text-xs text-text-muted line-clamp-2 leading-relaxed">{item.fileDescription}</p>
          ) : null}
        </div>

        {/* Keywords */}
        {item.keywords && item.keywords.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {item.keywords.slice(0, 3).map((kw) => (
              <span
                key={kw}
                className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-text-muted truncate max-w-32"
              >
                #{kw}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Metadata Footer */}
      <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <UserRound className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
          <span className="truncate font-medium text-text-main">{displayAuthor}</span>
        </div>

        {item.subMajorCode ? (
          <div className="flex items-center gap-1 shrink-0 text-[11px] font-medium bg-neutral-100 px-2 py-0.5 rounded-md text-text-muted">
            <GraduationCap className="size-3 shrink-0" aria-hidden="true" />
            <span>{item.subMajorCode}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default HomeResourceCard;
