import { useState } from 'react';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import Input from '@/components/ui/Input';
import SearchFilterPanel from '@/features/resources/components/SearchFilterPanel';
import SearchSortControl, { type SortKey } from '@/features/resources/components/SearchSortControl';
import ResourceCard from '@/features/resources/components/ResourceCard';
import type { SearchResponse } from '../types/search.types';

export default function SearchResourcesPage() {
  // 1. Hứng dữ liệu thật từ Server thông qua Loader
  // const { items, totalCount, totalPages, currentPage } = useLoaderData() as SearchResponse;
  const responseData = useLoaderData() as SearchResponse;

  const items = responseData?.items || [];
  const totalCount = responseData?.totalCount || items.length;
  const totalPages = responseData?.totalPages || 1;
  const currentPage = responseData?.currentPage || 1;

  // 2. Sử dụng URL làm nguồn chân lý (Source of Truth) cho toàn bộ state
  const [searchParams, setSearchParams] = useSearchParams();

  // State tạm thời cho ô nhập liệu (để không bị lag khi đang gõ)
  const [query, setQuery] = useState<string>(searchParams.get('q') || '');

  // Xác định SortKey hiện tại từ URL để truyền cho UI
  const currentSortBy = searchParams.get('sortBy') || 'date';
  const currentSortDir = searchParams.get('sortDirection') || 'desc';
  let currentSortKey: SortKey = 'latest';
  if (currentSortBy === 'date' && currentSortDir === 'asc') currentSortKey = 'oldest';
  if (currentSortBy === 'views' && currentSortDir === 'desc') currentSortKey = 'views_desc';
  if (currentSortBy === 'name' && currentSortDir === 'asc') currentSortKey = 'title_asc';

  // --- CÁC HÀM CẬP NHẬT URL (KÍCH HOẠT LOADER CHẠY LẠI) ---

  // Xử lý khi nhấn Enter ở thanh tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchParams.set('q', query);
    searchParams.set('page', '1'); // Reset về trang 1 khi search mới
    setSearchParams(searchParams);
  };

  // Xử lý khi đổi cách sắp xếp
  const handleSortChange = (val: SortKey) => {
    let sortBy = 'date';
    let sortDirection = 'desc';

    if (val === 'latest') {
      sortBy = 'date';
      sortDirection = 'desc';
    }
    if (val === 'oldest') {
      sortBy = 'date';
      sortDirection = 'asc';
    }
    if (val === 'views_desc') {
      sortBy = 'views';
      sortDirection = 'desc';
    }
    if (val === 'title_asc') {
      sortBy = 'name';
      sortDirection = 'asc';
    }

    searchParams.set('sortBy', sortBy);
    searchParams.set('sortDirection', sortDirection);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  // Xử lý khi chuyển trang
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    searchParams.set('page', p.toString());
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-[60vh] bg-background p-6">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="mb-4 text-2xl font-semibold text-text-main">Tìm kiếm tài nguyên</h1>

        {/* Thanh tìm kiếm: Bọc trong <form> để người dùng có thể nhấn Enter */}
        <form onSubmit={handleSearchSubmit} className="max-w-3xl">
          <Input
            placeholder="Tìm theo tiêu đề, tác giả, từ khóa (Nhấn Enter để tìm)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface p-3 text-text-main"
            aria-label="Thanh tìm kiếm tài nguyên"
          />
        </form>
      </header>

      {/* Body: Sidebar + Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar trái chứa bộ lọc */}
        <aside className="w-full">
          <SearchFilterPanel
            // Sau này anh sẽ truyền hàm onApply vào đây để cập nhật searchParams
            onApply={(filters) => {
              console.log('Filters applied:', filters);
              // TODO: Gắn các trường lọc từ bảng vào URL
            }}
          />
        </aside>

        {/* Main content */}
        <main className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-text-muted">Tìm thấy {totalCount} kết quả</div>
            <SearchSortControl currentSort={currentSortKey} onSortChange={handleSortChange} />
          </div>

          {/* Grid danh sách ResourceCard */}
          <section className="mb-6">
            {items.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-surface">
                <span className="text-text-muted">Không tìm thấy tài nguyên nào phù hợp.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* 3. Ánh xạ dữ liệu từ API vào Props của Card */}
                {items.map((item) => (
                  <ResourceCard
                    key={item.fileId}
                    id={item.fileId}
                    title={item.fileName}
                    author={item.uploadBy || 'Ẩn danh'}
                    thumbnailUrl={item.fileUrl} // Có thể là null tùy API
                    fileType={item.fileTypeName || 'Tài liệu'}
                    views={0} // API chưa trả về trường này, tạm gán 0
                    rating={0} // API chưa trả về trường này, tạm gán 0
                    updatedAt={item.createdAt}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Phân trang" className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md border border-border bg-surface px-3 py-1 text-sm disabled:opacity-50"
              >
                Trang trước
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    aria-current={p === currentPage ? 'page' : undefined}
                    className={`rounded-md px-3 py-1 text-sm ${
                      p === currentPage ? 'bg-primary text-white' : 'bg-surface border border-border text-text-main'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md border border-border bg-surface px-3 py-1 text-sm disabled:opacity-50"
              >
                Trang sau
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
