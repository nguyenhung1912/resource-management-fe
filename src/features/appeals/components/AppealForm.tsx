import { useState, type FormEvent } from 'react';
import { AlertCircle, Link as LinkIcon, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

const MIN_EXPLANATION_LENGTH = 20;
const MAX_EXPLANATION_LENGTH = 2000;
const URL_PATTERN = /^https?:\/\/.+/i;

export interface AppealFormData {
  studentExplanation: string;
  attachmentUrl?: string | null;
}

export interface AppealFormProps {
  isSubmitting: boolean;
  apiError: string | null;
  onSubmit: (data: AppealFormData) => void;
  onCancel: () => void;
}

export function AppealForm({ isSubmitting, apiError, onSubmit, onCancel }: AppealFormProps) {
  const [studentExplanation, setStudentExplanation] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [touched, setTouched] = useState({
    explanation: false,
    attachmentUrl: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Derived validation
  const explanationTrimmed = studentExplanation.trim();
  const trimmedUrl = attachmentUrl.trim();

  const isExplanationTooShort =
    (touched.explanation || isSubmitted) && explanationTrimmed.length < MIN_EXPLANATION_LENGTH;
  const isExplanationTooLong = studentExplanation.length > MAX_EXPLANATION_LENGTH;
  const isUrlInvalid = (touched.attachmentUrl || isSubmitted) && Boolean(trimmedUrl) && !URL_PATTERN.test(trimmedUrl);

  const explanationError = isExplanationTooShort
    ? explanationTrimmed.length === 0
      ? 'Vui lòng nhập nội dung giải trình.'
      : `Nội dung giải trình phải có ít nhất ${MIN_EXPLANATION_LENGTH} ký tự (hiện có ${explanationTrimmed.length}).`
    : isExplanationTooLong
      ? `Nội dung giải trình không được vượt quá ${MAX_EXPLANATION_LENGTH} ký tự.`
      : undefined;

  const urlError = isUrlInvalid
    ? 'Đường dẫn minh chứng phải là một URL hợp lệ (bắt đầu bằng http:// hoặc https://).'
    : undefined;

  const isFormValid =
    explanationTrimmed.length >= MIN_EXPLANATION_LENGTH &&
    studentExplanation.length <= MAX_EXPLANATION_LENGTH &&
    (!trimmedUrl || URL_PATTERN.test(trimmedUrl));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    if (!isFormValid || isSubmitting) return;

    onSubmit({
      studentExplanation: explanationTrimmed,
      attachmentUrl: trimmedUrl ? trimmedUrl : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Backend API Error Banner */}
      {apiError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs text-danger leading-relaxed animate-in fade-in"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <span className="font-semibold">Không thể gửi giải trình: </span>
            {apiError}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="appeal-explanation" requiredBadge error={Boolean(explanationError)}>
          Nội dung giải trình / khiếu nại
        </Label>
        <Textarea
          id="appeal-explanation"
          placeholder="Nêu rõ lý do, các luận cứ hoặc trích dẫn để giải trình về nội dung bị từ chối kiểm duyệt..."
          value={studentExplanation}
          onChange={(e) => setStudentExplanation(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, explanation: true }))}
          maxLength={MAX_EXPLANATION_LENGTH}
          showCount
          disabled={isSubmitting}
          error={explanationError}
          helperText={
            !explanationError
              ? `Tối thiểu ${MIN_EXPLANATION_LENGTH} ký tự để đảm bảo tính rõ ràng cho người kiểm duyệt.`
              : undefined
          }
          className="min-h-28"
        />
      </div>

      {/* Field Link */}
      <div className="space-y-1.5">
        <Label htmlFor="appeal-attachment-url" error={Boolean(urlError)}>
          Liên kết tài liệu minh chứng (Không bắt buộc)
        </Label>
        <Input
          id="appeal-attachment-url"
          type="url"
          placeholder="https://drive.google.com/... hoặc https://..."
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, attachmentUrl: true }))}
          disabled={isSubmitting}
          iconLeft={<LinkIcon className="h-4 w-4" />}
          error={urlError}
          helperText={
            !urlError
              ? 'Dán liên kết tài liệu đối chiếu (Google Drive, OneDrive, Dropbox, hoặc PDF trực tuyến).'
              : undefined
          }
        />
      </div>

      {/* Form Action Buttons */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          iconLeft={<Send className="h-4 w-4" />}
        >
          Gửi giải trình
        </Button>
      </div>
    </form>
  );
}

export default AppealForm;
