import { useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { PlagiarismRiskLevel } from '../types/plagiarism-report.types';

export interface PlagiarismRiskFilterBarProps {
  currentSearch: string;
  currentRiskLevel?: PlagiarismRiskLevel;
  onSearchChange: (query: string) => void;
  onRiskLevelChange: (level?: PlagiarismRiskLevel) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
  className?: string;
}

interface RiskFilterOption {
  value: PlagiarismRiskLevel | undefined;
  label: string;
  dotColor: string;
  activeClasses: string;
}

const RISK_FILTER_OPTIONS: RiskFilterOption[] = [
  {
    value: undefined,
    label: 'Tất cả',
    dotColor: 'bg-primary',
    activeClasses: 'bg-primary/10 text-primary border-primary/30',
  },
  {
    value: 'safe',
    label: 'An toàn',
    dotColor: 'bg-success',
    activeClasses: 'bg-badge-success-bg text-badge-success-text border-emerald-200',
  },
  {
    value: 'warning',
    label: 'Cần lưu ý',
    dotColor: 'bg-warning',
    activeClasses: 'bg-orange-50 text-warning border-orange-200',
  },
  {
    value: 'danger',
    label: 'Nguy hiểm',
    dotColor: 'bg-danger',
    activeClasses: 'bg-badge-danger-bg text-badge-danger-text border-rose-200',
  },
  {
    value: 'unchecked',
    label: 'Chưa quét',
    dotColor: 'bg-gray-400',
    activeClasses: 'bg-gray-100 text-text-main border-gray-300',
  },
];

export function PlagiarismRiskFilterBar({
  currentSearch,
  currentRiskLevel,
  onSearchChange,
  onRiskLevelChange,
  onResetFilters,
  totalCount,
  filteredCount,
  className,
}: PlagiarismRiskFilterBarProps) {
  // Local input state — chỉ flush ra loader khi Enter/blur/click Search
  const [localSearch, setLocalSearch] = useState<string>(currentSearch);

  const hasActiveFilters = currentSearch.length > 0 || currentRiskLevel !== undefined;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchChange(localSearch);
    }
  };

  const handleSearchBlur = () => {
    if (localSearch !== currentSearch) {
      onSearchChange(localSearch);
    }
  };

  const handleReset = () => {
    setLocalSearch('');
    onResetFilters();
  };

  return (
    <div className={cn('bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 shadow-xs space-y-4', className)}>
      {/* Search row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Tìm theo tên tài liệu... (Enter để tìm)"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearchBlur}
            className="pl-9 pr-4"
            aria-label="Tìm kiếm tài liệu"
          />
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleReset}
            iconLeft={<RotateCcw className="h-3.5 w-3.5" />}
            className="shrink-0 text-xs"
          >
            Đặt lại
          </Button>
        ) : null}
      </div>

      {/* Risk level filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-muted font-medium shrink-0">Lọc theo mức rủi ro:</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo mức rủi ro">
          {RISK_FILTER_OPTIONS.map((opt) => {
            const isActive = currentRiskLevel === opt.value;
            return (
              <button
                key={opt.value ?? 'all'}
                type="button"
                onClick={() => onRiskLevelChange(opt.value)}
                aria-pressed={isActive}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer select-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? opt.activeClasses
                    : 'bg-background text-text-muted border-border-subtle hover:border-gray-300 hover:text-text-main',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', opt.dotColor)} aria-hidden="true" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between pt-0.5 border-t border-border-subtle/60">
        <p className="text-xs text-text-muted">
          Đang hiển thị <span className="font-semibold text-text-main">{filteredCount.toLocaleString('vi-VN')}</span>{' '}
          trong tổng số <span className="font-semibold text-text-main">{totalCount.toLocaleString('vi-VN')}</span> tài
          liệu
          {currentRiskLevel ? (
            <span className="text-text-muted">
              {' '}
              (đã lọc theo{' '}
              <span className="font-medium text-text-main">
                {RISK_FILTER_OPTIONS.find((o) => o.value === currentRiskLevel)?.label}
              </span>
              )
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

export default PlagiarismRiskFilterBar;
