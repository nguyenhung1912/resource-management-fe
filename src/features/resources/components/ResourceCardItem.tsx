import { Link } from 'react-router-dom';
import { FileImage, FileText, FileVideo, Link2, Pencil, Trash2 } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { APP_PATHS } from '@/constants/path';
import type { MyUploadItemResponse } from '@/features/resources/types/resource.types';

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
}

export function ResourceCardItem({ item, onDelete }: ResourceCardItemProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-2xs space-y-3 select-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ResourceIcon fileTypeName={item.fileTypeName} />
          </span>
          <div className="min-w-0">
            <h4 className="truncate font-semibold text-sm text-text-main">{item.fileName}</h4>
            <p className="mt-0.5 truncate text-xs text-text-muted">
              {item.courseName ?? item.subMajorName ?? item.majorName}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant[item.fileStatusId] ?? 'neutral'} className="shrink-0">
          {item.fileStatusName ?? 'Chưa xác định'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle/60 text-xs text-text-muted">
        <div>
          <span className="text-[11px] block text-text-muted/80">Tác giả</span>
          <span className="font-medium text-text-main truncate block">
            {item.authors[0]?.fullName ?? 'Chưa cập nhật'}
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

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle/60">
        <Link
          to={APP_PATHS.RESOURCE_EDIT(item.fileId || item.id || '')}
          className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={`Chỉnh sửa ${item.fileName}`}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Chỉnh sửa
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-danger/30 bg-surface px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 cursor-pointer"
          aria-label={`Xóa ${item.fileName}`}
          onClick={() => onDelete(item)}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Xóa
        </button>
      </div>
    </div>
  );
}

export default ResourceCardItem;
