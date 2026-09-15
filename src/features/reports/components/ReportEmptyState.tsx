import { RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ReportStatus, ReportTargetType } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface ReportEmptyStateProps {
  currentStatus?: ReportStatus;
  currentTargetType?: ReportTargetType;
  searchQuery?: string;
  onResetFilters?: () => void;
  className?: string;
}

export function ReportEmptyState({
  currentStatus,
  currentTargetType,
  searchQuery,
  onResetFilters,
  className,
}: ReportEmptyStateProps) {
  const isFiltering = Boolean(currentStatus || currentTargetType || (searchQuery && searchQuery.length > 0));

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface rounded-xl border border-border shadow-xs',
        className,
      )}
    >
      <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
      </div>

      <h2 className="text-base sm:text-lg font-bold text-text-main mb-1">
        {isFiltering ? 'Không tìm thấy báo cáo phù hợp' : 'Không có báo cáo vi phạm nào'}
      </h2>

      <p className="text-xs sm:text-sm text-text-muted max-w-md mb-6 leading-relaxed">
        {isFiltering
          ? 'Không có báo cáo vi phạm nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại. Bạn hãy thử điều chỉnh lại điều kiện lọc.'
          : 'Hệ thống hiện tại chưa có báo cáo vi phạm nào cần xử lý. Mọi tài nguyên, bình luận và tài khoản đang hoạt động bình thường.'}
      </p>

      {isFiltering && onResetFilters && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetFilters}
          iconLeft={<RotateCcw className="h-4 w-4" />}
          className="text-xs"
        >
          Xóa tất cả bộ lọc
        </Button>
      )}
    </div>
  );
}

export default ReportEmptyState;
