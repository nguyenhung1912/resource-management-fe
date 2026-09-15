import type { ComponentType } from 'react';
import { FileText, HelpCircle, MessageSquare, User } from 'lucide-react';
import type { ReportTargetType } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface ReportTargetBadgeProps {
  targetType: ReportTargetType | string;
  size?: 'sm' | 'md';
  className?: string;
}

interface TargetConfig {
  label: string;
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
}

const TARGET_MAP: Record<string, TargetConfig> = {
  File: {
    label: 'Tài liệu',
    icon: FileText,
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  },
  Comment: {
    label: 'Bình luận',
    icon: MessageSquare,
    colorClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
  },
  User: {
    label: 'Người dùng',
    icon: User,
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
};

const DEFAULT_TARGET: TargetConfig = {
  label: 'Khác',
  icon: HelpCircle,
  colorClass: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function ReportTargetBadge({ targetType, size = 'sm', className }: ReportTargetBadgeProps) {
  const normalizedKey = Object.keys(TARGET_MAP).find((key) => key.toLowerCase() === targetType?.toLowerCase());
  const config = normalizedKey ? TARGET_MAP[normalizedKey] : DEFAULT_TARGET;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border shrink-0 select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[11px] leading-tight' : 'px-2.5 py-1 text-xs leading-normal',
        config.colorClass,
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default ReportTargetBadge;
