import type { ChangeEvent } from 'react';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

export const MIN_REASON_LENGTH = 20;
export const MAX_REASON_LENGTH = 4000;

export interface ReportReasonFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

export function ReportReasonField({ value, onChange, onBlur, error, disabled = false }: ReportReasonFieldProps) {
  const trimmedLength = value.trim().length;
  const isTooShort = trimmedLength > 0 && trimmedLength < MIN_REASON_LENGTH;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="report-reason" requiredBadge error={Boolean(error)}>
          Mô tả chi tiết vi phạm
        </Label>
        <span
          className={`text-[11px] tabular-nums font-medium ${
            value.length > MAX_REASON_LENGTH
              ? 'text-danger font-semibold'
              : isTooShort
                ? 'text-warning'
                : 'text-text-muted'
          }`}
        >
          {value.length} / {MAX_REASON_LENGTH} ký tự
        </span>
      </div>

      <Textarea
        id="report-reason"
        placeholder="Mô tả cụ thể hành vi vi phạm, thời gian, vị trí đoạn văn bản sao chép, tài liệu gốc hoặc các dẫn chứng cụ thể khác..."
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={4}
        maxLength={MAX_REASON_LENGTH}
        disabled={disabled}
        error={error}
        className="resize-none text-xs leading-relaxed"
      />

      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>Tối thiểu {MIN_REASON_LENGTH} ký tự để Ban kiểm duyệt có đủ cơ sở xử lý.</span>
        {isTooShort && (
          <span className="text-warning font-medium animate-in fade-in">
            (Cần thêm {MIN_REASON_LENGTH - trimmedLength} ký tự)
          </span>
        )}
      </div>
    </div>
  );
}

export default ReportReasonField;
