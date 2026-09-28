import { useState, type SubmitEvent } from 'react';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { DocumentModerationSummary } from './DocumentModerationSummary';
import { useApproveModeration } from '../hooks/useApproveModeration';
import type { ModerationDecisionResponse, ModerationTargetDocument } from '../types/moderation.types';

export interface ApproveDocumentDialogProps {
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

const APPROVE_TEMPLATES = [
  'Tài liệu đạt yêu cầu chuẩn, tỷ lệ trùng lặp trong ngưỡng cho phép.',
  'Nội dung chất lượng tốt, đầy đủ cấu trúc nghiên cứu và trích dẫn chuẩn.',
  'Đã đối chiếu minh chứng, chấp thuận phê duyệt và công khai tài liệu.',
] as const;

function ApproveDocumentDialogContent({ isOpen, onClose, document, onSuccess }: DialogContentProps) {
  const [notes, setNotes] = useState<string>('');
  const { isApproving, apiError, clearApiError, approve } = useApproveModeration();

  const handleApplyTemplate = (template: string) => {
    setNotes(template);
    clearApiError();
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (isApproving) return;

    const trimmedNotes = notes.trim();
    await approve(
      document.fileId,
      {
        notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
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
      title="Phê duyệt tài liệu"
      description={`Mã tài liệu: #${document.fileId}`}
      icon={
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </div>
      }
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isApproving}>
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            form="approve-document-form"
            variant="success"
            size="md"
            isLoading={isApproving}
            disabled={isApproving}
            iconLeft={<CheckCircle2 className="h-4 w-4" />}
          >
            Xác nhận Phê duyệt
          </Button>
        </div>
      }
    >
      <form id="approve-document-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
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

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-900 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-semibold text-emerald-950">Xác nhận công khai tài liệu</p>
            <p className="text-emerald-800">
              Tài liệu sẽ được chuyển sang trạng thái <strong>Đã duyệt (Approved)</strong> và được công khai trên toàn
              hệ thống để sinh viên và giảng viên tra cứu, tải về.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="approve-notes-input" className="text-xs font-semibold text-text-main">
              Ghi chú phê duyệt <span className="text-text-muted font-normal">(Không bắt buộc)</span>
            </label>
            <span className="text-[11px] text-text-muted">Tối đa 500 ký tự</span>
          </div>

          <Textarea
            id="approve-notes-input"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              clearApiError();
            }}
            placeholder="Nhập ghi chú hoặc lời nhận xét dành cho tài liệu (ví dụ: Tài liệu đạt yêu cầu chuẩn NCKH)..."
            maxLength={500}
            showCount
            currentLength={notes.length}
            rows={3}
          />

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
              <span>Gợi ý mẫu nhận xét nhanh:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {APPROVE_TEMPLATES.map((template, idx) => (
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
      </form>
    </BaseModal>
  );
}

export function ApproveDocumentDialog(props: ApproveDocumentDialogProps) {
  if (!props.isOpen || !props.document) return null;

  return (
    <ApproveDocumentDialogContent
      key={props.document.fileId}
      isOpen={props.isOpen}
      onClose={props.onClose}
      document={props.document}
      onSuccess={props.onSuccess}
    />
  );
}

export default ApproveDocumentDialog;
