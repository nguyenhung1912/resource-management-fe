import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { APP_PATHS } from '@/constants/path';
import type { SearchResultItem } from '@/features/home/types/home.types';
import { cn } from '@/utils/cn';
import { HomeResourceCard } from './HomeResourceCard';

export interface HomeResourceGridProps {
  resources: SearchResultItem[];
  totalCount: number;
  className?: string;
}

export function HomeResourceGrid({ resources, totalCount, className }: HomeResourceGridProps) {
  return (
    <section aria-label="Danh sách học liệu nổi bật" className={cn('space-y-4', className)}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>

          <h2 className="text-lg font-bold tracking-tight text-text-main">Học liệu & Tài nguyên Mới nhất</h2>

          <Badge variant="neutral" className="text-xs font-semibold rounded-full px-2 py-0.5">
            {totalCount} tài liệu
          </Badge>
        </div>

        <Link
          to={APP_PATHS.ALL_RESOURCES}
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors select-none"
        >
          <span>Khám phá toàn bộ kho học liệu</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>

      {/* Grid Content or Empty State */}
      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((item) => (
            <HomeResourceCard key={item.fileId} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Chưa có tài liệu học thuật nào"
          description="Hiện chưa có tài liệu nào trong danh mục hoặc trạng thái này. Bạn có thể tải lên tài liệu mới để bắt đầu lưu trữ."
          className="border border-border-subtle rounded-xl bg-surface py-12"
        />
      )}
    </section>
  );
}

export default HomeResourceGrid;
