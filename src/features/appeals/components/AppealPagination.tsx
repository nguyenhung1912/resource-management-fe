import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface AppealPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function AppealPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  className,
}: AppealPaginationProps) {
  if (totalPages <= 1 && totalCount <= pageSize) {
    return null;
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages: Array<number | 'ellipsis'> = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i += 1) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const isPrevDisabled = hasPreviousPage !== undefined ? !hasPreviousPage : currentPage <= 1;
  const isNextDisabled = hasNextPage !== undefined ? !hasNextPage : currentPage >= totalPages;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-surface rounded-xl border border-border-subtle shadow-xs select-none',
        className,
      )}
    >
      {/* Quantity Summary */}
      <div className="text-xs text-text-muted">
        Hiển thị <span className="font-semibold text-text-main">{startItem}</span> -{' '}
        <span className="font-semibold text-text-main">{endItem}</span> trên{' '}
        <span className="font-semibold text-text-main">{totalCount}</span> khiếu nại
      </div>

      {/* Control */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={isPrevDisabled}
          onClick={() => onPageChange(currentPage - 1)}
          iconLeft={<ChevronLeft className="h-4 w-4" />}
          className="h-8 px-2.5 text-xs rounded-lg"
          aria-label="Trang trước"
        >
          <span className="hidden sm:inline">Trước</span>
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="h-8 w-6 flex items-center justify-center text-xs text-text-muted select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Trang ${page}`}
                className={cn(
                  'h-8 min-w-8 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none',
                  isCurrent
                    ? 'bg-primary text-white shadow-xs font-semibold'
                    : 'text-text-muted hover:bg-gray-100 hover:text-text-main',
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={isNextDisabled}
          onClick={() => onPageChange(currentPage + 1)}
          iconRight={<ChevronRight className="h-4 w-4" />}
          className="h-8 px-2.5 text-xs rounded-lg"
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
        </Button>
      </div>
    </div>
  );
}

export default AppealPagination;
