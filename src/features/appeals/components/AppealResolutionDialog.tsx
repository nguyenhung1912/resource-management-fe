import { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  Gavel,
  ShieldAlert,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useResolveAppeal } from '../hooks/useResolveAppeal';
import type { AppealDetailResponse, AppealItemResponse } from '../types/appeal.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';

export interface AppealResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appeal: AppealItemResponse | null;
  detail?: AppealDetailResponse | null;
  onSuccess?: (resolvedItem: AppealItemResponse, message: string) => void;
}

interface DialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  appeal: AppealItemResponse;
  detail?: AppealDetailResponse | null;
  onSuccess?: (resolvedItem: AppealItemResponse, message: string) => void;
}

const APPROVE_TEMPLATES = [
  'Giải trình hợp lý, minh chứng đối chiếu hợp lệ. Đồng ý phê duyệt tài liệu.',
  'Đã xác minh tài liệu minh chứng, nội dung giải trình đáp ứng đúng quy định kiểm duyệt.',
  'Tài liệu gốc chính chủ, tỷ lệ trùng lặp đã được giải trình rõ ràng và chấp thuận.',
];

const REJECT_TEMPLATES = [
  'Minh chứng chưa đủ cơ sở xác thực. Tỷ lệ trùng lặp vẫn vượt ngưỡng cho phép theo quy chế.',
  'Nội dung giải trình chưa làm rõ được các đoạn trùng lặp nghiêm trọng. Giữ nguyên từ chối.',
  'Tài liệu minh chứng đính kèm không hợp lệ hoặc không truy cập được.',
];

function AppealResolutionDialogContent({ isOpen, onClose, appeal, detail, onSuccess }: DialogContentProps) {
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [lecturerResponse, setLecturerResponse] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);

  const { isResolving, apiError, clearApiError, resolve } = useResolveAppeal();

  const activeItem = detail ?? appeal;
  const trimmedResponse = lecturerResponse.trim();
  const isResponseValid = trimmedResponse.length >= 10;
  const showValidationError = touched && !isResponseValid;

  const handleApplyTemplate = (template: string) => {
    setLecturerResponse(template);
    setTouched(true);
    clearApiError();
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isResponseValid || isResolving) return;

    await resolve(
      appeal.appealId,
      {
        isApproved,
        lecturerResponse: trimmedResponse,
      },
      {
        onSuccess: (updatedItem, message) => {
          onSuccess?.(updatedItem, message);
          onClose();
        },
      },
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Giải quyết khiếu nại #{appeal.appealId}</span>
        </div>
      }
      description={`Tài liệu: ${appeal.fileName}`}
      icon={
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Gavel className="h-5 w-5" aria-hidden="true" />
        </div>
      }
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isResolving}>
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            form="appeal-resolution-form"
            variant={isApproved ? 'primary' : 'danger'}
            size="md"
            isLoading={isResolving}
            disabled={isResolving || (!isResponseValid && touched)}
            iconLeft={isApproved ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          >
            {isApproved ? 'Xác nhận Duyệt lại' : 'Xác nhận Giữ nguyên từ chối'}
          </Button>
        </div>
      }
    >
      <form id="appeal-resolution-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Error Alert nếu có lỗi từ Backend */}
        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-danger text-xs animate-in fade-in"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="leading-relaxed">{apiError}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-background border border-border-subtle space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                Thông tin sinh viên gửi khiếu nại
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-text-main">
                  <User className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                  <span>{appeal.studentName || 'Sinh viên'}</span>
                  {appeal.studentEmail && <span className="text-text-muted font-normal">({appeal.studentEmail})</span>}
                </div>
                <div className="flex items-center gap-1 text-text-muted">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formatDateTime(appeal.createdAt)}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-[11px]">
                  Lần giải trình: {appeal.appealAttempt}
                </span>
              </div>
            </div>

            {appeal.fileUrl && (
              <a
                href={appeal.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline shrink-0 bg-surface px-2.5 py-1.5 rounded-lg border border-border-subtle"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Xem file gốc</span>
              </a>
            )}
          </div>

          {(detail?.latestRejectionReason || typeof detail?.latestPlagiarismScore === 'number') && (
            <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-warning font-semibold text-[11px]">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Lý do từ chối ban đầu từ hệ thống:</span>
              </div>
              {detail.latestRejectionReason && (
                <p className="text-text-main leading-relaxed">{detail.latestRejectionReason}</p>
              )}
              {typeof detail.latestPlagiarismScore === 'number' && (
                <p className="text-text-muted text-[11px]">
                  Độ trùng lặp ghi nhận: <strong className="text-warning">{detail.latestPlagiarismScore}%</strong>
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <span className="font-semibold text-text-main block">Nội dung giải trình của sinh viên:</span>
            <div className="p-3 rounded-lg bg-surface border border-border-subtle text-text-main leading-relaxed whitespace-pre-wrap">
              {appeal.studentExplanation}
            </div>
          </div>

          {activeItem.attachmentUrl && (
            <div className="pt-1">
              <a
                href={activeItem.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline bg-surface px-3 py-1.5 rounded-lg border border-border-subtle"
              >
                <Download className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Mở tài liệu minh chứng sinh viên đính kèm</span>
              </a>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-main block">
            Quyết định giải quyết <span className="text-danger">*</span>
          </label>

          <div
            role="radiogroup"
            aria-label="Quyết định giải quyết khiếu nại"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {/* Option 1: Approve */}
            <div
              role="radio"
              tabIndex={0}
              aria-checked={isApproved}
              onClick={() => {
                setIsApproved(true);
                clearApiError();
              }}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setIsApproved(true);
                  clearApiError();
                }
              }}
              className={cn(
                'p-3.5 rounded-xl border transition-all cursor-pointer select-none relative flex flex-col justify-between gap-2',
                isApproved
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-border-subtle bg-surface hover:bg-gray-50/70',
              )}
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className={cn('h-4 w-4 mt-0.5 shrink-0', isApproved ? 'text-emerald-600' : 'text-text-muted')}
                  aria-hidden="true"
                />
                <div>
                  <h4 className={cn('font-semibold text-xs', isApproved ? 'text-emerald-900' : 'text-text-main')}>
                    Chấp thuận giải trình
                  </h4>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                    Minh chứng hợp lý. Tài liệu của bạn sẽ được chuyển sang trạng thái <strong>Đã duyệt</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Reject */}
            <div
              role="radio"
              tabIndex={0}
              aria-checked={!isApproved}
              onClick={() => {
                setIsApproved(false);
                clearApiError();
              }}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setIsApproved(false);
                  clearApiError();
                }
              }}
              className={cn(
                'p-3.5 rounded-xl border transition-all cursor-pointer select-none relative flex flex-col justify-between gap-2',
                !isApproved
                  ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-1 ring-rose-500/20'
                  : 'border-border-subtle bg-surface hover:bg-gray-50/70',
              )}
            >
              <div className="flex items-start gap-2.5">
                <XCircle
                  className={cn('h-4 w-4 mt-0.5 shrink-0', !isApproved ? 'text-rose-600' : 'text-text-muted')}
                  aria-hidden="true"
                />
                <div>
                  <h4 className={cn('font-semibold text-xs', !isApproved ? 'text-rose-900' : 'text-text-main')}>
                    Bác bỏ giải trình
                  </h4>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                    Giải trình không đạt yêu cầu. Tài liệu tiếp tục ở trạng thái <strong>Bị từ chối</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="lecturer-response-input" className="text-xs font-semibold text-text-main">
              Ý kiến nhận xét <span className="text-danger">*</span>
            </label>
            <span className="text-[11px] text-text-muted">Tối thiểu 10 ký tự</span>
          </div>

          <Textarea
            id="lecturer-response-input"
            value={lecturerResponse}
            onChange={(e) => {
              setLecturerResponse(e.target.value);
              if (!touched) setTouched(true);
              clearApiError();
            }}
            onBlur={() => setTouched(true)}
            placeholder={
              isApproved
                ? 'Nhập lý do chấp thuận giải trình để gửi cho sinh viên (vd: Giải trình hợp lý, đối chiếu minh chứng hợp lệ)...'
                : 'Nhập lý do bác bỏ khiếu nại (vd: Minh chứng chưa đủ cơ sở xác thực, trùng lặp vượt quy định)...'
            }
            maxLength={1000}
            showCount
            currentLength={lecturerResponse.length}
            rows={3}
            error={showValidationError ? 'Vui lòng nhập nhận xét phân xử với ít nhất 10 ký tự.' : undefined}
          />

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
              <span>Gợi ý mẫu nhận xét nhanh:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(isApproved ? APPROVE_TEMPLATES : REJECT_TEMPLATES).map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(template)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-md bg-background hover:bg-gray-200/60 border border-border-subtle text-text-main transition-colors select-none"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}

export function AppealResolutionDialog(props: AppealResolutionDialogProps) {
  if (!props.isOpen || !props.appeal) return null;

  return (
    <AppealResolutionDialogContent
      key={props.appeal.appealId}
      isOpen={props.isOpen}
      onClose={props.onClose}
      appeal={props.appeal}
      detail={props.detail}
      onSuccess={props.onSuccess}
    />
  );
}

export default AppealResolutionDialog;
