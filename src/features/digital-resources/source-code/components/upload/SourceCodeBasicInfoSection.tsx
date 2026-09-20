import { BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

export interface SourceCodeBasicInfoSectionProps {
  fileName: string;
  fileDescription: string;
  error?: string;
  disabled?: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClearError: () => void;
}

export function SourceCodeBasicInfoSection({
  fileName,
  fileDescription,
  error,
  disabled = false,
  onNameChange,
  onDescriptionChange,
  onClearError,
}: SourceCodeBasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <BookOpen className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-text-main">Thông tin đề tài & Mã nguồn</h3>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="source-code-name" className="text-xs font-medium text-text-main">
          Tên đề tài / Dự án mã nguồn <span className="text-danger">*</span>
        </Label>
        <Input
          id="source-code-name"
          placeholder="Ví dụ: Hệ thống Quản lý Bán vé Xe buýt Thông minh"
          value={fileName}
          error={error}
          disabled={disabled}
          maxLength={255}
          onChange={(e) => {
            onNameChange(e.target.value);
            onClearError();
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="source-code-description" className="text-xs font-medium text-text-main">
          Mô tả dự án & Công nghệ sử dụng
        </Label>
        <Textarea
          id="source-code-description"
          placeholder="Mô tả tóm tắt mục tiêu dự án, cấu trúc module, kiến trúc và tech stack (React, Node.js, Spring Boot, Docker...)..."
          value={fileDescription}
          disabled={disabled}
          rows={3}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default SourceCodeBasicInfoSection;
