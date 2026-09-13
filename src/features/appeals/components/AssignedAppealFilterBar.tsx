import { Search, X } from 'lucide-react';
import type { AppealOverviewStats, AppealStatus } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';

export interface AssignedAppealFilterBarProps {
  activeStatus?: AppealStatus;
  onStatusChange: (status?: AppealStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats?: AppealOverviewStats;
  className?: string;
}

export function AssignedAppealFilterBar({
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  stats,
  className,
}: AssignedAppealFilterBarProps) {
  const tabs: Array<{
    id: string;
    status: AppealStatus | undefined;
    label: string;
    count?: number;
  }> = [
    {
      id: 'all',
      status: undefined,
      label: 'Tất cả',
      count: stats?.total,
    },
    {
      id: 'Pending',
      status: 'Pending',
      label: 'Cần phân xử',
      count: stats?.pending,
    },
    {
      id: 'Approved',
      status: 'Approved',
      label: 'Đã duyệt lại',
      count: stats?.approved,
    },
    {
      id: 'Rejected',
      status: 'Rejected',
      label: 'Đã giữ nguyên',
      count: stats?.rejected,
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 sm:p-4 rounded-xl border border-border-subtle shadow-xs',
        className,
      )}
    >
      {/* Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.status;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.status)}
              aria-label={typeof tab.count === 'number' ? `${tab.label} (${tab.count})` : tab.label}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isActive
                  ? 'bg-primary text-white shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-main hover:bg-gray-100',
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-72 md:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          <Search className="h-4 w-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên sinh viên, email, tài liệu..."
          className="w-full pl-9 pr-8 py-1.5 text-xs bg-background rounded-lg border border-border-subtle placeholder:text-text-muted/70 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-text-muted hover:text-text-main cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AssignedAppealFilterBar;
