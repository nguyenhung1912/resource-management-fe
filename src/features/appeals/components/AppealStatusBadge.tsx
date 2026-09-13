import { Badge } from '@/components/ui/Badge';
import type { AppealStatus } from '@/features/appeals/types/appeal.types';

export interface AppealStatusBadgeProps {
  status: AppealStatus;
  className?: string;
}

const statusConfig: Record<
  AppealStatus,
  {
    label: string;
    variant: 'warning' | 'success' | 'danger';
  }
> = {
  Pending: {
    label: 'Chờ duyệt',
    variant: 'warning',
  },
  Approved: {
    label: 'Đã chấp thuận',
    variant: 'success',
  },
  Rejected: {
    label: 'Bị từ chối',
    variant: 'danger',
  },
};

export function AppealStatusBadge({ status, className }: AppealStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: 'warning',
  };

  return (
    <Badge variant={config.variant} showDot className={className}>
      {config.label}
    </Badge>
  );
}

export default AppealStatusBadge;
