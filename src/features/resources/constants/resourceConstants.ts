import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ResourceStat } from '@/features/resources/components/ResourceStats';

export const ALL_STATUSES = 0;

export const FILE_STATUS = {
  PENDING: 1,
  UPLOADED: 2,
  REMOVED: 3,
  REJECT: 4,
} as const;

export const STATUS_VARIANTS: Record<number, 'success' | 'warning' | 'danger' | 'neutral'> = {
  [FILE_STATUS.PENDING]: 'warning',
  [FILE_STATUS.UPLOADED]: 'success',
  [FILE_STATUS.REMOVED]: 'neutral',
  [FILE_STATUS.REJECT]: 'danger',
};

export function formatResourceStatusName(statusId?: number, statusName?: string | null): string {
  if (statusId === FILE_STATUS.PENDING || statusName?.toUpperCase() === 'PENDING') return 'Chờ duyệt';
  if (statusId === FILE_STATUS.UPLOADED || statusName?.toUpperCase() === 'UPLOADED') return 'Đã duyệt';
  if (statusId === FILE_STATUS.REMOVED || statusName?.toUpperCase() === 'REMOVED') return 'Đã gỡ';
  if (statusId === FILE_STATUS.REJECT || statusName?.toUpperCase() === 'REJECT') return 'Bị từ chối';
  return statusName || 'Chưa xác định';
}

export const DEFAULT_RESOURCE_STATS: ResourceStat[] = [
  {
    label: 'Đã duyệt',
    value: 0,
    icon: CheckCircle2,
    colorVariant: 'success',
    iconClassName: 'text-success',
    badgeBg: 'bg-emerald-50 text-success',
  },
  {
    label: 'Chờ duyệt',
    value: 0,
    icon: Clock,
    colorVariant: 'warning',
    iconClassName: 'text-warning',
    badgeBg: 'bg-orange-50 text-warning',
  },
  {
    label: 'Bị từ chối',
    value: 0,
    icon: XCircle,
    colorVariant: 'danger',
    iconClassName: 'text-danger',
    badgeBg: 'bg-rose-50 text-danger',
  },
];
