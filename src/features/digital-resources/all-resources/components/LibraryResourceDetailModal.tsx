import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  GitBranch,
  GraduationCap,
  HardDrive,
  Hash,
  Library,
  Loader2,
  Tag,
  User,
} from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { ResourceDetailResponse } from '@/features/resources/types/resource.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { formatFileSize, getFileTypeBadgeClass } from '../utils/allResourcesUtils';

export interface LibraryResourceDetailModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isDownloading?: boolean;
  detail: ResourceDetailResponse | null;
  error?: string | null;
  onClose: () => void;
  onDownload: (fileId: string, fileName?: string) => void;
}

export function LibraryResourceDetailModal({
  isOpen,
  isLoading,
  isDownloading = false,
  detail,
  error,
  onClose,
  onDownload,
}: LibraryResourceDetailModalProps) {
  if (!isOpen) return null;

  const formattedSize = detail ? formatFileSize(detail.fileSize) : '';
  const badgeClass = detail ? getFileTypeBadgeClass(detail.fileTypeName) : '';
  const authorList = detail?.authors?.length
    ? detail.authors.map((a) => a.fullName || a.authorName).filter(Boolean)
    : detail?.authorNames || [];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="size-4.5" aria-hidden="true" />
          </div>
          <span className="truncate text-base sm:text-lg font-bold text-text-main">
            {detail?.fileName || 'Chi tiết tài liệu thư viện'}
          </span>
        </div>
      }
      description={
        detail ? (
          <span className="flex flex-wrap items-center gap-2 pt-1">
            {detail.fileTypeName && (
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                  badgeClass,
                )}
              >
                {detail.fileTypeName}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-text-muted font-mono bg-slate-100 px-2 py-0.5 rounded-md">
              <Hash className="size-3" aria-hidden="true" />
              {detail.fileId}
            </span>
            {detail.fileStatusName && (
              <Badge variant="success" className="gap-1 font-medium">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                {detail.fileStatusName}
              </Badge>
            )}
          </span>
        ) : undefined
      }
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Đóng
          </Button>

          {detail && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onDownload(detail.fileId, detail.fileName)}
              disabled={isDownloading}
              className="gap-2 shadow-xs"
              aria-label={`Tải xuống tài liệu ${detail.fileName}`}
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="size-4" aria-hidden="true" />
              )}
              <span>{isDownloading ? 'Đang tải về...' : 'Tải xuống tài liệu'}</span>
            </Button>
          )}
        </div>
      }
    >
      {/* Loading State */}
      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-text-muted">Đang nạp thông tin chi tiết tài liệu...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-danger/20 bg-danger/5 text-danger flex items-start gap-3 my-4"
        >
          <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold">Không thể tải thông tin tài liệu</p>
            <p className="text-xs text-danger/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Detail Content */}
      {!isLoading && !error && detail && (
        <div className="space-y-5 py-2">
          {/* Banner cover preview if available */}
          {detail.bannerImage && (
            <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-slate-100 border border-border-subtle shadow-2xs">
              <img src={detail.bannerImage} alt={detail.fileName} className="size-full object-cover" loading="lazy" />
            </div>
          )}

          {/* Abstract / Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Mô tả / Tóm tắt học liệu</h4>
            <p className="text-sm text-text-main leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-border-subtle">
              {detail.fileDescription || 'Tài liệu này hiện chưa có mô tả chi tiết.'}
            </p>
          </div>

          {/* Academic & System Metadata Grid */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Thông tin học thuật & Phân loại
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface p-4 rounded-xl border border-border-subtle text-xs">
              <div className="flex items-start gap-2">
                <GraduationCap className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-text-muted block">Chuyên ngành:</span>
                  <span className="font-semibold text-text-main">
                    {detail.subMajorName || detail.subMajorCode || 'Chưa phân loại'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Library className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-text-muted block">Khoa / Ngành:</span>
                  <span className="font-semibold text-text-main">{detail.majorName || 'Khoa Công nghệ Thông tin'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <BookOpen className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-text-muted block">Học phần:</span>
                  <span className="font-semibold text-text-main">
                    {detail.courseName || detail.courseCode || 'Học liệu chung'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-text-muted block">Năm hoàn thành:</span>
                  <span className="font-semibold text-text-main">{detail.yearCompleted || 'Không rõ'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-text-muted block">Người tải lên:</span>
                  <span className="font-semibold text-text-main">
                    {detail.uploadUserName || detail.uploadUserId || 'Hệ thống'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-text-muted block">Ngày tải lên:</span>
                  <span className="font-semibold text-text-main">{formatDateTime(detail.createdAt)}</span>
                </div>
              </div>

              {formattedSize && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <HardDrive className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-text-muted block">Dung lượng tệp:</span>
                    <span className="font-semibold text-text-main">{formattedSize}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Authors List */}
          {authorList.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Tác giả / Nhóm nghiên cứu</h4>
              <div className="flex flex-wrap items-center gap-2">
                {authorList.map((author, index) => (
                  <span
                    key={`${author}-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-text-main border border-border-subtle"
                  >
                    <User className="size-3 text-text-muted" aria-hidden="true" />
                    {author}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords / Tags */}
          {detail.keywords && detail.keywords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Từ khóa tìm kiếm (Tags)</h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {detail.keywords.map((kw, index) => (
                  <span
                    key={`${kw}-${index}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50/70 text-primary border border-blue-100 text-xs font-medium"
                  >
                    <Tag className="size-3" aria-hidden="true" />
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Repository Link */}
          {detail.githubLink && (
            <div className="pt-1">
              <a
                href={detail.githubLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
              >
                <GitBranch className="size-4" aria-hidden="true" />
                <span>Xem kho mã nguồn trên GitHub</span>
                <ExternalLink className="size-3 text-slate-400" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      )}
    </BaseModal>
  );
}

export default LibraryResourceDetailModal;
