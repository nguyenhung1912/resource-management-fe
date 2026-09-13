import { FileQuestion, RotateCcw, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AppealStatus } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';

export interface AssignedAppealEmptyStateProps {
  currentStatus?: AppealStatus;
  searchQuery?: string;
  onResetFilter?: () => void;
  className?: string;
}

export function AssignedAppealEmptyState({
  currentStatus,
  searchQuery,
  onResetFilter,
  className,
}: AssignedAppealEmptyStateProps) {
  const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);

  let title = 'Không có đơn khiếu nại nào';
  let description = 'Hiện tại chưa có đơn khiếu nại nào được chỉ định cho bạn xem xét xử lý.';

  if (isSearchActive) {
    title = 'Không tìm thấy kết quả phù hợp';
    description = `Không có khiếu nại nào khớp với từ khóa "${searchQuery}". Vui lòng thử lại với từ khóa khác.`;
  } else if (currentStatus === 'Pending') {
    title = 'Không có đơn chờ phân xử';
    description = 'Tất cả các đơn khiếu nại được chỉ định cho bạn đã được xử lý xong. Không còn đơn nào tồn đọng.';
  } else if (currentStatus === 'Approved') {
    title = 'Chưa có đơn duyệt lại';
    description = 'Chưa có đơn khiếu nại nào được bạn chấp thuận giải trình và phê duyệt lại.';
  } else if (currentStatus === 'Rejected') {
    title = 'Chưa có đơn giữ nguyên từ chối';
    description = 'Chưa có đơn khiếu nại nào bị bạn bác bỏ giải trình và giữ nguyên từ chối.';
  }

  const Icon = isSearchActive ? SearchX : FileQuestion;

  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border-subtle p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-xs',
        className,
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-text-main">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-text-muted max-w-md leading-relaxed">{description}</p>

      {(isSearchActive || currentStatus) && onResetFilter && (
        <div className="mt-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetFilter}
            iconLeft={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}

export default AssignedAppealEmptyState;
