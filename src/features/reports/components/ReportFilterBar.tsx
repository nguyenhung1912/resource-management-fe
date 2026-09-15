import { RotateCcw, Search } from 'lucide-react';
import type {
  ReportOverviewStats,
  ReportStatus,
  ReportTargetType,
  ReportTypeResponse,
} from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface ReportFilterBarProps {
  activeStatus?: ReportStatus;
  onStatusChange: (status?: ReportStatus) => void;
  currentTargetType?: ReportTargetType;
  onTargetTypeChange: (targetType?: ReportTargetType) => void;
  currentReportTypeId?: number;
  onReportTypeIdChange: (reportTypeId?: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  reportTypes: ReportTypeResponse[];
  stats?: ReportOverviewStats;
  onResetFilters: () => void;
  className?: string;
}

export function ReportFilterBar({
  activeStatus,
  onStatusChange,
  currentTargetType,
  onTargetTypeChange,
  currentReportTypeId,
  onReportTypeIdChange,
  searchQuery,
  onSearchChange,
  reportTypes,
  stats,
  onResetFilters,
  className,
}: ReportFilterBarProps) {
  const tabs: Array<{
    id: string;
    status: ReportStatus | undefined;
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
      label: 'Chờ xử lý',
      count: stats?.pending,
    },
    {
      id: 'InProgress',
      status: 'InProgress',
      label: 'Đang kiểm tra',
      count: stats?.inProgress,
    },
    {
      id: 'Resolved',
      status: 'Resolved',
      label: 'Đã giải quyết',
      count: stats?.resolved,
    },
    {
      id: 'Rejected',
      status: 'Rejected',
      label: 'Bác bỏ',
      count: stats?.rejected,
    },
  ];

  const hasActiveFilters = Boolean(
    activeStatus !== undefined ||
    currentTargetType !== undefined ||
    currentReportTypeId !== undefined ||
    searchQuery.trim().length > 0,
  );

  return (
    <div
      className={cn('flex flex-col gap-3 bg-surface p-3 sm:p-4 rounded-xl border border-border shadow-xs', className)}
    >
      {/* Row 1: Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.status;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.status)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isActive
                  ? 'bg-primary text-white shadow-xs font-semibold'
                  : 'text-text-muted hover:bg-gray-100 hover:text-text-main',
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-none',
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-text-muted',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Row 2: Search Input + Entity Dropdown + Violation Type Dropdown + Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1 border-t border-border-subtle">
        {/* Search Input */}
        <div className="sm:col-span-5 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã báo cáo, người gửi, lý do..."
            aria-label="Tìm kiếm báo cáo"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Target Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={currentTargetType ?? ''}
            onChange={(e) => onTargetTypeChange(e.target.value ? (e.target.value as ReportTargetType) : undefined)}
            aria-label="Lọc theo đối tượng vi phạm"
            className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors"
          >
            <option value="">Tất cả đối tượng</option>
            <option value="File">Tài liệu</option>
            <option value="Comment">Bình luận</option>
            <option value="User">Người dùng</option>
          </select>
        </div>

        {/* Violation Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={currentReportTypeId !== undefined ? String(currentReportTypeId) : ''}
            onChange={(e) => onReportTypeIdChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            aria-label="Lọc theo loại vi phạm"
            className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors"
          >
            <option value="">Tất cả loại vi phạm</option>
            {reportTypes.map((rt) => (
              <option key={rt.reportTypeId} value={rt.reportTypeId}>
                {rt.reportTypeName}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <div className="sm:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={onResetFilters}
              aria-label="Xóa tất cả bộ lọc"
              title="Xóa bộ lọc"
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-border text-text-muted hover:text-text-main hover:bg-gray-100 cursor-pointer transition-colors shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportFilterBar;
