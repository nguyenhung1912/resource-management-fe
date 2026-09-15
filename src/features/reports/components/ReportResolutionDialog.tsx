import { useState } from 'react';
import { AlertCircle, CheckCircle2, Gavel, HelpCircle, XCircle } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useUpdateReportStatus } from '../hooks/useUpdateReportStatus';
import type { ReportItemResponse, ReportStatus } from '../types/report.types';
import { cn } from '@/utils/cn';

export interface ReportResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItemResponse | null;
  onSuccess: (updatedItem: ReportItemResponse, message: string) => void;
}

const TEMPLATES: Record<'Resolved' | 'Rejected' | 'InProgress', string[]> = {
  Resolved: [
    'Đã kiểm tra xác minh vi phạm có căn cứ. Đã thực hiện gỡ bỏ tài liệu và cảnh cáo tác giả.',
    'Bình luận chứa nội dung không phù hợp với quy chế. Đã ẩn bình luận và tạm khóa quyền bình luận.',
    'Tài khoản có hành vi gian lận và vi phạm quy định.',
  ],
  Rejected: [
    'Báo cáo không có căn cứ xác thực. Nội dung đối chiếu không vi phạm bản quyền.',
    'Minh chứng cung cấp không đủ cơ sở để kết luận vi phạm. Giữ nguyên trạng thái tài liệu.',
    'Bình luận mang tính chất trao đổi học thuật, không vi phạm tiêu chuẩn cộng đồng.',
  ],
  InProgress: [
    'Báo cáo có tính chất phức tạp, chuyển giao cho Hội đồng khoa để kiểm tra chuyên sâu.',
    'Đang yêu cầu tác giả cung cấp bản thảo gốc và tài liệu đối chiếu trước khi ra kết luận.',
  ],
};

export function ReportResolutionDialog({ isOpen, onClose, report, onSuccess }: ReportResolutionDialogProps) {
  const [selectedVerdict, setSelectedVerdict] = useState<ReportStatus>('Resolved');
  const [handlingNotes, setHandlingNotes] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);

  const { isSubmitting, error: apiError, updateStatus, clearError } = useUpdateReportStatus();

  if (!isOpen || !report) return null;

  const trimmedNotes = handlingNotes.trim();
  const isNotesValid = trimmedNotes.length >= 10;
  const showValidationError = touched && !isNotesValid;

  const handleVerdictChange = (verdict: ReportStatus) => {
    setSelectedVerdict(verdict);
    clearError();
  };

  const handleApplyTemplate = (templateText: string) => {
    setHandlingNotes(templateText);
    setTouched(true);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isNotesValid) return;

    const result = await updateStatus(report.reportId, {
      status: selectedVerdict,
      handlingNotes: trimmedNotes,
    });

    if (result) {
      const updatedItem: ReportItemResponse = result.data ?? {
        ...report,
        status: selectedVerdict,
        handlingNotes: trimmedNotes,
      };
      onSuccess(updatedItem, result.message || 'Xử lý báo cáo vi phạm thành công.');
      onClose();
    }
  };

  const currentTemplates = TEMPLATES[selectedVerdict as keyof typeof TEMPLATES] ?? [];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Xử lý báo cáo #${report.reportId}`}
      description="Đưa ra phán quyết xử lý vi phạm và lưu nhật ký căn cứ kiểm toán"
      icon={
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Gavel className="h-5 w-5" aria-hidden="true" />
        </div>
      }
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs cursor-pointer"
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="text-xs cursor-pointer"
          >
            Xác nhận
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs select-none">
        {/* API Error Banner */}
        {apiError && (
          <div
            role="alert"
            className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Target summary snippet */}
        <div className="p-3 bg-gray-50 rounded-lg border border-border space-y-1">
          <div className="text-[11px] text-text-muted">
            Đối tượng: <strong className="text-text-main">{report.targetType}</strong> ({report.targetId})
          </div>
          <div className="text-xs font-medium text-text-main">
            Vi phạm phản ánh: <span className="text-danger">{report.reportTypeName}</span>
          </div>
        </div>

        {/* Step 1: Select Verdict Option */}
        <div className="space-y-1.5">
          <label className="font-semibold text-text-main block">
            1. Chọn biện pháp xử lý <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Resolved Card */}
            <button
              type="button"
              onClick={() => handleVerdictChange('Resolved')}
              className={cn(
                'p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between select-none',
                selectedVerdict === 'Resolved'
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-border hover:border-gray-300 bg-surface',
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-xs text-emerald-800">Đã giải quyết</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-text-muted leading-tight">Chấp thuận báo cáo vi phạm.</p>
            </button>

            {/* Rejected Card */}
            <button
              type="button"
              onClick={() => handleVerdictChange('Rejected')}
              className={cn(
                'p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between select-none',
                selectedVerdict === 'Rejected'
                  ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20'
                  : 'border-border hover:border-gray-300 bg-surface',
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-xs text-rose-800">Bác bỏ báo cáo</span>
                <XCircle className="h-4 w-4 text-rose-600" />
              </div>
              <p className="text-[11px] text-text-muted leading-tight">Không đủ căn cứ vi phạm, đóng báo cáo.</p>
            </button>

            {/* InProgress Card */}
            <button
              type="button"
              onClick={() => handleVerdictChange('InProgress')}
              className={cn(
                'p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between select-none',
                selectedVerdict === 'InProgress'
                  ? 'border-primary bg-blue-50/60 ring-2 ring-primary/20'
                  : 'border-border hover:border-gray-300 bg-surface',
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-xs text-primary">Đang kiểm tra</span>
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[11px] text-text-muted leading-tight">Tiếp tục kiểm tra, xác minh thêm bằng chứng.</p>
            </button>
          </div>
        </div>

        {/* Step 2: Handling Notes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="handlingNotes" className="font-semibold text-text-main">
              2. Ghi chú & Căn cứ xử lý <span className="text-danger">*</span>
            </label>
            <span className="text-[11px] text-text-muted">{trimmedNotes.length}/10 ký tự tối thiểu</span>
          </div>

          <Textarea
            id="handlingNotes"
            value={handlingNotes}
            onChange={(e) => {
              setHandlingNotes(e.target.value);
              setTouched(true);
            }}
            placeholder="Nhập lý do chi tiết, căn cứ đối chiếu và biện pháp xử lý để lưu nhật ký kiểm toán..."
            rows={4}
            className={cn('text-xs resize-none', showValidationError && 'border-danger focus:ring-danger/20')}
          />

          {showValidationError && (
            <p className="text-[11px] text-danger">
              Ghi chú xử lý phải có độ dài tối thiểu 10 ký tự để bảo đảm tính minh bạch.
            </p>
          )}

          {/* Quick template suggestions */}
          {currentTemplates.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-text-muted">Gợi ý mẫu kết luận nhanh:</span>
              <div className="flex flex-col gap-1">
                {currentTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(template)}
                    className="text-left text-[11px] text-text-muted hover:text-primary hover:bg-primary/5 p-1.5 rounded transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                  >
                    • {template}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>
    </BaseModal>
  );
}

export default ReportResolutionDialog;
