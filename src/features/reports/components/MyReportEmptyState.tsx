import { RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ReportStatus, ReportTargetType } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface MyReportEmptyStateProps {
  currentStatus?: ReportStatus;
  currentTargetType?: ReportTargetType;
  currentReportTypeId?: number;
  searchQuery?: string;
  onResetFilters?: () => void;
  className?: string;
}

export function MyReportEmptyState({
  currentStatus,
  currentTargetType,
  currentReportTypeId,
  searchQuery,
  onResetFilters,
  className,
}: MyReportEmptyStateProps) {
  const isFiltering = Boolean(
    currentStatus || currentTargetType || currentReportTypeId !== undefined || (searchQuery && searchQuery.length > 0),
  );

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
        {isFiltering ? 'Không tìm thấy báo cáo phù hợp' : 'Bạn chưa gửi báo cáo vi phạm nào'}
      </h2>

      <p className="text-xs sm:text-sm text-text-muted max-w-md mb-6 leading-relaxed">
        {isFiltering
          ? 'Không có báo cáo vi phạm nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn. Hãy thử chọn trạng thái khác hoặc xóa từ khóa.'
          : 'Khi bạn phát hiện tài liệu vi phạm bản quyền, bình luận xúc phạm hoặc tài khoản có hành vi không chuẩn mực, hãy gửi báo cáo để Ban kiểm duyệt tiếp nhận và xử lý.'}
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

export default MyReportEmptyState;
