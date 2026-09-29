import { useState, type FormEvent } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface HomeHeroSearchProps {
  onSearch: (keyword: string) => void;
  className?: string;
}

const POPULAR_SEARCH_TAGS = [
  'Trí tuệ nhân tạo',
  'Deep Learning',
  'Khóa luận tốt nghiệp',
  'Hệ thống thông tin',
  'Giáo trình & Bài giảng',
  'Mã nguồn',
] as const;

export function HomeHeroSearch({ onSearch, className }: HomeHeroSearchProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  const handleTagClick = (tag: string) => {
    setKeyword(tag);
    onSearch(tag);
  };

  return (
    <section
      aria-label="Lời chào mừng và tìm kiếm học liệu"
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 sm:p-10 shadow-xs',
        className,
      )}
    >
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="primary" className="select-none">
            <Sparkles className="size-3.5 mr-1" aria-hidden="true" />
            Học liệu số & Tài nguyên học thuật
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-main leading-tight">
          Cổng Quản lý Tài nguyên Học liệu Số
        </h1>

        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Hệ thống lưu trữ, kiểm duyệt tài liệu học tập, phát hiện đạo văn bằng AI và xử lý khiếu nại bản quyền dành cho
          cán bộ, giảng viên và sinh viên Trường Đại học Quy Nhơn.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSubmit} role="search" className="pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-border bg-background p-1.5 shadow-2xs focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="relative flex-1 flex items-center">
              <Search
                className="absolute left-3.5 size-4 text-text-muted shrink-0 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm tài liệu, giáo trình, bài giảng, đề cương, tác giả..."
                aria-label="Từ khóa tìm kiếm tài liệu"
                className="w-full bg-transparent pl-10 pr-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="md" iconLeft={<Search className="size-4" />}>
              Tìm kiếm
            </Button>
          </div>
        </form>

        {/* Popular Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-text-muted select-none">
          <span className="font-medium text-text-main">Gợi ý tìm kiếm:</span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="rounded-full bg-neutral-100 hover:bg-primary/10 hover:text-primary px-2.5 py-1 text-xs text-text-muted transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeHeroSearch;
