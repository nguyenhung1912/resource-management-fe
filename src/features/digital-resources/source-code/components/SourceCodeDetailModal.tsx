import {
  Calendar,
  Code2,
  Download,
  ExternalLink,
  GitBranch,
  GraduationCap,
  Hash,
  Loader2,
  Star,
  User,
} from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { SourceCodeDetail } from '@/features/digital-resources/source-code/types/source-code.types';
import { formatYearCompleted, getSourceCodeStatusBadge, isValidGithubUrl } from '../utils/sourceCodeUtils';

export interface SourceCodeDetailModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isDownloading?: boolean;
  detail: SourceCodeDetail | null;
  error?: string | null;
  onClose: () => void;
  onDownload: (fileId: string, fileName?: string) => void;
}

export function SourceCodeDetailModal({
  isOpen,
  isLoading,
  isDownloading = false,
  detail,
  error,
  onClose,
  onDownload,
}: SourceCodeDetailModalProps) {
  if (!isOpen) return null;

  const statusBadge = detail ? getSourceCodeStatusBadge(detail.fileStatusId, detail.fileStatusName) : null;
  const hasGithub = detail ? isValidGithubUrl(detail.githubLink) : false;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Code2 className="size-4.5" aria-hidden="true" />
          </div>
          <span className="truncate text-lg font-bold text-text-main">
            {detail?.fileName || 'Chi tiết dự án mã nguồn'}
          </span>
        </div>
      }
      description={
        detail ? (
          <span className="flex flex-wrap items-center gap-2 pt-1">
            {statusBadge ? (
              <Badge variant={statusBadge.variant} className="font-medium">
                {statusBadge.label}
              </Badge>
            ) : null}

            {detail.fileTypeName ? (
              <Badge variant="neutral" showDot={false}>
                {detail.fileTypeName}
              </Badge>
            ) : null}

            {detail.yearCompleted ? (
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Calendar className="size-3 text-text-muted" aria-hidden="true" />
                Năm {formatYearCompleted(detail.yearCompleted)}
              </span>
            ) : null}
          </span>
        ) : undefined
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div>
            {hasGithub && detail?.githubLink ? (
              <a
                href={detail.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-main hover:text-primary transition-colors py-1.5 px-3 rounded-lg border border-border-subtle hover:bg-gray-50"
              >
                <GitBranch className="size-4 text-primary" aria-hidden="true" />
                <span>Mở GitHub Repository</span>
                <ExternalLink className="size-3 text-text-muted" aria-hidden="true" />
              </a>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="md" onClick={onClose} aria-label="Đóng hộp thoại chi tiết">
              Đóng
            </Button>

            {detail ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isDownloading}
                onClick={() => onDownload(detail.fileId, detail.fileName)}
                aria-label={`Tải xuống mã nguồn ${detail.fileName}`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="size-4 mr-1.5 animate-spin" aria-hidden="true" />
                    Đang tải xuống...
                  </>
                ) : (
                  <>
                    <Download className="size-4 mr-1.5" aria-hidden="true" />
                    Tải mã nguồn
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      {/* Content modal */}
      {isLoading ? (
        <div className="py-14 flex flex-col items-center justify-center space-y-3 text-text-muted">
          <Loader2 className="size-8 text-primary animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium">Đang tải thông tin chi tiết dự án...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-sm text-danger font-medium">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Quay lại
          </Button>
        </div>
      ) : detail ? (
        <div className="space-y-6 text-sm text-text-main">
          {/* Picture Banner */}
          {detail.bannerUrl ? (
            <div className="relative h-48 w-full rounded-xl overflow-hidden border border-border-subtle bg-slate-900">
              <img src={detail.bannerUrl} alt={`Banner ${detail.fileName}`} className="h-full w-full object-cover" />
            </div>
          ) : null}

          {/* Desc Project */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Mô tả đề tài / Dự án</h3>
            <p className="text-sm leading-relaxed text-text-main whitespace-pre-line bg-gray-50/60 p-3.5 rounded-lg border border-border-subtle">
              {detail.fileDescription || 'Chưa có mô tả chi tiết cho dự án này.'}
            </p>
          </div>

          {/* Github Repo */}
          {hasGithub && detail.githubLink ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <GitBranch className="size-3.5" aria-hidden="true" />
                  Mã nguồn mở GitHub
                </span>
                <p className="text-xs text-text-muted font-mono break-all">{detail.githubLink}</p>
              </div>
              <a
                href={detail.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                <span>Xem trên GitHub</span>
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </div>
          ) : null}

          {/* Information Academic & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Đơn vị học vụ */}
            <div className="rounded-lg border border-border-subtle p-3.5 space-y-2 bg-surface">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-primary" aria-hidden="true" />
                Thông tin học vụ
              </span>
              <div className="space-y-1.5 text-xs">
                {detail.departmentName ? (
                  <div>
                    <span className="text-text-muted">Khoa: </span>
                    <span className="font-medium text-text-main">{detail.departmentName}</span>
                  </div>
                ) : null}
                {detail.majorName ? (
                  <div>
                    <span className="text-text-muted">Ngành: </span>
                    <span className="font-medium text-text-main">{detail.majorName}</span>
                  </div>
                ) : null}
                {detail.subMajorName || detail.subMajorCode ? (
                  <div>
                    <span className="text-text-muted">Chuyên ngành: </span>
                    <span className="font-medium text-text-main">{detail.subMajorName || detail.subMajorCode}</span>
                  </div>
                ) : null}
                {detail.courseName || detail.courseCode ? (
                  <div>
                    <span className="text-text-muted">Học phần: </span>
                    <span className="font-medium text-text-main">{detail.courseName || detail.courseCode}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Author & Uploader */}
            <div className="rounded-lg border border-border-subtle p-3.5 space-y-2 bg-surface">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5">
                <User className="size-3.5 text-primary" aria-hidden="true" />
                Tác giả & Đăng tải
              </span>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-text-muted">Đồng tác giả: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detail.authors && detail.authors.length > 0 ? (
                      detail.authors.map((author) => (
                        <span
                          key={author.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-text-main font-medium text-[11px]"
                        >
                          {author.fullName}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-muted italic">Chưa có tác giả ghi nhận</span>
                    )}
                  </div>
                </div>

                {detail.uploadUserName ? (
                  <div className="pt-1 border-t border-border-subtle">
                    <span className="text-text-muted">Người tải lên: </span>
                    <span className="font-medium text-text-main">{detail.uploadUserName}</span>
                    {detail.uploadUserEmail ? (
                      <span className="text-text-muted ml-1">({detail.uploadUserEmail})</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Tags Keywork & Review */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-border-subtle">
            {/* Keywords */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1">
                <Hash className="size-3 text-text-muted" aria-hidden="true" />
                Từ khóa tìm kiếm
              </span>
              <div className="flex flex-wrap gap-1.5">
                {detail.keywords && detail.keywords.length > 0 ? (
                  detail.keywords.map((kw) => (
                    <Badge key={kw.id} variant="neutral" showDot={false} className="text-[11px]">
                      {`#${kw.keyword}`}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-text-muted italic">Không có từ khóa</span>
                )}
              </div>
            </div>

            {/* Rating summary */}
            {detail.ratingSummary ? (
              <div className="flex items-center gap-2 bg-orange-50/60 px-3 py-1.5 rounded-lg border border-orange-200/50 shrink-0">
                <Star className="size-4 text-warning fill-warning" aria-hidden="true" />
                <span className="font-bold text-sm text-text-main">
                  {detail.ratingSummary.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-text-muted">({detail.ratingSummary.totalRatings} lượt đánh giá)</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </BaseModal>
  );
}

export default SourceCodeDetailModal;
