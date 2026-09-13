import { useState, type SubmitEvent } from 'react';
import { AlertCircle, AlertTriangle, Percent, Sparkles, XCircle } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DocumentModerationSummary } from './DocumentModerationSummary';
import { useRejectModeration } from '../hooks/useRejectModeration';
import type { ModerationDecisionResponse, ModerationTargetDocument } from '../types/moderation.types';

export interface RejectDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: ModerationTargetDocument | null;
  onSuccess?: (decision: ModerationDecisionResponse, message: string) => void;
}

interface DialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  document: ModerationTargetDocument;
  onSuccess?: (decision: ModerationDecisionResponse, message: string) => void;
}

const REJECT_REASON_TEMPLATES = [
  'Độ trùng lặp văn bản vượt quá ngưỡng 30%.',
  'Tài liệu thiếu danh mục tài liệu tham khảo và trích dẫn chưa đúng quy chuẩn IEEE/APA.',
  'Định dạng tài liệu không đúng biểu mẫu quy định hoặc nội dung bị lỗi hiển thị.',
  'Nội dung nghiên cứu không phù hợp với phạm vi chuyên ngành đăng ký.',
] as const;

function RejectDocumentDialogContent({ isOpen, onClose, document, onSuccess }: DialogContentProps) {
  const [reason, setReason] = useState<string>('');
  const [plagiarismScoreInput, setPlagiarismScoreInput] = useState<string>(
    typeof document.latestPlagiarismScore === 'number' ? String(document.latestPlagiarismScore) : '',
  );
  const [notes, setNotes] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);

  const { isRejecting, apiError, clearApiError, reject } = useRejectModeration();

  const trimmedReason = reason.trim();
  const isReasonValid = trimmedReason.length >= 10;
  const showValidationError = touched && !isReasonValid;

  const handleApplyTemplate = (template: string) => {
    setReason(template);
    setTouched(true);
    clearApiError();
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isReasonValid || isRejecting) return;

    let scoreValue: number | undefined;
    if (plagiarismScoreInput.trim().length > 0) {
      const parsed = parseFloat(plagiarismScoreInput);
      if (!Number.isNaN(parsed)) {
        scoreValue = parsed;
      }
    }

    const trimmedNotes = notes.trim();

    await reject(
      document.fileId,
      {
        reason: trimmedReason,
        notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
        plagiarismScore: scoreValue,
      },
      {
        onSuccess: (decision, message) => {
          onSuccess?.(decision, message);
          onClose();
        },
      },
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Từ chối tài liệu nghiên cứu"
      description={`Mã tài liệu: #${document.fileId}`}
      icon={
        <div className="p-2 rounded-xl bg-rose-50 text-danger">
          <XCircle className="h-5 w-5" aria-hidden="true" />
        </div>
      }
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isRejecting}>
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            form="reject-document-form"
            variant="danger"
            size="md"
            isLoading={isRejecting}
            disabled={isRejecting || (touched && !isReasonValid)}
            iconLeft={<XCircle className="h-4 w-4" />}
          >
            Xác nhận Từ chối
          </Button>
        </div>
      }
    >
      <form id="reject-document-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Lỗi từ backend nếu có */}
        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-danger text-xs animate-in fade-in"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="leading-relaxed">{apiError}</span>
          </div>
        )}

        {/* Tóm tắt metadata tài liệu */}
        <DocumentModerationSummary document={document} />

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/70 border border-rose-200/70 text-rose-900 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-semibold text-rose-950">Lưu ý khi từ chối tài liệu</p>
            <p className="text-rose-800">
              Tài liệu sẽ được chuyển sang trạng thái <strong>Bị từ chối</strong>. Tác giả/Sinh viên sẽ nhận được thông
              báo phản hồi kèm lý do và có quyền gửi đơn <strong>Khiếu nại kiểm duyệt</strong>.
            </p>
          </div>
        </div>

        {/* Lý do từ chối (Bắt buộc) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="reject-reason-input" className="text-xs font-semibold text-text-main">
              Lý do từ chối <span className="text-danger">*</span>
            </label>
            <span className="text-[11px] text-text-muted">Tối thiểu 10 ký tự</span>
          </div>

          <Textarea
            id="reject-reason-input"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (!touched) setTouched(true);
              clearApiError();
            }}
            onBlur={() => setTouched(true)}
            placeholder="Nhập lý do từ chối chi tiết để gửi thông báo cho tác giả..."
            maxLength={500}
            showCount
            currentLength={reason.length}
            rows={3}
            error={showValidationError ? 'Vui lòng nhập lý do từ chối cụ thể với ít nhất 10 ký tự.' : undefined}
          />

          {/* Quick Reason Templates */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
              <span>Gợi ý mẫu lý do từ chối phổ biến:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {REJECT_REASON_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(template)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-md bg-background hover:bg-gray-200/60 border border-border-subtle text-text-main transition-colors select-none cursor-pointer"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Điểm trùng lặp văn bản (%) */}
        <div className="space-y-1.5">
          <label htmlFor="reject-plagiarism-input" className="text-xs font-semibold text-text-main">
            Tỷ lệ trùng lặp AI ghi nhận (%) <span className="text-text-muted font-normal">(Tùy chọn)</span>
          </label>
          <Input
            id="reject-plagiarism-input"
            type="number"
            step="0.1"
            min="0"
            max="100"
            iconLeft={<Percent className="h-4 w-4 text-text-muted" />}
            value={plagiarismScoreInput}
            onChange={(e) => setPlagiarismScoreInput(e.target.value)}
            placeholder="Ví dụ: 38.5"
            helperText="Điểm phần trăm trùng lặp nội dung được lưu vào lịch sử kiểm duyệt."
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="reject-notes-input" className="text-xs font-semibold text-text-main">
              Ghi chú bổ sung & Hướng dẫn sửa đổi <span className="text-text-muted font-normal">(Không bắt buộc)</span>
            </label>
            <span className="text-[11px] text-text-muted">Tối đa 1000 ký tự</span>
          </div>

          <Textarea
            id="reject-notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhập hướng dẫn khắc phục cụ thể cho tác giả (ví dụ: Vui lòng xem lại chương 2 và chương 3 để bổ sung trích dẫn nguồn)..."
            maxLength={1000}
            showCount
            currentLength={notes.length}
            rows={3}
          />
        </div>
      </form>
    </BaseModal>
  );
}

export function RejectDocumentDialog(props: RejectDocumentDialogProps) {
  if (!props.isOpen || !props.document) return null;

  return (
    <RejectDocumentDialogContent
      key={props.document.fileId}
      isOpen={props.isOpen}
      onClose={props.onClose}
      document={props.document}
      onSuccess={props.onSuccess}
    />
  );
}

export default RejectDocumentDialog;
