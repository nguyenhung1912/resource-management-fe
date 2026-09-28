import { useId, useState } from 'react';
import { ArrowUpDown, BookMarked, GraduationCap, LayoutGrid, List, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/utils/cn';
import type { LibraryFilterValues, LibraryViewMode, LookupItem } from '../types/all-resources.types';

export interface LibraryFilterBarProps {
  filters: LibraryFilterValues;
  fileTypes: LookupItem[];
  subMajors: LookupItem[];
  courses: LookupItem[];
  hasActiveFilters: boolean;
  onSearchChange: (search: string) => void;
  onSubMajorChange: (subMajorId?: string) => void;
  onCourseChange: (courseId?: string) => void;
  onFileTypeChange?: (fileTypeId?: number) => void;
  onViewModeChange: (mode: LibraryViewMode) => void;
  onSortChange: (sortBy?: string, sortDirection?: 'asc' | 'desc') => void;
  onResetFilters: () => void;
}

export function LibraryFilterBar({
  filters,
  fileTypes,
  subMajors,
  courses,
  hasActiveFilters,
  onSearchChange,
  onSubMajorChange,
  onCourseChange,
  onFileTypeChange,
  onViewModeChange,
  onSortChange,
  onResetFilters,
}: LibraryFilterBarProps) {
  const [prevSearch, setPrevSearch] = useState(filters.search);
  const [searchInput, setSearchInput] = useState(filters.search);
  const searchInputId = useId();
  const subMajorSelectId = useId();
  const courseSelectId = useId();
  const sortSelectId = useId();

  // Đồng bộ lại local searchInput khi URL params thay đổi (ví dụ nhấn Reset) mà không dùng useEffect
  if (prevSearch !== filters.search) {
    setPrevSearch(filters.search);
    setSearchInput(filters.search);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearchChange('');
  };

  const handleSortSelect = (value: string) => {
    switch (value) {
      case 'name_asc':
        onSortChange('name', 'asc');
        break;
      case 'name_desc':
        onSortChange('name', 'desc');
        break;
      case 'oldest':
        onSortChange('createdAt', 'asc');
        break;
      default:
        onSortChange(undefined, undefined);
        break;
    }
  };

  const currentSortValue = (() => {
    if (filters.sortBy === 'name') {
      return filters.sortDirection === 'desc' ? 'name_desc' : 'name_asc';
    }
    if (filters.sortBy === 'createdAt' && filters.sortDirection === 'asc') {
      return 'oldest';
    }
    return '';
  })();

  const activeSubMajor = subMajors.find((sm) => sm.id === filters.subMajorId);
  const activeCourse = courses.find((c) => c.id === filters.courseId);
  const activeFileType = fileTypes.find((ft) => Number(ft.id) === filters.fileTypeId);

  return (
    <section aria-label="Bộ lọc và tìm kiếm thư viện" className="space-y-3">
      <div className="rounded-xl border border-border-subtle bg-surface p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Form Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 max-w-2xl flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                id={searchInputId}
                type="text"
                placeholder="Tìm kiếm tựa sách, tài liệu, giáo trình, đề tài..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onBlur={() => {
                  if (searchInput !== filters.search) {
                    onSearchChange(searchInput);
                  }
                }}
                iconLeft={<Search className="size-4 text-text-muted" aria-hidden="true" />}
                iconRight={
                  searchInput ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="p-1 text-text-muted hover:text-text-main rounded-md transition-colors cursor-pointer"
                      aria-label="Xóa từ khóa tìm kiếm"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  ) : undefined
                }
                className="pr-8"
              />
            </div>
          </form>

          {/* Controls: Dropdowns & View Mode */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Chuyên ngành Filter */}
            <div className="w-full sm:w-44">
              <Select
                id={subMajorSelectId}
                aria-label="Lọc theo chuyên ngành"
                value={filters.subMajorId ?? ''}
                onChange={(e) => onSubMajorChange(e.target.value || undefined)}
                iconLeft={<GraduationCap className="size-3.5 text-text-muted" aria-hidden="true" />}
                selectSize="md"
              >
                <option value="">Tất cả chuyên ngành</option>
                {subMajors.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Học phần Filter */}
            <div className="w-full sm:w-44">
              <Select
                id={courseSelectId}
                aria-label="Lọc theo học phần"
                value={filters.courseId ?? ''}
                onChange={(e) => onCourseChange(e.target.value || undefined)}
                disabled={!filters.subMajorId || courses.length === 0}
                iconLeft={<BookMarked className="size-3.5 text-text-muted" aria-hidden="true" />}
                selectSize="md"
              >
                <option value="">{!filters.subMajorId ? 'Chọn chuyên ngành trước' : 'Tất cả học phần'}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Sắp xếp */}
            <div className="w-36 sm:w-36">
              <Select
                id={sortSelectId}
                aria-label="Sắp xếp danh sách"
                value={currentSortValue}
                onChange={(e) => handleSortSelect(e.target.value)}
                iconLeft={<ArrowUpDown className="size-3.5 text-text-muted" aria-hidden="true" />}
                selectSize="md"
              >
                <option value="">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name_asc">Tên (A - Z)</option>
                <option value="name_desc">Tên (Z - A)</option>
              </Select>
            </div>

            {/* View Mode Segmented Switch (Grid / Table) */}
            <div
              role="group"
              aria-label="Chế độ hiển thị"
              className="flex items-center p-1 rounded-lg border border-border-subtle bg-gray-50/80 gap-0.5"
            >
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium',
                  filters.viewMode === 'grid'
                    ? 'bg-surface text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-main',
                )}
                aria-pressed={filters.viewMode === 'grid'}
                aria-label="Xem dạng kệ sách (Lưới thẻ)"
                title="Xem dạng kệ sách (Lưới thẻ)"
              >
                <LayoutGrid className="size-4" aria-hidden="true" />
                <span className="hidden xl:inline">Kệ sách</span>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={cn(
                  'p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium',
                  filters.viewMode === 'table'
                    ? 'bg-surface text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-main',
                )}
                aria-pressed={filters.viewMode === 'table'}
                aria-label="Xem dạng danh mục (Bảng)"
                title="Xem dạng danh mục (Bảng)"
              >
                <List className="size-4" aria-hidden="true" />
                <span className="hidden xl:inline">Mục lục</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Clear Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
          <span className="text-text-muted font-medium">Bộ lọc đang chọn:</span>

          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 font-medium">
              Tìm: &quot;{filters.search}&quot;
              <button
                type="button"
                onClick={handleClearSearch}
                className="hover:text-danger cursor-pointer ml-0.5"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {activeFileType && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 font-medium">
              Loại: {activeFileType.name}
              {onFileTypeChange && (
                <button
                  type="button"
                  onClick={() => onFileTypeChange(undefined)}
                  className="hover:text-danger cursor-pointer ml-0.5"
                  aria-label="Xóa lọc loại tài liệu"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}
            </span>
          )}

          {activeSubMajor && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 font-medium">
              Ngành: {activeSubMajor.name}
              <button
                type="button"
                onClick={() => onSubMajorChange(undefined)}
                className="hover:text-danger cursor-pointer ml-0.5"
                aria-label="Xóa lọc chuyên ngành"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {activeCourse && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 font-medium">
              Học phần: {activeCourse.name}
              <button
                type="button"
                onClick={() => onCourseChange(undefined)}
                className="hover:text-danger cursor-pointer ml-0.5"
                aria-label="Xóa lọc học phần"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.sortBy && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-text-main border border-border-subtle font-medium">
              Sắp xếp: {filters.sortBy === 'name' ? 'Tên tài liệu' : 'Ngày tạo'}
              <button
                type="button"
                onClick={() => onSortChange(undefined, undefined)}
                className="hover:text-danger cursor-pointer ml-0.5"
                aria-label="Xóa sắp xếp"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-7 px-2 text-xs text-text-muted hover:text-danger gap-1 ml-auto"
            aria-label="Đặt lại tất cả bộ lọc"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            <span>Xóa tất cả</span>
          </Button>
        </div>
      )}
    </section>
  );
}

export default LibraryFilterBar;
