import { Search, X } from 'lucide-react';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import type { AppealOverviewStats, AppealStatus } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';

export interface AppealFilterTabsProps {
  activeStatus?: AppealStatus;
  onStatusChange: (status?: AppealStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats?: AppealOverviewStats;
  className?: string;
}

export function AppealFilterTabs({
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  stats,
  className,
}: AppealFilterTabsProps) {
  const tabItems: TabItem<string>[] = [
    {
      id: 'all',
      label: 'Tất cả',
      count: stats?.total,
    },
    {
      id: 'Pending',
      label: 'Chờ duyệt',
      count: stats?.pending,
      dotColor: 'bg-warning',
    },
    {
      id: 'Approved',
      label: 'Đã chấp thuận',
      count: stats?.approved,
      dotColor: 'bg-success',
    },
    {
      id: 'Rejected',
      label: 'Bị từ chối',
      count: stats?.rejected,
      dotColor: 'bg-danger',
    },
  ];

  const handleTabChange = (val: string) => {
    if (val === 'all') {
      onStatusChange(undefined);
    } else {
      onStatusChange(val as AppealStatus);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 sm:p-4 rounded-xl border border-border-subtle shadow-xs',
        className,
      )}
    >
      {/* Tabs */}
      <Tabs
        items={tabItems}
        activeValue={activeStatus ?? 'all'}
        onChange={handleTabChange}
        variant="pills"
        size="md"
        itemRole="button"
        ariaLabel="Lọc khiếu nại theo trạng thái"
      />

      {/* Search Input */}
      <div className="relative w-full sm:w-64 md:w-72">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          <Search className="h-4 w-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo mã, tên tài liệu..."
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-background rounded-lg border border-border-subtle placeholder:text-text-muted/70 text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-text-muted hover:text-text-main cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AppealFilterTabs;
