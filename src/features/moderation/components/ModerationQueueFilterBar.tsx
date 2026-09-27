import { useState, type FormEvent } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type {
  DepartmentResponse,
  FileTypeResponse,
  SubMajorResponse,
} from '@/features/resources/types/academicCatalog.types';
import type { ModerationAiRiskFilter, ModerationQueueFilterState } from '../types/moderation.types';
import { cn } from '@/utils/cn';

export interface ModerationQueueFilterBarProps {
  currentFilters: ModerationQueueFilterState;
  departments: DepartmentResponse[];
  subMajors: SubMajorResponse[];
  fileTypes: FileTypeResponse[];
  onSearchChange: (search: string) => void;
  onDepartmentChange: (departmentId?: string) => void;
  onSubMajorChange: (subMajorCode?: string) => void;
  onFileTypeChange: (fileTypeId?: number) => void;
  onAiRiskChange: (aiRisk: ModerationAiRiskFilter) => void;
  onResetFilters: () => void;
  className?: string;
}

export function ModerationQueueFilterBar({
  currentFilters,
  departments,
  subMajors,
  fileTypes,
  onSearchChange,
  onDepartmentChange,
  onSubMajorChange,
  onFileTypeChange,
  onAiRiskChange,
  onResetFilters,
  className,
}: ModerationQueueFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>(currentFilters.search ?? '');

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchChange(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearchChange('');
  };

  const handleReset = () => {
    setSearchTerm('');
    onResetFilters();
  };

  const hasActiveFilters = Boolean(
    (currentFilters.search && currentFilters.search.trim().length > 0) ||
    currentFilters.departmentId ||
    currentFilters.subMajorCode ||
    currentFilters.fileTypeId !== undefined ||
    (currentFilters.aiRisk && currentFilters.aiRisk !== 'all'),
  );

  return (
    <div
      role="search"
      aria-label="Thanh lọc hàng đợi kiểm duyệt"
      className={cn('bg-surface rounded-2xl border border-border-subtle p-4 shadow-xs space-y-3.5', className)}
    >
      {/* Row 1: Search Input & Action Buttons */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 items-center">
        <div className="relative flex-1 w-full">
          <Input
            id="moderation-queue-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên tài liệu, người tải, mã số..."
            aria-label="Tìm kiếm tài liệu"
            iconLeft={<Search className="h-4 w-4" />}
            className={searchTerm.length > 0 ? 'pr-9' : undefined}
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-main p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button type="submit" variant="primary" size="md" className="flex-1 sm:flex-none cursor-pointer">
            Tìm kiếm
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            iconLeft={<RotateCcw className="h-3.5 w-3.5" />}
            className="flex-1 sm:flex-none cursor-pointer"
          >
            Đặt lại
          </Button>
        </div>
      </form>

      {/* Row 2: Cascading & Dimension Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-border-subtle/60">
        <div>
          <Select
            id="filter-department"
            aria-label="Lọc theo khoa"
            value={currentFilters.departmentId ?? ''}
            onChange={(e) => onDepartmentChange(e.target.value || undefined)}
            options={[{ value: '', label: 'Tất cả khoa' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
          />
        </div>

        <div>
          <Select
            id="filter-submajor"
            aria-label="Lọc theo chuyên ngành"
            value={currentFilters.subMajorCode ?? ''}
            onChange={(e) => onSubMajorChange(e.target.value || undefined)}
            options={[
              { value: '', label: 'Tất cả chuyên ngành' },
              ...subMajors.map((sm) => ({ value: sm.subMajorCode, label: sm.subMajorName })),
            ]}
          />
        </div>

        <div>
          <Select
            id="filter-file-type"
            aria-label="Lọc theo loại tài liệu"
            value={currentFilters.fileTypeId !== undefined ? String(currentFilters.fileTypeId) : ''}
            onChange={(e) => {
              const val = e.target.value;
              onFileTypeChange(val ? parseInt(val, 10) : undefined);
            }}
            options={[
              { value: '', label: 'Tất cả loại tài liệu' },
              ...fileTypes.map((ft) => ({ value: String(ft.id), label: ft.name })),
            ]}
          />
        </div>

        <div>
          <Select
            id="filter-ai-risk"
            aria-label="Lọc theo cấp độ AI"
            value={currentFilters.aiRisk ?? 'all'}
            onChange={(e) => onAiRiskChange(e.target.value as ModerationAiRiskFilter)}
            options={[
              { value: 'all', label: 'Tất cả mức độ AI' },
              { value: 'uninspected', label: 'Chưa quét AI' },
              { value: 'safe', label: 'An toàn (≤ 15%)' },
              { value: 'warning', label: 'Cảnh báo (15 - 30%)' },
              { value: 'danger', label: 'Nguy cơ cao (> 30%)' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default ModerationQueueFilterBar;
