import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SEARCH_TABS_CONFIG } from '../../constants/search.constants';
import type { SearchTab } from '../../types/search.types';
import { cn } from '@/utils/cn';

export interface SearchOmniboxProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  resourceCount: number;
}

export function SearchOmnibox({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  resourceCount,
}: SearchOmniboxProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs space-y-4">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 size-5 text-text-muted select-none pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm tài liệu, giáo trình, tác giả, đề tài hoặc từ khóa..."
          className="h-13 w-full rounded-xl border border-border-subtle bg-background pl-12 pr-28 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          <Button variant="primary" size="sm">
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Sub-tabs Selector (DRY pattern) */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border-subtle pb-px">
        {SEARCH_TABS_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer',
                isActive ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{tab.label}</span>

              {tab.showCount ? (
                <Badge variant="neutral" className="ml-1 text-[11px] px-1.5 py-0">
                  {resourceCount}
                </Badge>
              ) : null}

              {tab.badge ? (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SearchOmnibox;
