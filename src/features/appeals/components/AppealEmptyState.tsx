import { FileQuestion, RotateCcw, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AppealStatus } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';

export interface AppealEmptyStateProps {
  currentStatus?: AppealStatus;
  searchQuery?: string;
  onResetFilter?: () => void;
  className?: string;
}

export function AppealEmptyState({ currentStatus, searchQuery, onResetFilter, className }: AppealEmptyStateProps) {
  const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);

  let title = 'Chưa có đơn khiếu nại nào';
  let description = 'Bạn chưa gửi khiếu nại hoặc đơn giải trình kiểm duyệt nào trên hệ thống.';

  if (isSearchActive) {
    title = 'Không tìm thấy kết quả phù hợp';
    description = `Không có khiếu nại nào khớp với từ khóa "${searchQuery}". Vui lòng thử lại với từ khóa khác.`;
  } else if (currentStatus === 'Pending') {
    title = 'Không có khiếu nại chờ xử lý';
    description = 'Hiện tại bạn không có đơn khiếu nại nào đang trong trạng thái chờ giảng viên xem xét.';
  } else if (currentStatus === 'Approved') {
    title = 'Chưa có khiếu nại được chấp thuận';
    description = 'Bạn chưa có đơn khiếu nại nào đã được giảng viên phê duyệt chấp thuận.';
  } else if (currentStatus === 'Rejected') {
    title = 'Không có khiếu nại bị từ chối';
    description = 'Tuyệt vời! Không có đơn khiếu nại nào của bạn bị bác bỏ.';
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

export default AppealEmptyState;
