import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  ChevronDown,
  Download,
  FileImage,
  FileText,
  FileVideo,
  Filter,
  Link2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { APP_PATHS } from '@/constants/path';
import type { MyUploadItemResponse } from '@/features/resources/types/resource.types';
import type { ResourcesManagerLoaderData } from '@/features/resources/pages/resourcesManagerLoader';
import { resourceService } from '@/services/resourceService';
import { ALL_STATUSES } from '../constants/resourceConstants';
import { DeleteResourceDialog } from './DeleteResourceDialog';

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

function formatFileSize(bytes?: number | null) {
  if (bytes === undefined || bytes === null) return '—';
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MB`;
}

function formatUploadedDate(dateStr?: string) {
  if (!dateStr) return '—';
  const timestamp = Date.parse(dateStr);
  if (Number.isNaN(timestamp)) return '—';
  return dateFormatter.format(new Date(timestamp));
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
  loaderData?: ResourcesManagerLoaderData;
  onRevalidate?: () => void;
  onDeleteSuccess?: (fileId: string) => void;
}

export function ResourcesManager({ items, loaderData, onRevalidate, onDeleteSuccess }: ResourcesManagerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const managerRef = useRef<HTMLElement>(null);

  // URL search params
  const urlStatus = searchParams.get('status');
  const selectedStatus = urlStatus ? Number.parseInt(urlStatus, 10) : ALL_STATUSES;
  const urlSearch = searchParams.get('search') ?? '';
  const urlSort = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const urlPage = searchParams.get('page') ? Math.max(1, Number.parseInt(searchParams.get('page')!, 10)) : 1;

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<MyUploadItemResponse | null>(null);
  const [deletedResourceIds, setDeletedResourceIds] = useState<Set<string>>(() => new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const isServerDriven = Boolean(loaderData && !items);

  const activeItems = useMemo(() => {
    const raw = items ?? loaderData?.resourcesData.items ?? [];
    return raw.filter((item) => {
      const id = item.fileId || item.id || '';
      return !deletedResourceIds.has(id);
    });
  }, [items, loaderData?.resourcesData, deletedResourceIds]);

  const statusCounts = useMemo(() => {
    if (loaderData?.statusCounts) {
      return loaderData.statusCounts;
    }
    return {
      all: activeItems.length,
      approved: activeItems.filter((i) => i.fileStatusId === 1).length,
      pending: activeItems.filter((i) => i.fileStatusId === 2).length,
      rejected: activeItems.filter((i) => i.fileStatusId === 3).length,
    };
  }, [loaderData, activeItems]);

  const statusTabs: TabItem<number>[] = [
    { id: ALL_STATUSES, label: 'Tất cả', count: statusCounts.all },
    { id: 1, label: 'Đã duyệt', count: statusCounts.approved, dotColor: 'bg-success' },
    { id: 2, label: 'Chờ duyệt', count: statusCounts.pending, dotColor: 'bg-warning' },
    { id: 3, label: 'Bị từ chối', count: statusCounts.rejected, dotColor: 'bg-danger' },
  ];

  const pageSize = 10;

  const { visibleItems, totalPages, totalCount } = useMemo(() => {
    if (isServerDriven && loaderData) {
      return {
        visibleItems: activeItems,
        totalPages: loaderData.resourcesData.totalPages,
        totalCount: loaderData.resourcesData.totalCount,
      };
    }

    let filtered = activeItems;

    if (selectedStatus !== ALL_STATUSES) {
      filtered = filtered.filter((item) => item.fileStatusId === selectedStatus);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.fileName.toLowerCase().includes(q) ||
          item.fileTypeName.toLowerCase().includes(q) ||
          (item.courseName && item.courseName.toLowerCase().includes(q)) ||
          item.authors.some((a) => (a.fullName ?? a.authorName ?? '').toLowerCase().includes(q)),
      );
    }

    filtered = filtered.toSorted((first, second) => {
      const firstDate = Date.parse(first.createdAt ?? first.uploadedAt ?? '');
      const secondDate = Date.parse(second.createdAt ?? second.uploadedAt ?? '');
      const difference = (Number.isNaN(secondDate) ? 0 : secondDate) - (Number.isNaN(firstDate) ? 0 : firstDate);
      return urlSort === 'newest' ? difference : -difference;
    });

    const calculatedTotalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const start = (urlPage - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      visibleItems: paginated,
      totalPages: calculatedTotalPages,
      totalCount: filtered.length,
    };
  }, [isServerDriven, loaderData, activeItems, selectedStatus, searchQuery, urlSort, urlPage, pageSize]);

  const handleStatusSelect = (statusId: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (statusId === ALL_STATUSES) {
      nextParams.delete('status');
    } else {
      nextParams.set('status', String(statusId));
    }
    nextParams.delete('page');
    setSearchParams(nextParams);
    setIsFilterOpen(false);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      nextParams.set('search', value.trim());
    } else {
      nextParams.delete('search');
    }
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  };

  const handleSortChange = (newSort: 'newest' | 'oldest') => {
    const nextParams = new URLSearchParams(searchParams);
    if (newSort === 'newest') {
      nextParams.delete('sort');
    } else {
      nextParams.set('sort', newSort);
    }
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (page <= 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', String(page));
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('status');
    nextParams.delete('search');
    nextParams.delete('sort');
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    const target = resourceToDelete;
    const targetId = target.fileId || target.id || '';
    if (!targetId) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      setDeletedResourceIds((current) => new Set(current).add(targetId));
      setResourceToDelete(null);

      await resourceService.deleteResource(targetId);
      onRevalidate?.();
      onDeleteSuccess?.(targetId);
    } catch (err: unknown) {
      setDeletedResourceIds((current) => {
        const next = new Set(current);
        next.delete(targetId);
        return next;
      });
      const message = err instanceof Error ? err.message : 'Không thể xóa tài nguyên lúc này.';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (item: MyUploadItemResponse) => {
    const fileId = item.fileId || item.id || '';
    if (!fileId) return;
    try {
      setDownloadingId(fileId);
      await resourceService.downloadResourceFile(fileId, item.fileName);
    } catch (err: unknown) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section ref={managerRef} tabIndex={-1} className="space-y-4 outline-none" aria-label="Danh sách tài nguyên">
      {deleteError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-danger/30 bg-danger/5 p-3.5 text-sm text-danger"
        >
          <span>{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="font-medium hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 1. Filter & Search Controls Bar */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-xs space-y-4 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <Input
              type="search"
              placeholder="Tìm theo tên tài liệu, môn học, tác giả..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 pr-4"
              aria-label="Tìm kiếm tài nguyên"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Dropdown Popover */}
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
                  className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-border-subtle bg-surface p-1.5 shadow-lg"
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
                      className="w-full rounded-lg px-3 py-2 text-left text-xs sm:text-sm text-text-main hover:bg-background transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      onClick={() => handleStatusSelect(status.id)}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Sort Select */}
            <div className="w-44">
              <Select
                aria-label="Sắp xếp tài nguyên"
                selectSize="sm"
                value={urlSort}
                onChange={(e) => handleSortChange(e.target.value === 'oldest' ? 'oldest' : 'newest')}
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="oldest">Sắp xếp: Cũ nhất</option>
              </Select>
            </div>

            {(selectedStatus !== ALL_STATUSES || searchQuery.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                iconLeft={<RotateCcw className="size-3.5" />}
                className="text-xs text-text-muted hover:text-text-main"
              >
                Đặt lại
              </Button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="pt-1 border-t border-border-subtle/60">
          <Tabs
            items={statusTabs}
            activeValue={selectedStatus}
            onChange={handleStatusSelect}
            variant="pills"
            size="sm"
            ariaLabel="Lọc tài nguyên theo trạng thái"
          />
        </div>
      </div>

      {/* 2. Resources Data View */}
      {visibleItems.length === 0 ? (
        <EmptyState
          title={
            searchQuery.trim().length > 0 || selectedStatus !== ALL_STATUSES
              ? 'Không tìm thấy tài nguyên phù hợp'
              : 'Chưa có tài nguyên nào'
          }
          description={
            searchQuery.trim().length > 0 || selectedStatus !== ALL_STATUSES
              ? 'Không tìm thấy tài nguyên nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.'
              : 'Bạn chưa tải lên tài nguyên nào lên hệ thống. Hãy bắt đầu chia sẻ tài liệu ngay bây giờ.'
          }
          action={
            searchQuery.trim().length > 0 || selectedStatus !== ALL_STATUSES ? (
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Đặt lại bộ lọc
              </Button>
            ) : (
              <Link to={APP_PATHS.RESOURCE_UPLOAD} className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                <Plus className="size-4 mr-1.5" aria-hidden="true" />
                Tải lên tài nguyên
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop & Tablet Responsive Table View */}
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-2xs">
            <Table
              className="w-full min-w-[900px] border-collapse text-left"
              aria-label="Danh sách tài nguyên đã tải lên"
            >
              <TableHeader>
                <TableRow className="border-b border-border-subtle bg-background/60 hover:bg-background/60 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  <TableHead className="px-4 py-3.5 sm:px-6">Tên tài liệu</TableHead>
                  <TableHead className="px-4 py-3.5">Loại tài nguyên</TableHead>
                  <TableHead className="px-4 py-3.5">Tác giả</TableHead>
                  <TableHead className="px-4 py-3.5">Trạng thái</TableHead>
                  <TableHead className="px-4 py-3.5">Dung lượng</TableHead>
                  <TableHead className="px-4 py-3.5">Ngày tải lên</TableHead>
                  <TableHead className="px-4 py-3.5 text-right sm:px-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.map((item) => {
                  const itemId = item.fileId || item.id || '';
                  const authorName =
                    item.authors?.[0]?.fullName ||
                    item.authors?.[0]?.authorName ||
                    item.authorNames?.[0] ||
                    'Chưa cập nhật';
                  const uploadedDate = item.createdAt || item.uploadedAt;
                  const fileSize = item.fileSize ?? item.fileSizeBytes ?? null;
                  const statusName = item.fileStatusName || item.statusName || 'Chưa xác định';

                  return (
                    <TableRow
                      key={itemId}
                      className="border-b border-border-subtle text-sm last:border-b-0 hover:bg-background/60 transition-colors"
                    >
                      <TableCell className="px-4 py-3.5 sm:px-6">
                        <div className="flex min-w-56 items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ResourceIcon fileTypeName={item.fileTypeName} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-sm text-text-main">{item.fileName}</p>
                            <p className="mt-0.5 truncate text-xs text-text-muted">
                              {item.courseName ?? item.subMajorName ?? item.majorName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-text-main">{item.fileTypeName}</TableCell>
                      <TableCell className="px-4 py-3.5 text-text-main">{authorName}</TableCell>
                      <TableCell className="px-4 py-3.5">
                        <Badge variant={statusVariant[item.fileStatusId] ?? 'neutral'}>{statusName}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-text-muted">{formatFileSize(fileSize)}</TableCell>
                      <TableCell className="px-4 py-3.5 text-text-muted">{formatUploadedDate(uploadedDate)}</TableCell>
                      <TableCell className="px-4 py-3.5 text-right sm:px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={downloadingId === itemId}
                            className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-text-main transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 cursor-pointer"
                            aria-label={`Tải xuống ${item.fileName}`}
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="size-3.5" aria-hidden="true" />
                            Tải về
                          </button>
                          <Link
                            to={APP_PATHS.RESOURCE_EDIT(itemId)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-text-main transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            aria-label={`Chỉnh sửa ${item.fileName}`}
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Chỉnh sửa
                          </Link>
                          <button
                            type="button"
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 rounded-lg border border-danger/30 bg-surface px-2.5 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:opacity-50 cursor-pointer"
                            aria-label={`Xóa ${item.fileName}`}
                            onClick={() => setResourceToDelete(item)}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Xóa
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={urlPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            itemLabel="tài nguyên"
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteResourceDialog
        isOpen={Boolean(resourceToDelete)}
        fileName={resourceToDelete?.fileName ?? ''}
        restoreFocusRef={managerRef}
        onClose={() => setResourceToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}

export default ResourcesManager;
