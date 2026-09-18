import { Calendar, Download, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { CATEGORY_ICONS, SEARCH_CATEGORIES } from '../../constants/search.constants';
import type { MockResourceItem } from '../../types/search.types';
import { cn } from '@/utils/cn';

export interface SearchResourceListTabProps {
  resources: MockResourceItem[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function SearchResourceListTab({ resources, selectedCategory, onCategoryChange }: SearchResourceListTabProps) {
  return (
    <div className="space-y-4">
      {/* Category filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          Hiển thị <span className="font-semibold text-text-main">{resources.length}</span> kết quả phù hợp
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Lọc danh mục:</span>
          <div className="flex gap-1">
            {SEARCH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-muted hover:text-text-main hover:bg-neutral-100',
                )}
              >
                {cat === 'all' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((res) => {
          const CategoryIcon = CATEGORY_ICONS[res.category] ?? FileText;

          return (
            <div
              key={res.id}
              className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-surface p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <CategoryIcon className="size-3" aria-hidden="true" />
                    <span>{res.category}</span>
                  </span>
                  <span className="rounded-md border border-border-subtle px-1.5 py-0.5 text-[11px] font-medium text-text-muted">
                    {res.format}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors leading-snug">
                  {res.title}
                </h3>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" aria-hidden="true" />
                    {res.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" aria-hidden="true" />
                    {res.year}
                  </span>
                  <span>{res.faculty}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center justify-between">
                <span className="text-xs text-text-muted">{res.downloads} lượt tải</span>
                <Link
                  to={APP_PATHS.RESOURCES_MANAGER}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  Xem chi tiết
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchResourceListTab;
