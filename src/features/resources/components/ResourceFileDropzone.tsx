import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { FileText, Image, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface ResourceFileDropzoneProps {
  id: string;
  label: string;
  description: string;
  accept: string;
  file: File | null;
  error?: string;
  disabled?: boolean;
  variant?: 'document' | 'image';
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceFileDropzone({
  id,
  label,
  description,
  accept,
  file,
  error,
  disabled = false,
  variant = 'document',
  onFileSelect,
  onFileRemove,
}: ResourceFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    if (!disabled && droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const Icon = variant === 'image' ? Image : UploadCloud;

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-description${error ? ` ${id}-error` : ''}`}
        className="sr-only"
        onChange={handleFileChange}
      />

      {file ? (
        <div className="flex min-h-16 items-center gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {variant === 'image' ? (
              <Image className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FileText className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-main" title={file.name}>
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label={`Xóa ${file.name}`}
            className="h-8 w-8 shrink-0"
            onClick={onFileRemove}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={() => setIsDragging(true)}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex min-h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-subtle bg-background/50 px-5 py-6 text-center transition-colors',
            isDragging && 'border-primary bg-primary/5',
            error && 'border-danger bg-red-50/50',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <Icon className="mb-3 h-9 w-9 text-primary" strokeWidth={1.8} aria-hidden="true" />
          <p className="text-sm font-medium text-text-main">
            {variant === 'image' ? 'Kéo và thả ảnh vào đây' : 'Kéo và thả tệp của bạn vào đây'}
          </p>
          <p className="my-2 text-xs text-text-muted">hoặc</p>
          <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            Chọn tệp từ máy
          </Button>
          <p id={`${id}-description`} className="mt-3 text-xs text-text-muted">
            {description}
          </p>
        </div>
      )}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs leading-tight text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
