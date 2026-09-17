import { RotateCcw, Search } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
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
  const tabItems: TabItem<string>[] = [
    {
      id: 'all',
      label: 'Tất cả',
      count: stats?.total,
    },
    {
      id: 'Pending',
      label: 'Chờ xử lý',
      count: stats?.pending,
      dotColor: 'bg-warning',
    },
    {
      id: 'InProgress',
      label: 'Đang kiểm tra',
      count: stats?.inProgress,
      dotColor: 'bg-primary',
    },
    {
      id: 'Resolved',
      label: 'Đã giải quyết',
      count: stats?.resolved,
      dotColor: 'bg-success',
    },
    {
      id: 'Rejected',
      label: 'Bác bỏ',
      count: stats?.rejected,
      dotColor: 'bg-danger',
    },
  ];

  const handleTabChange = (val: string) => {
    if (val === 'all') {
      onStatusChange(undefined);
    } else {
      onStatusChange(val as ReportStatus);
    }
  };

  const hasActiveFilters = Boolean(
    activeStatus !== undefined ||
    currentTargetType !== undefined ||
    currentReportTypeId !== undefined ||
    searchQuery.trim().length > 0,
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-3 bg-surface p-3 sm:p-4 rounded-xl border border-border-subtle shadow-xs',
        className,
      )}
    >
      {/* Row 1: Status Tabs */}
      <Tabs
        items={tabItems}
        activeValue={activeStatus ?? 'all'}
        onChange={handleTabChange}
        variant="pills"
        size="md"
        itemRole="button"
        ariaLabel="Lọc báo cáo theo trạng thái"
      />

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
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border-subtle bg-white text-xs sm:text-sm text-text-main placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Target Type Filter */}
        <div className="sm:col-span-3">
          <Select
            value={currentTargetType ?? ''}
            onChange={(e) => onTargetTypeChange(e.target.value ? (e.target.value as ReportTargetType) : undefined)}
            aria-label="Lọc theo đối tượng vi phạm"
            selectSize="md"
          >
            <option value="">Tất cả đối tượng</option>
            <option value="File">Tài liệu</option>
            <option value="Comment">Bình luận</option>
            <option value="User">Người dùng</option>
          </Select>
        </div>

        {/* Violation Category Filter */}
        <div className="sm:col-span-3">
          <Select
            value={currentReportTypeId !== undefined ? String(currentReportTypeId) : ''}
            onChange={(e) => onReportTypeIdChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            aria-label="Lọc theo loại vi phạm"
            selectSize="md"
          >
            <option value="">Tất cả loại vi phạm</option>
            {reportTypes.map((rt) => (
              <option key={rt.reportTypeId} value={rt.reportTypeId}>
                {rt.reportTypeName}
              </option>
            ))}
          </Select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <div className="sm:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={onResetFilters}
              aria-label="Xóa tất cả bộ lọc"
              title="Xóa bộ lọc"
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-gray-100 cursor-pointer transition-colors shrink-0"
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
