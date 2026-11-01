import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GitBranch,
  GraduationCap,
  HardDrive,
  Hash,
  Loader2,
  Pencil,
  Tag,
  User,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BaseModal } from '@/components/common/BaseModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { isValidGithubUrl } from '@/utils/urlValidation';
import type { MyUploadItemResponse } from '@/features/resources/types/resource.types';
import { FILE_STATUS, STATUS_VARIANTS, formatResourceStatusName } from '../constants/resourceConstants';

export interface ResourceDetailModalProps {
  isOpen: boolean;
  item: MyUploadItemResponse | null;
  isDownloading?: boolean;
  isViewing?: boolean;
  onClose: () => void;
  onDownload: (item: MyUploadItemResponse) => void;
  onViewFile?: (item: MyUploadItemResponse) => void;
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
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

export function ResourceDetailModal({
  isOpen,
  item,
  isDownloading = false,
  isViewing = false,
  onClose,
  onDownload,
  onViewFile,
}: ResourceDetailModalProps) {
  if (!item) return null;

  const itemId = item.fileId || item.id || '';
  const authorName =
    item.authors?.[0]?.fullName || item.authors?.[0]?.authorName || item.authorNames?.[0] || 'Chưa cập nhật tác giả';
  const statusName = formatResourceStatusName(item.fileStatusId, item.fileStatusName || item.statusName);
  const statusVariant = STATUS_VARIANTS[item.fileStatusId] ?? 'neutral';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-text-main sm:text-lg" title={item.fileName}>
              {item.fileName}
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1 font-mono">
                <Hash className="size-3" aria-hidden="true" />
                {itemId.length > 12 ? `${itemId.slice(0, 8)}...` : itemId}
              </span>
              <span>•</span>
              <Badge variant={statusVariant}>{statusName}</Badge>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            <Link
              to={APP_PATHS.RESOURCE_EDIT(itemId)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-text-main shadow-2xs transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Chỉnh sửa
            </Link>

            {onViewFile && (
              <Button
                variant="outline"
                size="sm"
                disabled={isViewing}
                onClick={() => onViewFile(item)}
                iconLeft={
                  isViewing ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Eye className="size-3.5" aria-hidden="true" />
                  )
                }
              >
                {isViewing ? 'Đang mở...' : 'Xem tài liệu'}
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              disabled={isDownloading}
              onClick={() => onDownload(item)}
              iconLeft={
                isDownloading ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-3.5" aria-hidden="true" />
                )
              }
            >
              {isDownloading ? 'Đang tải...' : 'Tải tài liệu'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Attached File Action Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <FileText className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-main" title={item.fileName}>
                {item.fileName}
              </p>
              <p className="text-xs text-text-muted">
                {formatFileSize(item.fileSize ?? item.fileSizeBytes)} • {item.fileTypeName || 'Tài liệu'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onViewFile && (
              <Button
                variant="outline"
                size="sm"
                disabled={isViewing}
                onClick={() => onViewFile(item)}
                iconLeft={
                  isViewing ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Eye className="size-3.5" aria-hidden="true" />
                  )
                }
                className="bg-surface"
              >
                {isViewing ? 'Đang mở...' : 'Xem trực tiếp'}
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              disabled={isDownloading}
              onClick={() => onDownload(item)}
              iconLeft={
                isDownloading ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-3.5" aria-hidden="true" />
                )
              }
            >
              {isDownloading ? 'Đang tải...' : 'Tải về'}
            </Button>
          </div>
        </div>
        {/* Status Callout Banner */}
        {item.fileStatusId === FILE_STATUS.PENDING ? (
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3.5 text-xs text-amber-900">
            <Clock className="size-4 shrink-0 text-warning mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Tài liệu đang chờ kiểm duyệt</p>
              <p className="mt-0.5 text-amber-800/90">
                Tài liệu này hiện chỉ hiển thị trong danh sách quản lý cá nhân của bạn. Sau khi được giảng viên phê
                duyệt, tài liệu sẽ xuất hiện công khai tại Thư viện Tài nguyên Số.
              </p>
            </div>
          </div>
        ) : item.fileStatusId === FILE_STATUS.UPLOADED ? (
          <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-3.5 text-xs text-emerald-900">
            <CheckCircle2 className="size-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Tài liệu đã được phê duyệt</p>
              <p className="mt-0.5 text-emerald-800/90">
                Tài liệu đã được kiểm duyệt hợp lệ và đang hiển thị công khai cho sinh viên, giảng viên tại Thư viện Tài
                nguyên Số.
              </p>
            </div>
          </div>
        ) : item.fileStatusId === FILE_STATUS.REJECT ? (
          <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-rose-900">
            <XCircle className="size-4 shrink-0 text-danger mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Tài liệu bị từ chối kiểm duyệt</p>
              <p className="mt-0.5 text-rose-800/90">
                Tài liệu chưa đạt yêu cầu kiểm duyệt của giảng viên. Bạn có thể chỉnh sửa lại thông tin tài liệu hoặc
                gửi khiếu nại.
              </p>
            </div>
          </div>
        ) : null}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Loại tài nguyên */}
          <div className="rounded-xl border border-border-subtle bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" aria-hidden="true" />
              Loại tài nguyên
            </span>
            <p className="mt-1 font-semibold text-sm text-text-main">{item.fileTypeName || 'Chưa phân loại'}</p>
          </div>

          {/* Tác giả */}
          <div className="rounded-xl border border-border-subtle bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <User className="size-3.5 text-primary" aria-hidden="true" />
              Tác giả
            </span>
            <p className="mt-1 font-semibold text-sm text-text-main truncate" title={authorName}>
              {authorName}
            </p>
          </div>

          {/* Chuyên ngành & Học phần */}
          <div className="rounded-xl border border-border-subtle bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-primary" aria-hidden="true" />
              Chuyên ngành & Môn học
            </span>
            <p className="mt-1 font-semibold text-sm text-text-main">
              {item.courseName || item.courseCode || item.subMajorName || item.majorName || 'Chưa cập nhật'}
            </p>
            {item.subMajorName && item.courseName && (
              <p className="text-xs text-text-muted mt-0.5">
                {item.subMajorName} {item.majorName ? `• ${item.majorName}` : ''}
              </p>
            )}
          </div>

          {/* Năm hoàn thành & Dung lượng */}
          <div className="rounded-xl border border-border-subtle bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" aria-hidden="true" />
              Năm & Dung lượng
            </span>
            <p className="mt-1 font-semibold text-sm text-text-main flex items-center gap-3">
              <span>{item.yearCompleted ? `Năm ${item.yearCompleted}` : 'Chưa có năm'}</span>
              <span className="text-text-muted">•</span>
              <span className="inline-flex items-center gap-1 text-text-muted font-normal text-xs">
                <HardDrive className="size-3" aria-hidden="true" />
                {formatFileSize(item.fileSize ?? item.fileSizeBytes)}
              </span>
            </p>
          </div>
        </div>

        {/* Description / Tóm tắt */}
        {item.fileDescription && (
          <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-2xs space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-primary" aria-hidden="true" />
              Mô tả tài liệu
            </span>
            <p className="text-sm text-text-main leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-border-subtle">
              {item.fileDescription}
            </p>
          </div>
        )}

        {/* GitHub link if available */}
        {isValidGithubUrl(item.githubLink) && (
          <div className="rounded-xl border border-border-subtle bg-surface p-3.5 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <GitBranch className="size-4 text-text-muted shrink-0" aria-hidden="true" />
              <span className="text-xs text-text-muted shrink-0">Kho mã nguồn:</span>
              <a
                href={item.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-medium hover:underline truncate inline-flex items-center gap-1"
              >
                <span className="truncate">{item.githubLink}</span>
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}

        {/* Keywords */}
        {item.keywords && item.keywords.length > 0 && (
          <div className="rounded-xl border border-border-subtle bg-surface p-3.5 shadow-2xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Tag className="size-3.5 text-primary" aria-hidden="true" />
              Từ khóa học thuật
            </span>
            <div className="flex flex-wrap gap-1.5">
              {item.keywords.map((kw, idx) => (
                <span
                  key={`${kw}-${idx}`}
                  className="inline-flex items-center rounded-md border border-border-subtle bg-slate-100/70 px-2 py-0.5 text-xs text-text-main"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Upload timestamp */}
        <div className="text-right text-[11px] text-text-muted pt-1">
          Ngày tải lên: {formatUploadedDate(item.createdAt || item.uploadedAt)}
        </div>
      </div>
    </BaseModal>
  );
}
