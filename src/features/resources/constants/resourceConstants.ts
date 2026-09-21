import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ResourceStat } from '@/features/resources/components/ResourceStats';

export const ALL_STATUSES = 0;

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
