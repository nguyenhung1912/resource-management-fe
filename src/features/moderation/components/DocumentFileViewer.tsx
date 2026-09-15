import { useState } from 'react';
import { Download, ExternalLink, FileQuestion, FileText, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface DocumentFileViewerProps {
  fileUrl?: string;
  fileName: string;
  fileId: string;
  className?: string;
}

export function DocumentFileViewer({ fileUrl, fileName, fileId, className }: DocumentFileViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const downloadUrl = fileUrl || `/api/Resources/${encodeURIComponent(fileId)}/download`;

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-xs flex flex-col transition-all duration-200',
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : 'relative',
        className,
      )}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-surface border border-border-subtle text-primary shrink-0">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-text-main truncate max-w-xs sm:max-w-md" title={fileName}>
              {fileName}
            </h3>
            <span className="text-[11px] text-text-muted">Định dạng xem trước trực tuyến</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-medium text-text-muted hover:text-text-main hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none"
              title="Mở tài liệu trong tab mới"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Mở tab mới</span>
            </a>
          )}

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-medium text-text-muted hover:text-text-main hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none"
            title="Tải tệp tin về máy tính"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Tải về</span>
          </a>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 px-2 text-text-muted hover:text-text-main"
            aria-label={isFullscreen ? 'Thu nhỏ cửa sổ xem' : 'Xem toàn màn hình'}
            title={isFullscreen ? 'Thu nhỏ cửa sổ xem' : 'Xem toàn màn hình'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Viewer Canvas */}
      <div className={cn('relative w-full bg-gray-100 flex-1', isFullscreen ? 'h-full' : 'h-145')}>
        {fileUrl ? (
          <iframe
            src={fileUrl}
            title={`Trình xem tài liệu: ${fileName}`}
            className="w-full h-full border-0 bg-surface"
            loading="lazy"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-background">
            <div className="p-3 rounded-full bg-surface border border-border-subtle text-text-muted">
              <FileQuestion className="h-8 w-8" aria-hidden="true" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="text-sm font-semibold text-text-main">Không thể hiển thị xem trước trực tiếp</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Tài liệu chưa có đường dẫn xem trước trực tuyến khả dụng. Bạn có thể tải tệp tin gốc để kiểm tra trên
                thiết bị cá nhân.
              </p>
            </div>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={fileName}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline bg-surface px-3.5 py-2 rounded-lg border border-border-subtle shadow-xs transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tải tài liệu gốc về máy</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentFileViewer;
