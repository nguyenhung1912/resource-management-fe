import { useState } from 'react';
import { GitBranch, LayoutGrid, List, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOptionItem } from '@/components/ui/Select';
import type {
  LookupItem,
  SourceCodeFilterValues,
  SourceCodeViewMode,
} from '@/features/digital-resources/source-code/types/source-code.types';

export interface SourceCodeFilterBarProps {
  filters: SourceCodeFilterValues;
  subMajors: LookupItem[];
  courses: LookupItem[];
  fileStatuses?: LookupItem[];
  onSearchChange: (search: string) => void;
  onSubMajorChange: (subMajorId: string) => void;
  onCourseChange: (courseId: string) => void;
  onOnlyGithubChange: (onlyGithub: boolean) => void;
  onStatusChange: (statusId: string) => void;
  onViewModeChange: (viewMode: SourceCodeViewMode) => void;
  onResetFilters: () => void;
}

export function SourceCodeFilterBar({
  filters,
  subMajors,
  courses,
  fileStatuses,
  onSearchChange,
  onSubMajorChange,
  onCourseChange,
  onOnlyGithubChange,
  onStatusChange,
  onViewModeChange,
  onResetFilters,
}: SourceCodeFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [prevSearch, setPrevSearch] = useState(filters.search);

  const statusOptions: readonly SelectOptionItem[] = [
    { value: '', label: 'Tất cả trạng thái' },
    ...(fileStatuses ?? []).map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

  if (prevSearch !== filters.search) {
    setPrevSearch(filters.search);
    setLocalSearch(filters.search);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const subMajorOptions: SelectOptionItem[] = [
    { value: '', label: 'Tất cả chuyên ngành' },
    ...subMajors.map((sm) => ({ value: sm.id, label: sm.name })),
  ];

  const courseOptions: SelectOptionItem[] = [
    { value: '', label: 'Tất cả học phần' },
    ...courses.map((c) => ({ value: c.id, label: c.name })),
  ];

  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.subMajorId) ||
    Boolean(filters.courseId) ||
    Boolean(filters.statusId) ||
    filters.onlyGithub;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên mã nguồn, đề tài, từ khóa..."
              iconLeft={<Search className="size-4 text-text-muted" aria-hidden="true" />}
              aria-label="Tìm kiếm mã nguồn"
              className="w-full h-10"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="shrink-0">
            Tìm kiếm
          </Button>
        </form>

        {/* View mode switcher */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          <div
            className="inline-flex rounded-lg border border-border-subtle p-1 bg-gray-50/50"
            role="group"
            aria-label="Chế độ hiển thị"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filters.viewMode === 'grid'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-main'
              }`}
              aria-pressed={filters.viewMode === 'grid'}
              aria-label="Chế độ xem dạng lưới"
            >
              <LayoutGrid className="size-3.5" aria-hidden="true" />
              Lưới
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filters.viewMode === 'table'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-main'
              }`}
              aria-pressed={filters.viewMode === 'table'}
              aria-label="Chế độ xem dạng bảng"
            >
              <List className="size-3.5" aria-hidden="true" />
              Bảng
            </button>
          </div>

          {isFiltered && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onResetFilters}
              aria-label="Đặt lại toàn bộ bộ lọc"
              className="text-text-muted hover:text-danger hover:border-danger/40 transition-colors"
            >
              <RotateCcw className="size-3.5 mr-1.5" aria-hidden="true" />
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border-subtle">
        <div>
          <Select
            options={subMajorOptions}
            value={filters.subMajorId}
            onChange={(e) => onSubMajorChange(e.target.value)}
            aria-label="Lọc theo chuyên ngành"
            selectSize="md"
          />
        </div>

        <div>
          <Select
            options={courseOptions}
            value={filters.courseId}
            onChange={(e) => onCourseChange(e.target.value)}
            aria-label="Lọc theo học phần"
            selectSize="md"
          />
        </div>

        <div>
          <Select
            options={statusOptions}
            value={filters.statusId}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Lọc theo trạng thái kiểm duyệt"
            selectSize="md"
          />
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onOnlyGithubChange(!filters.onlyGithub)}
            aria-pressed={filters.onlyGithub}
            className={`w-full h-10 px-3.5 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
              filters.onlyGithub
                ? 'bg-primary/10 border-primary text-primary font-semibold ring-1 ring-primary/20'
                : 'bg-surface border-border-subtle text-text-muted hover:text-text-main hover:bg-gray-50'
            }`}
          >
            <GitBranch
              className={`size-4 ${filters.onlyGithub ? 'text-primary' : 'text-text-muted'}`}
              aria-hidden="true"
            />
            Chỉ hiện dự án có GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default SourceCodeFilterBar;
