import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  RotateCcw,
  ShieldAlert,
  User,
} from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { AppealStatusBadge } from './AppealStatusBadge';
import type { AppealDetailResponse, AppealItemResponse } from '@/features/appeals/types/appeal.types';
import { formatDateTime } from '@/utils/date';

export interface AppealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: AppealDetailResponse | null;
  fallbackItem?: AppealItemResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function AppealDetailModal({
  isOpen,
  onClose,
  detail,
  fallbackItem,
  isLoading,
  error,
  onRetry,
}: AppealDetailModalProps) {
  const activeItem = detail ?? fallbackItem;

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={activeItem ? `Đơn khiếu nại #${activeItem.appealId}` : 'Chi tiết khiếu nại'}
      description={activeItem?.fileName ?? 'Thông tin giải trình và phản hồi kiểm duyệt'}
      icon={
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
      }
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {activeItem?.attachmentUrl && (
              <a
                href={activeItem.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Xem tài liệu minh chứng</span>
              </a>
            )}
          </div>
          <Button variant="secondary" size="md" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-text-muted gap-2 text-xs bg-background/50 rounded-lg p-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            <span>Đang cập nhật thông tin chi tiết mới nhất từ hệ thống...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-danger text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                iconLeft={<RotateCcw className="h-3.5 w-3.5" />}
                className="h-7 text-xs px-2"
              >
                Thử lại
              </Button>
            )}
          </div>
        )}

        {/* Content Details */}
        {activeItem && (
          <div className="space-y-4 text-xs">
            {/* Summary docs & Status */}
            <div className="p-4 rounded-xl bg-background/50 border border-border-subtle space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-muted block">
                    Tài liệu khiếu nại
                  </span>
                  <h4 className="text-sm font-semibold text-text-main mt-0.5 leading-snug">{activeItem.fileName}</h4>
                </div>
                <AppealStatusBadge status={activeItem.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border-subtle/60 text-[11px]">
                <div>
                  <span className="text-text-muted block">Lần giải trình:</span>
                  <span className="font-semibold text-text-main">Lần {activeItem.appealAttempt}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Giảng viên thụ lý:</span>
                  <div className="flex items-center gap-1 font-semibold text-text-main">
                    <User className="h-3 w-3 text-text-muted" aria-hidden="true" />
                    <span>{activeItem.assignedLecturerName || 'Đang chờ phân công'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-text-muted block">Ngày gửi đơn:</span>
                  <div className="flex items-center gap-1 text-text-main">
                    <Calendar className="h-3 w-3 text-text-muted" aria-hidden="true" />
                    <span>{formatDateTime(activeItem.createdAt)}</span>
                  </div>
                </div>
              </div>

              {activeItem.fileUrl && (
                <div className="pt-1">
                  <a
                    href={activeItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Mở liên kết tài liệu gốc</span>
                  </a>
                </div>
              )}
            </div>

            {(detail?.latestRejectionReason || typeof detail?.latestPlagiarismScore === 'number') && (
              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-warning font-semibold text-xs">
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                  <span>Kết quả kiểm duyệt ban đầu của hệ thống</span>
                </div>
                {detail.latestRejectionReason && (
                  <p className="text-text-main text-xs leading-relaxed">
                    <strong>Lý do từ chối:</strong> {detail.latestRejectionReason}
                  </p>
                )}
                {typeof detail.latestPlagiarismScore === 'number' && (
                  <p className="text-text-muted text-[11px]">
                    Tỷ lệ trùng lặp phát hiện:{' '}
                    <span className="font-semibold text-warning">{detail.latestPlagiarismScore}%</span>
                  </p>
                )}
              </div>
            )}

            {/* Nội dung giải trình của sinh viên */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main block">Nội dung giải trình của bạn:</label>
              <div className="p-3.5 rounded-xl bg-surface border border-border-subtle leading-relaxed text-text-main whitespace-pre-wrap">
                {activeItem.studentExplanation}
              </div>
            </div>

            {/* Response from lecturer */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main block">Phản hồi từ Giảng viên kiểm duyệt:</label>
              {activeItem.status === 'Pending' ? (
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/50 flex items-start gap-2 text-text-muted text-xs">
                  <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="leading-relaxed">
                    Đơn khiếu nại của bạn đang được tiếp nhận và xử lý. Giảng viên sẽ xem xét minh chứng và phản hồi kết
                    quả trong thời gian sớm nhất.
                  </p>
                </div>
              ) : activeItem.lecturerResponse ? (
                <div className="p-3.5 rounded-xl bg-surface border border-border-subtle space-y-2">
                  <p className="leading-relaxed text-text-main whitespace-pre-wrap">{activeItem.lecturerResponse}</p>
                  {activeItem.resolvedAt && (
                    <div className="text-[11px] text-text-muted pt-1 border-t border-border-subtle/50 flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <span>Đã giải quyết vào: {formatDateTime(activeItem.resolvedAt)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-gray-50 border border-border-subtle text-text-muted italic">
                  Không có nội dung nhận xét bổ sung từ giảng viên.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}

export default AppealDetailModal;
