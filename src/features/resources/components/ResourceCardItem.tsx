import { Link } from 'react-router-dom';
import { Download, Eye, FileImage, FileText, FileVideo, Link2, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import type { MyUploadItemResponse } from '@/features/resources/types/resource.types';
import { STATUS_VARIANTS, formatResourceStatusName } from '../constants/resourceConstants';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatFileSize(bytes?: number | null) {
  if (bytes === null || bytes === undefined) return '—';
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

export interface ResourceCardItemProps {
  item: MyUploadItemResponse;
  onDelete: (item: MyUploadItemResponse) => void;
  onSelect?: (item: MyUploadItemResponse) => void;
  onDownload?: (item: MyUploadItemResponse) => void;
  isDownloading?: boolean;
}

export function ResourceCardItem({
  item,
  onDelete,
  onSelect,
  onDownload,
  isDownloading = false,
}: ResourceCardItemProps) {
  const itemId = item.fileId || item.id || '';
  const authorName =
    item.authors?.[0]?.fullName || item.authors?.[0]?.authorName || item.authorNames?.[0] || 'Chưa cập nhật';

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-2xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ResourceIcon fileTypeName={item.fileTypeName} />
          </span>
          <div className="min-w-0">
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="truncate font-semibold text-sm text-text-main hover:text-primary transition-colors text-left block w-full cursor-pointer"
                title={item.fileName}
              >
                {item.fileName}
              </button>
            ) : (
              <h4 className="truncate font-semibold text-sm text-text-main" title={item.fileName}>
                {item.fileName}
              </h4>
            )}
            <p className="mt-0.5 truncate text-xs text-text-muted">
              {item.courseName ?? item.subMajorName ?? item.majorName}
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANTS[item.fileStatusId] ?? 'neutral'} className="shrink-0">
          {formatResourceStatusName(item.fileStatusId, item.fileStatusName)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle/60 text-xs text-text-muted">
        <div>
          <span className="text-[11px] block text-text-muted/80">Tác giả</span>
          <span className="font-medium text-text-main truncate block" title={authorName}>
            {authorName}
          </span>
        </div>
        <div>
          <span className="text-[11px] block text-text-muted/80">Dung lượng</span>
          <span className="font-medium text-text-main">{formatFileSize(item.fileSize ?? item.fileSizeBytes)}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[11px] block text-text-muted/80">Ngày tải lên</span>
          <span className="font-medium text-text-main">{formatUploadedDate(item.createdAt ?? item.uploadedAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border-subtle/60">
        {onSelect && (
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-text-muted hover:text-primary hover:bg-primary/10"
            aria-label={`Xem chi tiết ${item.fileName}`}
            title="Xem chi tiết"
            onClick={() => onSelect(item)}
          >
            <Eye className="size-4" aria-hidden="true" />
          </Button>
        )}
        {onDownload && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isDownloading}
            className="size-8 p-0 text-text-muted hover:text-primary hover:bg-primary/10"
            aria-label={`Tải xuống ${item.fileName}`}
            title="Tải xuống"
            onClick={() => onDownload(item)}
          >
            {isDownloading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
          </Button>
        )}
        <Link
          to={APP_PATHS.RESOURCE_EDIT(itemId)}
          className="inline-flex size-8 items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label={`Chỉnh sửa ${item.fileName}`}
          title="Chỉnh sửa"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0 text-text-muted hover:text-danger hover:bg-danger/10"
          aria-label={`Xóa ${item.fileName}`}
          title="Xóa"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export default ResourceCardItem;
