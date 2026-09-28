import { memo } from 'react';
import { SearchX, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface MatchedChunksEmptyStateProps {
  type: 'no-matches' | 'filter-empty';
  searchTerm?: string;
  onResetFilters?: () => void;
  className?: string;
}

export const MatchedChunksEmptyState = memo(function MatchedChunksEmptyState({
  type,
  searchTerm,
  onResetFilters,
  className,
}: MatchedChunksEmptyStateProps) {
  if (type === 'no-matches') {
    return (
      <div
        className={cn(
          'flex items-start sm:items-center gap-3.5 p-4 sm:p-5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 text-xs shadow-2xs',
          className,
        )}
      >
        <div className="p-2.5 rounded-lg bg-emerald-100/90 text-emerald-700 shrink-0 mt-0.5 sm:mt-0">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900 text-sm">Không phát hiện đoạn văn bản trùng lặp đáng kể</p>
          <p className="text-emerald-800/90 leading-relaxed text-xs">
            Hệ thống AI không tìm thấy đoạn trích nào vượt ngưỡng cảnh báo trong kho lưu trữ dữ liệu nghiên cứu khoa
            học.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-8 rounded-xl bg-background border border-dashed border-border-subtle text-center space-y-3',
        className,
      )}
    >
      <div className="h-10 w-10 rounded-full bg-gray-100 text-text-muted flex items-center justify-center mx-auto">
        <SearchX className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <p className="text-xs font-semibold text-text-main">Không tìm thấy đoạn trùng khớp phù hợp</p>
        <p className="text-[11px] text-text-muted leading-relaxed">
          {searchTerm ? (
            <>
              Không có đoạn trích hoặc tài liệu nào khớp với từ khóa{' '}
              <span className="font-semibold text-text-main">"{searchTerm}"</span>.
            </>
          ) : (
            'Không có đoạn trích nào thỏa mãn điều kiện lọc mức độ tương đồng hiện tại.'
          )}
        </p>
      </div>

      {onResetFilters && (
        <Button type="button" variant="outline" size="sm" onClick={onResetFilters} className="text-xs mt-1">
          Đặt lại bộ lọc
        </Button>
      )}
    </div>
  );
});

export default MatchedChunksEmptyState;
