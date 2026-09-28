import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  GitBranch,
  GraduationCap,
  HardDrive,
  Hash,
  Library,
  Loader2,
  MessageSquare,
  Star,
  Tag,
  User,
} from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { APP_PATHS } from '@/constants/path';
import { DocumentDiscussionPanel } from '@/features/comments/components/DocumentDiscussionPanel';
import type { PagedCommentResponse } from '@/features/comments/types/comment.types';
import { DocumentRatingPanel } from '@/features/ratings/components/DocumentRatingPanel';
import type { PagedRatingResponse, RatingSummaryResponse } from '@/features/ratings/types/rating.types';
import type { ResourceDetailResponse } from '@/features/resources/types/resource.types';
import { resourceService } from '@/services/resourceService';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { formatFileSize, getFileTypeBadgeClass } from '../utils/allResourcesUtils';

export interface LibraryResourceDetailModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isDownloading?: boolean;
  detail: ResourceDetailResponse | null;
  initialComments?: PagedCommentResponse | null;
  initialRatingSummary?: RatingSummaryResponse | null;
  initialRatings?: PagedRatingResponse | null;
  error?: string | null;
  onClose: () => void;
  onDownload: (fileId: string, fileName?: string) => void;
}

export function LibraryResourceDetailModal({
  isOpen,
  isLoading,
  isDownloading = false,
  detail,
  initialComments = null,
  initialRatingSummary = null,
  initialRatings = null,
  error,
  onClose,
  onDownload,
}: LibraryResourceDetailModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ratings' | 'discussion'>('ratings');
  const [isViewing, setIsViewing] = useState(false);

  const handleViewFile = async () => {
    if (!detail) return;
    if (detail.fileUrl && (detail.fileUrl.startsWith('http://') || detail.fileUrl.startsWith('https://'))) {
      window.open(detail.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      setIsViewing(true);
      const blob = await resourceService.downloadResourceFile(detail.fileId);
      const ext = detail.fileName?.split('.').pop()?.toLowerCase() || '';
      let mimeType = blob.type || 'application/octet-stream';
      if (ext === 'pdf') mimeType = 'application/pdf';
      else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'txt') mimeType = 'text/plain';

      const viewBlob = new Blob([blob], { type: mimeType });
      const fileUrl = window.URL.createObjectURL(viewBlob);
      window.open(fileUrl, '_blank');
    } catch (err: unknown) {
      console.error('View file error:', err);
    } finally {
      setIsViewing(false);
    }
  };

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
      maxWidth="6xl"
      title={
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <BookOpen className="size-4.5" aria-hidden="true" />
          </div>
          <span className="truncate text-base sm:text-lg font-bold text-text-main" title={detail?.fileName}>
            {detail?.fileName || 'Chi tiết tài liệu thư viện'}
          </span>
        </div>
      }
      description={
        detail ? (
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
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
            <span
              className="inline-flex items-center gap-1 text-xs text-text-muted font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-border-subtle"
              title={`Mã tệp: ${detail.fileId}`}
            >
              <Hash className="size-3 text-text-muted" aria-hidden="true" />
              <span>{detail.fileId.length > 16 ? `${detail.fileId.slice(0, 8)}...` : detail.fileId}</span>
            </span>
            {detail.fileStatusName && (
              <Badge variant="success" className="gap-1 font-medium text-xs">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                {detail.fileStatusName}
              </Badge>
            )}
            {initialRatingSummary && (
              <button
                type="button"
                onClick={() => setActiveTab('ratings')}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100/70 transition-colors text-xs font-semibold cursor-pointer"
                title="Xem đánh giá của tài liệu"
                data-testid="snapshot-rating-btn"
              >
                <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  {initialRatingSummary.averageRating > 0 ? initialRatingSummary.averageRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-[11px] font-normal text-amber-700">({initialRatingSummary.totalRatings})</span>
              </button>
            )}
          </div>
        ) : undefined
      }
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Đóng
          </Button>

          {detail && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleViewFile}
                disabled={isViewing}
                className="gap-2 shadow-xs cursor-pointer font-semibold"
                aria-label={`Xem tài liệu ${detail.fileName}`}
              >
                {isViewing ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
                <span>{isViewing ? 'Đang mở...' : 'Xem tài liệu'}</span>
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => onDownload(detail.fileId, detail.fileName)}
                disabled={isDownloading}
                className="gap-2 shadow-xs cursor-pointer font-semibold"
                aria-label={`Tải xuống tài liệu ${detail.fileName}`}
              >
                {isDownloading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                <span>{isDownloading ? 'Đang tải về...' : 'Tải xuống tài liệu'}</span>
              </Button>
            </div>
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

      {/* Detail Content with Modern Split-View */}
      {!isLoading && !error && detail && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start py-1">
          {/* CỘT TRÁI (58%): Thông tin chi tiết học thuật & Metadata tài liệu */}
          <div className="lg:col-span-7 space-y-4">
            {/* Banner cover preview if available */}
            {detail.bannerImage && (
              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-slate-100 border border-border-subtle shadow-2xs">
                <img src={detail.bannerImage} alt={detail.fileName} className="size-full object-cover" loading="lazy" />
              </div>
            )}

            {/* Abstract / Description */}
            <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-2xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-primary" aria-hidden="true" />
                <span>Mô tả / Tóm tắt học liệu</span>
              </h4>
              <p className="text-sm text-text-main leading-relaxed bg-slate-50/80 p-3.5 rounded-lg border-l-3 border-l-primary border border-border-subtle">
                {detail.fileDescription || 'Tài liệu này hiện chưa có mô tả chi tiết.'}
              </p>
            </div>

            {/* Academic & System Metadata Grid */}
            <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <GraduationCap className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span>Thông tin học thuật & Phân loại</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/70 border border-border-subtle/80">
                  <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-text-muted block">Chuyên ngành:</span>
                    <span className="font-semibold text-text-main block truncate">
                      {detail.subMajorName || detail.subMajorCode || 'Chưa phân loại'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/70 border border-border-subtle/80">
                  <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Library className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-text-muted block">Khoa / Ngành:</span>
                    <span className="font-semibold text-text-main block truncate">
                      {detail.majorName || 'Khoa Công nghệ Thông tin'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/70 border border-border-subtle/80">
                  <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-text-muted block">Học phần:</span>
                    <span className="font-semibold text-text-main block truncate">
                      {detail.courseName || detail.courseCode || 'Học liệu chung'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/70 border border-border-subtle/80">
                  <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-text-muted block">Năm hoàn thành:</span>
                    <span className="font-semibold text-text-main block truncate">
                      {detail.yearCompleted || 'Không rõ'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/70 border border-border-subtle/80">
                  <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-text-muted block">Người tải lên:</span>
                    <span className="font-semibold text-text-main block truncate">
                      {detail.uploadUserName || detail.uploadUserId || 'Hệ thống'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/70 border border-border-subtle/80">
                  <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-text-muted block">Ngày tải lên:</span>
                    <span className="font-semibold text-text-main block truncate">
                      {formatDateTime(detail.createdAt)}
                    </span>
                  </div>
                </div>

                {formattedSize && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/70 border border-border-subtle/80 sm:col-span-2">
                    <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <HardDrive className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-text-muted block">Dung lượng tệp:</span>
                      <span className="font-semibold text-text-main block">{formattedSize}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Authors List */}
            {authorList.length > 0 && (
              <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Tác giả / Nhóm nghiên cứu</span>
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {authorList.map((author, index) => (
                    <span
                      key={`${author}-${index}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 transition-colors text-xs font-medium text-text-main border border-border-subtle"
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
              <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Tag className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Từ khóa tìm kiếm (Tags)</span>
                </h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  {detail.keywords.map((kw, index) => (
                    <span
                      key={`${kw}-${index}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50/70 text-primary border border-blue-100 text-xs font-medium hover:bg-blue-100/60 transition-colors"
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
                  className="inline-flex items-center justify-between w-full sm:w-auto gap-3 px-4 py-2.5 rounded-xl bg-surface border border-border-subtle hover:border-primary/40 hover:bg-primary/5 text-text-main hover:text-primary transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <GitBranch className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold">Xem kho mã nguồn trên GitHub</span>
                  </div>
                  <ExternalLink
                    className="size-3.5 text-text-muted group-hover:text-primary transition-colors"
                    aria-hidden="true"
                  />
                </a>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (42%): TABS ĐÁNH GIÁ & THẢO LUẬN BÊN CẠNH TÀI LIỆU */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border-subtle bg-slate-50/50 p-3 sm:p-4 shadow-2xs space-y-4">
              <Tabs
                variant="segmented"
                items={[
                  {
                    id: 'ratings',
                    label: 'Đánh giá',
                    count: initialRatingSummary?.totalRatings,
                    icon: Star,
                  },
                  {
                    id: 'discussion',
                    label: 'Thảo luận',
                    count: initialComments?.totalCount,
                    icon: MessageSquare,
                  },
                ]}
                activeValue={activeTab}
                onChange={(tab) => setActiveTab(tab as 'ratings' | 'discussion')}
                className="w-full"
              />

              {activeTab === 'ratings' ? (
                <DocumentRatingPanel
                  fileId={detail.fileId}
                  initialSummary={initialRatingSummary}
                  initialRatings={initialRatings}
                  onRequireLogin={() => {
                    onClose();
                    navigate(APP_PATHS.LOGIN);
                  }}
                />
              ) : (
                <DocumentDiscussionPanel fileId={detail.fileId} initialComments={initialComments} />
              )}
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}

export default LibraryResourceDetailModal;
