import { BookOpen, Download, Eye, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import type { LibraryResourceItem } from '../types/all-resources.types';
import { formatFileSize, getFileTypeBadgeClass } from '../utils/allResourcesUtils';

export interface LibraryCatalogTableProps {
  items: LibraryResourceItem[];
  onSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName?: string) => void;
  downloadingFileId?: string | null;
}

export function LibraryCatalogTable({ items, onSelect, onDownload, downloadingFileId }: LibraryCatalogTableProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface shadow-2xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-70">Tài liệu</TableHead>
            <TableHead className="w-36">Thể loại</TableHead>
            <TableHead className="w-48 hidden md:table-cell">Chuyên ngành / Học phần</TableHead>
            <TableHead className="w-40 hidden lg:table-cell">Tác giả & Năm</TableHead>
            <TableHead className="w-32 hidden sm:table-cell">Ngày đăng</TableHead>
            <TableHead className="w-28 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const bannerSrc = item.bannerUrl || item.bannerImage;
            const badgeClass = getFileTypeBadgeClass(item.fileTypeName);
            const formattedSize = formatFileSize(item.fileSize);
            const isDownloading = downloadingFileId === item.fileId;

            return (
              <TableRow key={item.fileId} className="group">
                {/* Column Docs (Thumbnail + Title + Description preview) */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-border-subtle flex items-center justify-center">
                      {bannerSrc ? (
                        <img src={bannerSrc} alt={item.fileName} className="size-full object-cover" loading="lazy" />
                      ) : (
                        <div className="size-full bg-blue-50/80 text-primary flex items-center justify-center">
                          <BookOpen className="size-5" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onSelect(item.fileId)}
                        className="text-left font-semibold text-sm text-text-main line-clamp-1 hover:text-primary transition-colors cursor-pointer block"
                        title={item.fileName}
                      >
                        {item.fileName}
                      </button>

                      <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                        {item.fileDescription && (
                          <span className="truncate max-w-50 hidden sm:inline">{item.fileDescription}</span>
                        )}
                        {formattedSize && (
                          <span className="inline-flex items-center gap-1 shrink-0 text-[11px]">
                            <HardDrive className="size-3" aria-hidden="true" />
                            {formattedSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Column Type */}
                <TableCell className="py-3">
                  {item.fileTypeName ? (
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
                        badgeClass,
                      )}
                    >
                      {item.fileTypeName}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">Chưa phân loại</span>
                  )}
                </TableCell>

                {/* Column Major/Courses */}
                <TableCell className="py-3 hidden md:table-cell">
                  <div className="space-y-0.5 text-xs">
                    {item.subMajorCode && (
                      <div className="font-mono text-text-main font-medium">{item.subMajorCode}</div>
                    )}
                    {item.courseCode ? (
                      <div className="text-text-muted truncate max-w-37.5">{item.courseCode}</div>
                    ) : (
                      <div className="text-text-muted italic text-[11px]">Không có học phần</div>
                    )}
                  </div>
                </TableCell>

                {/* Column Author & Year */}
                <TableCell className="py-3 hidden lg:table-cell">
                  <div className="text-xs">
                    <div className="font-medium text-text-main truncate max-w-35" title={item.uploadBy || ''}>
                      {item.uploadBy || 'Tác giả ẩn'}
                    </div>
                    {item.yearCompleted && <div className="text-text-muted text-[11px]">Năm: {item.yearCompleted}</div>}
                  </div>
                </TableCell>

                {/* Column CreatedAt */}
                <TableCell className="py-3 text-xs text-text-muted hidden sm:table-cell whitespace-nowrap">
                  {formatDateTime(item.createdAt)}
                </TableCell>

                {/* Column Actions */}
                <TableCell className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelect(item.fileId)}
                      className="size-8 p-0 text-text-muted hover:text-primary hover:bg-primary/10"
                      aria-label={`Xem chi tiết ${item.fileName}`}
                      title="Xem chi tiết"
                    >
                      <Eye className="size-4" aria-hidden="true" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(item.fileId, item.fileName)}
                      disabled={isDownloading}
                      className="size-8 p-0 text-text-muted hover:text-primary hover:bg-primary/10"
                      aria-label={`Tải xuống ${item.fileName}`}
                      title="Tải xuống"
                    >
                      <Download className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default LibraryCatalogTable;
