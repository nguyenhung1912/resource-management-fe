import { useMemo, useState } from 'react';
import Input from '@/components/ui/Input';
import SearchFilterPanel from '@/features/resources/components/SearchFilterPanel';
import SearchSortControl, { type SortKey } from '@/features/resources/components/SearchSortControl';
import ResourceCard, { type ResourceCardProps } from '@/features/resources/components/ResourceCard';

// dữ liệu kiểm thử
const mockData: ResourceCardProps[] = [
  {
    id: 'r1',
    title: 'Hướng dẫn TypeScript nâng cao',
    author: 'Nguyễn Văn A',
    thumbnailUrl: null,
    fileType: 'PDF',
    views: 1245,
    rating: 4.5,
    updatedAt: '2026-09-10',
  },
  {
    id: 'r2',
    title: 'Bài giảng React Hooks (Tiếng Việt)',
    author: 'Trần Thị B',
    thumbnailUrl: null,
    fileType: 'Video',
    views: 8420,
    rating: 4.8,
    updatedAt: '2026-08-22',
  },
  {
    id: 'r3',
    title: 'Mẫu báo cáo thực tập - MS Word',
    author: 'Phòng đào tạo',
    thumbnailUrl: null,
    fileType: 'DOCX',
    views: 312,
    rating: 4.0,
    updatedAt: '2026-07-05',
  },
  {
    id: 'r4',
    title: 'Bộ sưu tập ảnh minh họa cho slide',
    author: 'Thư viện ảnh',
    thumbnailUrl: null,
    fileType: 'Image',
    views: 98,
    rating: 3.9,
    updatedAt: '2026-09-01',
  },
];

// Trang tìm kiếm tài nguyên
// - Đây là pha ráp UI, dữ liệu hiện tại là mock (không gọi API, không dùng `useEffect`).
export default function SearchResourcesPage() {
  // Mock data: danh sách tài nguyên giả để render giao diện

  // State cho phần sắp xếp và phân trang
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const [query, setQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Lọc + sắp xếp dữ liệu trên client từ mockData
  const processed = useMemo(() => {
    // Lọc theo query (tiêu đề hoặc tác giả)
    const q = query.trim().toLowerCase();
    let items = mockData.filter((m) => {
      if (!q) return true;
      return m.title.toLowerCase().includes(q) || m.author.toLowerCase().includes(q);
    });

    // Sắp xếp cơ bản theo `sortKey`
    items = items.slice().sort((a, b) => {
      switch (sortKey) {
        case 'latest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'views_desc':
          return b.views - a.views;
        case 'title_asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return items;
  }, [mockData, query, sortKey]);

  const totalResults = processed.length;
  const pageCount = Math.max(1, Math.ceil(totalResults / pageSize));

  const pageItems = processed.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Xử lý chuyển trang
  const goToPage = (p: number) => {
    const next = Math.max(1, Math.min(pageCount, p));
    setCurrentPage(next);
  };

  return (
    <div className="min-h-[60vh] bg-background p-6">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="mb-4 text-2xl font-semibold text-text-main">Tìm kiếm tài nguyên</h1>

        {/* Thanh tìm kiếm lớn */}
        <div className="max-w-3xl">
          <Input
            placeholder="Tìm theo tiêu đề, tác giả, từ khóa..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-border bg-surface p-3 text-text-main"
            aria-label="Thanh tìm kiếm tài nguyên"
          />
        </div>
      </header>

      {/* Body: Sidebar + Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar trái chứa SearchFilterPanel */}
        <aside className="w-full">
          <SearchFilterPanel />
        </aside>

        {/* Main content */}
        <main className="w-full">
          {/* Top row: kết quả và control sắp xếp */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-text-muted">Tìm thấy {totalResults} kết quả</div>
            <SearchSortControl currentSort={sortKey} onSortChange={(v) => setSortKey(v)} />
          </div>

          {/* Grid danh sách ResourceCard */}
          <section className="mb-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((r) => (
                <ResourceCard key={r.id} {...r} />
              ))}
            </div>
          </section>

          {/* Pagination đơn giản */}
          <nav aria-label="Phân trang" className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-border bg-surface px-3 py-1 text-sm disabled:opacity-50"
            >
              Trang trước
            </button>

            {/* Số trang tĩnh hiển thị 1..pageCount */}
            <div className="flex items-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  aria-current={p === currentPage ? 'page' : undefined}
                  className={`rounded-md px-3 py-1 text-sm ${
                    p === currentPage ? 'bg-primary text-white' : 'bg-surface border border-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="rounded-md border border-border bg-surface px-3 py-1 text-sm disabled:opacity-50"
            >
              Trang sau
            </button>
          </nav>
        </main>
      </div>
    </div>
  );
}
