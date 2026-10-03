import { Layers } from 'lucide-react';
import type { LookupItem } from '@/features/digital-resources/source-code/types/source-code.types';
import { cn } from '@/utils/cn';

export interface HomeCategoryFilterProps {
  categories: LookupItem[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export function HomeCategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className,
}: HomeCategoryFilterProps) {
  const allCategories: LookupItem[] = [{ id: 'all', name: 'Tất cả học liệu' }, ...categories];

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        <Layers className="size-3.5 text-primary" aria-hidden="true" />
        <span>Danh mục học liệu</span>
      </div>

      <div
        role="tablist"
        aria-label="Lọc theo loại học liệu"
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none"
      >
        {allCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              role="tab"
              type="button"
              aria-selected={isSelected}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer',
                isSelected
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'border border-border-subtle bg-surface text-text-muted hover:border-border hover:bg-neutral-100 hover:text-text-main',
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HomeCategoryFilter;
