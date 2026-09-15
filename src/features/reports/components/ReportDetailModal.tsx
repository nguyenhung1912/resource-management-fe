import { AlertCircle, Calendar, Clock, Gavel, Loader2, RotateCcw, ShieldAlert, User, UserCheck } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import type { ReportDetailResponse, ReportItemResponse } from '@/features/reports/types/report.types';
import { formatDateTime } from '@/utils/date';
import { ReportStatusBadge } from './ReportStatusBadge';
import { ReportTargetBadge } from './ReportTargetBadge';

export interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: ReportDetailResponse | null;
  fallbackItem?: ReportItemResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onOpenResolve?: (item: ReportItemResponse) => void;
}

export function ReportDetailModal({
  isOpen,
  onClose,
  detail,
  fallbackItem,
  isLoading,
  error,
  onRetry,
  onOpenResolve,
}: ReportDetailModalProps) {
  const activeItem = detail ?? fallbackItem;

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={activeItem ? `Chi tiết báo cáo #${activeItem.reportId}` : 'Chi tiết báo cáo vi phạm'}
      description="Thông tin phản ánh vi phạm và nhật ký xử lý của Giảng viên / Quản trị viên"
      icon={
        <div className="p-2 rounded-lg bg-danger/10 text-danger">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
      }
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {activeItem && onOpenResolve && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenResolve(activeItem);
                }}
                iconLeft={<Gavel className="h-4 w-4" />}
                className="text-xs cursor-pointer"
              >
                Xử lý
              </Button>
            )}
          </div>

          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Đóng
          </Button>
        </div>
      }
    >
      {isLoading && !activeItem ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-text-muted">Đang tải thông tin chi tiết báo cáo vi phạm...</p>
        </div>
      ) : error && !activeItem ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-xs text-rose-600 font-medium max-w-sm">{error}</p>
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              iconLeft={<RotateCcw className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              Thử lại
            </Button>
          )}
        </div>
      ) : activeItem ? (
        <div className="space-y-4 text-xs select-none">
          {/* Header Summary Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Trạng thái:</span>
              <ReportStatusBadge status={activeItem.status} size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Đối tượng:</span>
              <ReportTargetBadge targetType={activeItem.targetType} size="md" />
            </div>
          </div>

          {/* Section 1: Reporter Info & Target Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Reporter Box */}
            <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-text-main">
                <User className="h-4 w-4 text-primary" />
                <span>Người gửi báo cáo</span>
              </div>
              <div className="space-y-1 text-[11px] text-text-muted">
                <div>
                  Họ tên: <strong className="text-text-main font-medium text-xs">{activeItem.reporterName}</strong>
                </div>
                <div>
                  Mã người dùng: <span className="font-mono text-text-main">{activeItem.reporterUid}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Thời gian gửi: {formatDateTime(activeItem.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Target Box */}
            <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-text-main">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span>Đối tượng bị phản ánh</span>
              </div>
              <div className="space-y-1 text-[11px] text-text-muted">
                {detail?.targetTitle && (
                  <div>
                    Tiêu đề: <strong className="text-text-main font-medium text-xs">{detail.targetTitle}</strong>
                  </div>
                )}
                <div>
                  Mã định danh: <span className="font-mono text-text-main font-semibold">{activeItem.targetId}</span>
                </div>
                <div>
                  Phân loại đối tượng: <span className="text-text-main font-medium">{activeItem.targetType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Violation Detail */}
          <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text-main text-xs">
                Loại vi phạm: <span className="text-danger">{activeItem.reportTypeName}</span>
              </span>
              <span className="text-[11px] text-text-muted">Mã loại vi phạm: #{activeItem.reportTypeId}</span>
            </div>
            <div>
              <span className="text-[11px] text-text-muted block mb-1">Mô tả lý do phản ánh vi phạm:</span>
              <div className="p-3 rounded-lg bg-gray-50 border border-border-subtle text-text-main leading-relaxed whitespace-pre-wrap">
                {activeItem.reason}
              </div>
            </div>
          </div>

          {/* Section 3: Audit Trail & Handling History */}
          <div className="p-4 rounded-xl border border-border bg-surface space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-text-main">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Kết quả kiểm tra & Xử lý</span>
            </div>

            {activeItem.handlingNotes || detail?.handledByName || detail?.resolvedAt ? (
              <div className="space-y-2 text-[11px] text-text-muted">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    Người xử lý:{' '}
                    <strong className="text-text-main font-medium">
                      {detail?.handledByName ?? detail?.handledByUid ?? 'Cán bộ kiểm duyệt'}
                    </strong>
                  </div>
                  {detail?.resolvedAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Thời gian xử lý: {formatDateTime(detail.resolvedAt)}</span>
                    </div>
                  )}
                </div>
                {activeItem.handlingNotes && (
                  <div>
                    <span className="block text-[11px] text-text-muted mb-1">Ghi chú kết luận xử lý:</span>
                    <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-emerald-900 leading-relaxed whitespace-pre-wrap">
                      {activeItem.handlingNotes}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-text-muted italic py-1">
                Báo cáo này đang ở trạng thái chờ kiểm tra hoặc chưa có kết luận chính thức.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </BaseModal>
  );
}

export default ReportDetailModal;
