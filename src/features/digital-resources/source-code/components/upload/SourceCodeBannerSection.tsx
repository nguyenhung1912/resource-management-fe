import { Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { ResourceFileDropzone } from '@/features/resources/components/ResourceFileDropzone';

export interface SourceCodeBannerSectionProps {
  bannerImage: File | null;
  error?: string;
  disabled?: boolean;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
}

export function SourceCodeBannerSection({
  bannerImage,
  error,
  disabled = false,
  onImageSelect,
  onImageRemove,
}: SourceCodeBannerSectionProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-primary" aria-hidden="true" />
        <Label htmlFor="source-code-banner-input" className="text-xs font-semibold text-text-main">
          Ảnh bìa / Thumbnail dự án (Tùy chọn)
        </Label>
      </div>
      <ResourceFileDropzone
        id="source-code-banner-input"
        label="Ảnh bìa dự án"
        description="Hỗ trợ ảnh định dạng PNG, JPG hoặc WEBP (tối đa 5 MB). Ảnh sẽ hiển thị trên thẻ dự án."
        accept="image/png,image/jpeg,image/webp"
        file={bannerImage}
        error={error}
        disabled={disabled}
        variant="image"
        onFileSelect={onImageSelect}
        onFileRemove={onImageRemove}
      />
    </div>
  );
}

export default SourceCodeBannerSection;
