import { UserSearch } from 'lucide-react';
import type { AuthorItem } from '../../types/search.types';

export interface SearchAuthorsTabProps {
  authors?: AuthorItem[];
}

export function SearchAuthorsTab({ authors = [] }: SearchAuthorsTabProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 space-y-4">
      <h2 className="text-base font-bold text-text-main">Danh bạ Tác giả & Giảng viên</h2>
      <p className="text-xs text-text-muted">
        Tra cứu thông tin hồ sơ và danh mục học liệu đã xuất bản của cán bộ, giảng viên và sinh viên.
      </p>

      {authors.length === 0 ? (
        <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
          <UserSearch className="size-8 text-neutral-300" aria-hidden="true" />
          <p>Hiện chưa có thông tin danh bạ tác giả.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {authors.map((author) => {
            const initial = author.name.charAt(author.name.lastIndexOf(' ') + 1);

            return (
              <div
                key={author.name}
                className="flex items-center gap-3 rounded-xl border border-border-subtle bg-background p-4 shadow-2xs"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-text-main">{author.name}</p>
                  <p className="text-[11px] text-text-muted">
                    {author.role} • {author.dept}
                  </p>
                  <p className="text-[11px] font-semibold text-primary mt-0.5">{author.count} tài liệu đã đăng</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchAuthorsTab;
