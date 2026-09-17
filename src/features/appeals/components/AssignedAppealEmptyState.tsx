import { FileQuestion, RotateCcw, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import type { AppealStatus } from '@/features/appeals/types/appeal.types';

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
    title = 'Không có đơn chờ giải quyết';
    description = 'Tất cả các đơn khiếu nại được chỉ định cho bạn đã được xử lý xong. Không còn đơn nào tồn đọng.';
  } else if (currentStatus === 'Approved') {
    title = 'Chưa có đơn duyệt lại';
    description = 'Chưa có đơn khiếu nại nào được bạn chấp thuận giải trình và phê duyệt lại.';
  } else if (currentStatus === 'Rejected') {
    title = 'Chưa có đơn giữ nguyên từ chối';
    description = 'Chưa có đơn khiếu nại nào bị bạn bác bỏ giải trình và giữ nguyên từ chối.';
  }

  const Icon = isSearchActive ? SearchX : FileQuestion;

  const action =
    (isSearchActive || currentStatus) && onResetFilter ? (
      <Button variant="secondary" size="sm" onClick={onResetFilter} iconLeft={<RotateCcw className="h-3.5 w-3.5" />}>
        Đặt lại bộ lọc
      </Button>
    ) : undefined;

  return <EmptyState title={title} description={description} icon={Icon} action={action} className={className} />;
}

export default AssignedAppealEmptyState;
