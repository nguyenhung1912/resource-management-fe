import { CheckCircle2, FileSearch, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface ModerationQueueEmptyStateProps {
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  className?: string;
}

export function ModerationQueueEmptyState({
  hasActiveFilters = false,
  onResetFilters,
  className,
}: ModerationQueueEmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <div
        role="status"
        aria-label="Không có kết quả lọc"
        className={cn(
          'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface rounded-2xl border border-border-subtle shadow-xs',
          className,
        )}
      >
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3.5">
          <FileSearch className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-text-main mb-1">Không tìm thấy tài liệu phù hợp</h3>
        <p className="text-xs sm:text-sm text-text-muted max-w-sm mb-4">
          Không có tài liệu nào trong hàng đợi khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại.
        </p>
        {onResetFilters && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onResetFilters}
            iconLeft={<RotateCcw className="h-3.5 w-3.5" />}
            className="cursor-pointer"
          >
            Đặt lại bộ lọc
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Hàng đợi trống"
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface rounded-2xl border border-border-subtle shadow-xs',
        className,
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-success flex items-center justify-center mb-3.5">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-text-main mb-1">Hàng đợi kiểm duyệt đang trống</h3>
      <p className="text-xs sm:text-sm text-text-muted max-w-sm">
        Hiện tại không có tài liệu nào đang chờ duyệt. Tất cả tài liệu đã được thẩm định hoàn tất.
      </p>
    </div>
  );
}

export default ModerationQueueEmptyState;
