import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, FileImage, FileText, FileVideo, Filter, Link2 } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { MyUploadItemResponse } from '@/features/resources/types/resource.types';

const ALL_STATUSES = 0;

const SAMPLE_RESOURCES: MyUploadItemResponse[] = [
  {
    id: 'resource-1',
    fileName: 'Báo cáo thực tập_Final.pdf',
    fileTypeName: 'Báo cáo',
    fileSizeBytes: 2_516_582,
    uploadedAt: '2024-05-12T08:00:00.000Z',
    fileStatusId: 2,
    fileStatusName: 'Chờ duyệt',
    majorId: 'CNTT',
    majorName: 'Công nghệ thông tin',
    subMajorName: 'Kỹ thuật phần mềm',
    courseName: 'Thực tập doanh nghiệp',
    keywords: ['thực tập', 'báo cáo'],
    authors: [{ id: 'author-1', fullName: 'Nguyễn Văn A' }],
  },
  {
    id: 'resource-2',
    fileName: 'Bài giảng tuần 4 - CTDL&GT.mp4',
    fileTypeName: 'Slide/Video',
    fileSizeBytes: 152_043_520,
    uploadedAt: '2024-05-10T08:00:00.000Z',
    fileStatusId: 1,
    fileStatusName: 'Đã duyệt',
    majorId: 'CNTT',
    majorName: 'Công nghệ thông tin',
    subMajorName: 'Khoa học máy tính',
    courseName: 'Cấu trúc dữ liệu và giải thuật',
    keywords: ['CTDL', 'bài giảng'],
    authors: [{ id: 'author-2', fullName: 'Trần Thị B' }],
  },
  {
    id: 'resource-3',
    fileName: 'Tài liệu tham khảo Machine Learning',
    fileTypeName: 'Link/Tài liệu',
    fileSizeBytes: null,
    uploadedAt: '2024-05-05T08:00:00.000Z',
    fileStatusId: 3,
    fileStatusName: 'Bị từ chối',
    majorId: 'CNTT',
    majorName: 'Công nghệ thông tin',
    subMajorName: 'Trí tuệ nhân tạo',
    courseName: 'Machine Learning',
    keywords: ['machine learning', 'tham khảo'],
    authors: [{ id: 'author-3', fullName: 'Lê Văn C' }],
  },
  {
    id: 'resource-4',
    fileName: 'Sơ đồ kiến trúc hệ thống.png',
    fileTypeName: 'Hình ảnh',
    fileSizeBytes: 1_258_291,
    uploadedAt: '2024-05-01T08:00:00.000Z',
    fileStatusId: 2,
    fileStatusName: 'Chờ duyệt',
    majorId: 'CNTT',
    majorName: 'Công nghệ thông tin',
    subMajorName: 'Kỹ thuật phần mềm',
    courseName: 'Kiến trúc và thiết kế phần mềm',
    keywords: ['kiến trúc', 'hệ thống'],
    authors: [{ id: 'author-4', fullName: 'Phạm Thị D' }],
  },
];

const statusVariant: Record<number, NonNullable<BadgeProps['variant']>> = {
  1: 'success',
  2: 'warning',
  3: 'danger',
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatFileSize(bytes: number | null) {
  if (bytes === null) return '—';
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MB`;
}

function ResourceIcon({ fileTypeName }: { fileTypeName: string }) {
  const commonClassName = 'size-4';
  const type = fileTypeName.toLocaleLowerCase('vi-VN');

  if (type.includes('video')) return <FileVideo className={commonClassName} aria-hidden="true" />;
  if (type.includes('hình')) return <FileImage className={commonClassName} aria-hidden="true" />;
  if (type.includes('link')) return <Link2 className={commonClassName} aria-hidden="true" />;
  return <FileText className={commonClassName} aria-hidden="true" />;
}

export interface ResourcesManagerProps {
  items?: MyUploadItemResponse[];
}

export function ResourcesManager({ items = SAMPLE_RESOURCES }: ResourcesManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState(ALL_STATUSES);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<'newest' | 'oldest'>('newest');

  const visibleItems = useMemo(() => {
    const filteredItems =
      selectedStatus === ALL_STATUSES ? items : items.filter((item) => item.fileStatusId === selectedStatus);
    return filteredItems.toSorted((first, second) => {
      const difference = Date.parse(second.uploadedAt) - Date.parse(first.uploadedAt);
      return sortDirection === 'newest' ? difference : -difference;
    });
  }, [items, selectedStatus, sortDirection]);

  return (
    <section
      className="overflow-hidden rounded-xl border border-border-subtle bg-surface"
      aria-label="Danh sách tài nguyên"
    >
      <div className="flex justify-end border-b border-border-subtle px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              aria-label="Lọc tài nguyên"
              aria-expanded={isFilterOpen}
              aria-controls="resource-status-filter"
              onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
              iconLeft={<Filter className="size-3.5" aria-hidden="true" />}
              iconRight={<ChevronDown className="size-3.5" aria-hidden="true" />}
            >
              Lọc
            </Button>
            {isFilterOpen ? (
              <div
                id="resource-status-filter"
                className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-border-subtle bg-surface p-1.5 shadow-lg"
              >
                {[
                  { id: ALL_STATUSES, label: 'Tất cả trạng thái' },
                  { id: 1, label: 'Đã duyệt' },
                  { id: 2, label: 'Chờ duyệt' },
                  { id: 3, label: 'Bị từ chối' },
                ].map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-text-main hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => {
                      setSelectedStatus(status.id);
                      setIsFilterOpen(false);
                    }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <label className="relative">
            <span className="sr-only">Sắp xếp tài nguyên</span>
            <select
              aria-label="Sắp xếp tài nguyên"
              value={sortDirection}
              onChange={(event) => setSortDirection(event.target.value === 'oldest' ? 'oldest' : 'newest')}
              className="h-8 appearance-none rounded-md border border-border-subtle bg-surface pl-3 pr-8 text-xs font-medium text-text-main outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="oldest">Sắp xếp: Cũ nhất</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-2 size-3.5 text-text-muted"
              aria-hidden="true"
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left" aria-label="Danh sách tài nguyên đã tải lên">
          <thead>
            <tr className="border-b border-border-subtle bg-background/60 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              <th className="px-4 py-3 sm:px-6">Tên tài liệu</th>
              <th className="px-4 py-3">Loại tài nguyên</th>
              <th className="px-4 py-3">Tác giả</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Dung lượng</th>
              <th className="px-4 py-3">Ngày tải lên</th>
              <th className="px-4 py-3 text-right sm:px-6">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border-subtle text-sm last:border-b-0 hover:bg-background/70"
              >
                <td className="px-4 py-3 sm:px-6">
                  <div className="flex min-w-56 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <ResourceIcon fileTypeName={item.fileTypeName} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-main">{item.fileName}</p>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {item.courseName ?? item.subMajorName ?? item.majorName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-main">{item.fileTypeName}</td>
                <td className="px-4 py-3 text-text-main">{item.authors[0]?.fullName ?? 'Chưa cập nhật'}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[item.fileStatusId] ?? 'neutral'}>
                    {item.fileStatusName ?? 'Chưa xác định'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-text-muted">{formatFileSize(item.fileSizeBytes)}</td>
                <td className="px-4 py-3 text-text-muted">{dateFormatter.format(new Date(item.uploadedAt))}</td>
                <td className="px-4 py-3 text-right sm:px-6">
                  <button
                    type="button"
                    className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label={`Xem chi tiết ${item.fileName}`}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-col gap-3 border-t border-border-subtle px-4 py-4 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Hiển thị {visibleItems.length} trong số {items.length} tài nguyên
        </p>
        <nav className="flex items-center gap-1" aria-label="Phân trang tài nguyên">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md"
            disabled
            aria-label="Trang trước"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span
            className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white"
            aria-current="page"
          >
            1
          </span>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md"
            disabled
            aria-label="Trang sau"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </nav>
      </footer>
    </section>
  );
}

export default ResourcesManager;
