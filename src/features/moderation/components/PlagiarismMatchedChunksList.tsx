import { FileText, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { PlagiarismMatchedChunk } from '../types/moderation.types';
import { cn } from '@/utils/cn';

export interface PlagiarismMatchedChunksListProps {
  matchedChunks?: PlagiarismMatchedChunk[];
  className?: string;
}

export function PlagiarismMatchedChunksList({ matchedChunks, className }: PlagiarismMatchedChunksListProps) {
  const chunks = matchedChunks ?? [];

  if (chunks.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 text-xs',
          className,
        )}
      >
        <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-emerald-900">Không phát hiện đoạn văn bản trùng lặp đáng kể</p>
          <p className="text-emerald-800 leading-relaxed">
            Hệ thống AI không tìm thấy đoạn trích nào trùng khớp vượt ngưỡng cảnh báo trong kho dữ liệu tài nguyên học
            thuật.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Chi tiết các đoạn trùng lặp ({chunks.length})
        </h4>
        <span className="text-[11px] text-text-muted">So sánh đối chiếu kho học thuật</span>
      </div>

      <div className="space-y-2.5">
        {chunks.map((chunk, index) => {
          const chunkNum = chunk.chunkIndex ?? index + 1;
          const similarity = chunk.similarity ?? 0;
          const badgeVariant = similarity >= 80 ? 'danger' : similarity >= 50 ? 'warning' : 'neutral';

          return (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-background border border-border-subtle space-y-2.5 text-xs transition-colors hover:border-gray-300"
            >
              {/* Header chunk info */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-surface border border-border-subtle text-text-main shrink-0">
                    Đoạn #{chunkNum}
                  </span>

                  <div className="flex items-center gap-1.5 min-w-0 text-text-main">
                    <FileText className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
                    <span className="font-medium truncate max-w-xs sm:max-w-sm" title={chunk.sourceFileName}>
                      {chunk.sourceFileName || chunk.sourceFileId || 'Tài liệu nguồn ẩn danh'}
                    </span>
                  </div>
                </div>

                <Badge variant={badgeVariant} showDot>
                  Trùng lặp {similarity}%
                </Badge>
              </div>

              {/* Content snippet */}
              {chunk.contentSnippet ? (
                <div className="p-3 rounded-lg bg-surface border-l-4 border-l-primary/70 border border-border-subtle font-mono text-[11px] sm:text-xs text-text-main leading-relaxed whitespace-pre-wrap">
                  {chunk.contentSnippet}
                </div>
              ) : (
                <p className="text-[11px] text-text-muted italic">Không có trích đoạn văn bản hiển thị.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlagiarismMatchedChunksList;
