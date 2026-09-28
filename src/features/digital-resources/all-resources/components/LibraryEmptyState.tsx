import { BookX, RotateCcw } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';

export interface LibraryEmptyStateProps {
  onResetFilters: () => void;
  hasFilters?: boolean;
  hasActiveFilters?: boolean;
}

export function LibraryEmptyState({ onResetFilters, hasFilters, hasActiveFilters }: LibraryEmptyStateProps) {
  const isFiltered = hasActiveFilters !== undefined ? hasActiveFilters : (hasFilters ?? true);

  return (
    <EmptyState
      icon={BookX}
      iconBg="bg-primary/10 text-primary"
      title="Không tìm thấy tài liệu trong thư viện"
      description={
        isFiltered
          ? 'Không có giáo trình, khóa luận hoặc đề tài nào khớp với bộ lọc và từ khóa hiện tại. Hãy thử điều chỉnh hoặc đặt lại bộ lọc.'
          : 'Thư viện hiện chưa có tài liệu nào trong danh mục này.'
      }
      action={
        isFiltered ? (
          <Button
            variant="outline"
            size="md"
            onClick={onResetFilters}
            className="gap-2"
            aria-label="Đặt lại tất cả bộ lọc tìm kiếm"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span>Đặt lại bộ lọc</span>
          </Button>
        ) : undefined
      }
    />
  );
}

export default LibraryEmptyState;
