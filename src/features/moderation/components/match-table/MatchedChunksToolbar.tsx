import { memo } from 'react';
import { ArrowUpDown, Search, X } from 'lucide-react';
import type { SimilarityRiskLevel } from '../../types/moderation.types';
import { cn } from '@/utils/cn';

export type ChunkSortOption = 'similarity-desc' | 'similarity-asc' | 'chunk-index';

export interface MatchedChunksToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeRiskFilter: 'all' | SimilarityRiskLevel;
  onRiskFilterChange: (level: 'all' | SimilarityRiskLevel) => void;
  sortOption: ChunkSortOption;
  onSortChange: (sort: ChunkSortOption) => void;
  totalCount: number;
  filteredCount: number;
  riskCounts: {
    danger: number;
    warning: number;
    safe: number;
  };
  className?: string;
}

export const MatchedChunksToolbar = memo(function MatchedChunksToolbar({
  searchTerm,
  onSearchChange,
  activeRiskFilter,
  onRiskFilterChange,
  sortOption,
  onSortChange,
  totalCount,
  filteredCount,
  riskCounts,
  className,
}: MatchedChunksToolbarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Top Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Chi tiết các đoạn trùng khớp ({totalCount})
          </h4>
          <p className="text-[11px] text-text-muted mt-0.5">
            Hiển thị <span className="font-semibold text-text-main tabular-nums">{filteredCount}</span> /{' '}
            <span className="tabular-nums">{totalCount}</span> đoạn phát hiện
          </p>
        </div>

        {/* Search input & Sort selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative flex items-center min-w-45 sm:min-w-55">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo trích đoạn / tên file..."
              className="w-full h-8 pl-8 pr-7 text-xs bg-surface border border-border-subtle rounded-lg text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              aria-label="Tìm kiếm trong các đoạn trùng lặp"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 text-text-muted hover:text-text-main p-0.5"
                title="Xóa tìm kiếm"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Sort dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown
              className="absolute left-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as ChunkSortOption)}
              className="h-8 pl-8 pr-7 text-xs bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors appearance-none"
              aria-label="Sắp xếp danh sách đoạn trùng"
            >
              <option value="similarity-desc">Trùng cao nhất</option>
              <option value="similarity-asc">Trùng thấp nhất</option>
              <option value="chunk-index">Thứ tự đoạn (#)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Risk Level */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => onRiskFilterChange('all')}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border',
            activeRiskFilter === 'all'
              ? 'bg-primary text-white border-primary shadow-2xs'
              : 'bg-surface text-text-muted border-border-subtle hover:bg-neutral-50 hover:text-text-main',
          )}
        >
          <span>Tất cả</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] tabular-nums',
              activeRiskFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted',
            )}
          >
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onRiskFilterChange('danger')}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border',
            activeRiskFilter === 'danger'
              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
              : 'bg-surface text-text-muted border-border-subtle hover:bg-rose-50/50 hover:text-danger',
          )}
        >
          <span
            className={cn('h-1.5 w-1.5 rounded-full', activeRiskFilter === 'danger' ? 'bg-white' : 'bg-danger')}
            aria-hidden="true"
          />
          <span>Nguy cơ cao (&ge;70%)</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] tabular-nums',
              activeRiskFilter === 'danger' ? 'bg-white/20 text-white' : 'bg-rose-50 text-danger font-semibold',
            )}
          >
            {riskCounts.danger}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onRiskFilterChange('warning')}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border',
            activeRiskFilter === 'warning'
              ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
              : 'bg-surface text-text-muted border-border-subtle hover:bg-orange-50/50 hover:text-warning',
          )}
        >
          <span
            className={cn('h-1.5 w-1.5 rounded-full', activeRiskFilter === 'warning' ? 'bg-white' : 'bg-warning')}
            aria-hidden="true"
          />
          <span>Cần lưu ý (30-69%)</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] tabular-nums',
              activeRiskFilter === 'warning' ? 'bg-white/20 text-white' : 'bg-orange-50 text-warning font-semibold',
            )}
          >
            {riskCounts.warning}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onRiskFilterChange('safe')}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border',
            activeRiskFilter === 'safe'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
              : 'bg-surface text-text-muted border-border-subtle hover:bg-emerald-50/50 hover:text-success',
          )}
        >
          <span
            className={cn('h-1.5 w-1.5 rounded-full', activeRiskFilter === 'safe' ? 'bg-white' : 'bg-success')}
            aria-hidden="true"
          />
          <span>Tương đồng thấp (&lt;30%)</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] tabular-nums',
              activeRiskFilter === 'safe' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-success font-semibold',
            )}
          >
            {riskCounts.safe}
          </span>
        </button>
      </div>
    </div>
  );
});

export default MatchedChunksToolbar;
