import { FileQuestion, RotateCcw, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import type { AppealStatus } from '@/features/appeals/types/appeal.types';

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

  const action =
    (isSearchActive || currentStatus) && onResetFilter ? (
      <Button variant="secondary" size="sm" onClick={onResetFilter} iconLeft={<RotateCcw className="h-3.5 w-3.5" />}>
        Đặt lại bộ lọc
      </Button>
    ) : undefined;

  return <EmptyState title={title} description={description} icon={Icon} action={action} className={className} />;
}

export default AppealEmptyState;
