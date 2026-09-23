import { memo, useCallback, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SnippetContentCellProps {
  contentSnippet: string;
  chunkIndex?: number;
  className?: string;
  defaultExpanded?: boolean;
}

const SNIPPET_CHAR_LIMIT = 120;

export const SnippetContentCell = memo(function SnippetContentCell({
  contentSnippet,
  chunkIndex,
  className,
  defaultExpanded = false,
}: SnippetContentCellProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const snippet = contentSnippet?.trim() ?? '';
  const isLong = snippet.length > SNIPPET_CHAR_LIMIT;

  const handleCopy = useCallback(async () => {
    if (!snippet) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        // Fallback for environments where clipboard API might be unavailable
        const textarea = document.createElement('textarea');
        textarea.value = snippet;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  }, [snippet]);

  if (!snippet) {
    return (
      <span className={cn('text-[11px] text-text-muted italic select-none', className)}>
        Không có đoạn văn bản trích dẫn hiển thị.
      </span>
    );
  }

  return (
    <div className={cn('space-y-1.5 max-w-xl group/snippet', className)}>
      <div className="relative">
        <div
          className={cn(
            'p-2.5 rounded-lg bg-surface border border-border-subtle font-mono text-[11px] leading-relaxed text-text-main transition-colors select-text',
            !isExpanded && isLong && 'line-clamp-2 max-h-16 overflow-hidden',
            isExpanded && 'whitespace-pre-wrap',
          )}
        >
          {snippet}
        </div>

        {/* Copy button in top-right of cell */}
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'absolute top-1.5 right-1.5 p-1 rounded-md bg-surface/90 hover:bg-neutral-100 text-text-muted hover:text-text-main border border-border-subtle/80 shadow-2xs transition-all',
            isCopied && 'text-success bg-emerald-50 border-emerald-200',
          )}
          title={isCopied ? 'Đã sao chép đoạn trích' : 'Sao chép đoạn trích vào bộ nhớ tạm'}
          aria-label={chunkIndex ? `Sao chép đoạn trích #${chunkIndex}` : 'Sao chép đoạn trích vào bộ nhớ tạm'}
        >
          {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer select-none"
        >
          <span>{isExpanded ? 'Thu gọn đoạn trích' : 'Xem toàn bộ đoạn trích'}</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
});

export default SnippetContentCell;
