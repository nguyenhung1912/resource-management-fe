import { FileCode2 } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { ResourceFileDropzone } from '@/features/resources/components/ResourceFileDropzone';

export interface SourceCodeFileSectionProps {
  file: File | null;
  error?: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export function SourceCodeFileSection({
  file,
  error,
  disabled = false,
  onFileSelect,
  onFileRemove,
}: SourceCodeFileSectionProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileCode2 className="size-4 text-primary" aria-hidden="true" />
        <Label htmlFor="source-code-file-input" className="text-sm font-semibold text-text-main">
          Tệp mã nguồn dự án <span className="text-danger">*</span>
        </Label>
      </div>
      <ResourceFileDropzone
        id="source-code-file-input"
        label="Tệp mã nguồn dự án"
        description="Chấp nhận tệp nén .zip, .rar, .7z, .tar, .gz hoặc tài liệu kỹ thuật .pdf, .docx (tối đa 50 MB)"
        accept=".zip,.rar,.7z,.tar,.gz,.pdf,.docx,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/x-7z-compressed,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        file={file}
        error={error}
        disabled={disabled}
        variant="document"
        onFileSelect={onFileSelect}
        onFileRemove={onFileRemove}
      />
    </div>
  );
}

export default SourceCodeFileSection;
