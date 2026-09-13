import { CircleCheck, CircleX, ClipboardClock } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

interface ResourceStat {
  label: string;
  value: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName: string;
}

const SAMPLE_RESOURCE_STATS: ResourceStat[] = [
  { label: 'Đã duyệt', value: 856, icon: CircleCheck, iconClassName: 'text-success' },
  { label: 'Chờ duyệt', value: 142, icon: ClipboardClock, iconClassName: 'text-warning' },
  { label: 'Bị từ chối', value: 24, icon: CircleX, iconClassName: 'text-danger' },
];

export interface ResourceStatsProps {
  stats?: ResourceStat[];
}

export function ResourceStats({ stats = SAMPLE_RESOURCE_STATS }: ResourceStatsProps) {
  return (
    <section
      className="w-full max-w-2xl rounded-xl border border-border-subtle bg-surface px-3 py-4 shadow-xs sm:px-0"
      aria-label="Thống kê tài nguyên"
    >
      <dl className="grid grid-cols-3">
        {stats.map(({ label, value, icon: Icon, iconClassName }, index) => (
          <div key={label} className={index === 0 ? 'px-1 sm:px-5' : 'border-l border-border-subtle px-2 sm:px-5'}>
            <dt className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-text-muted sm:text-xs">
              <Icon className={`size-4 shrink-0 ${iconClassName}`} strokeWidth={1.8} aria-hidden="true" />
              <span className="truncate">{label}</span>
            </dt>
            <dd className="mt-1 text-xl font-semibold leading-none text-dashboard-shell sm:text-2xl">
              {value.toLocaleString('vi-VN')}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default ResourceStats;
