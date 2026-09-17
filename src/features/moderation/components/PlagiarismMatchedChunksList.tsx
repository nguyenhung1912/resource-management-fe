import { useMemo, useState } from 'react';
import { ArrowUpDown, FileText, Search, ShieldCheck, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { PlagiarismMatchedChunk } from '../types/moderation.types';
import { cn } from '@/utils/cn';

export type ChunkSortOption = 'similarity-desc' | 'similarity-asc' | 'chunk-index';

export interface PlagiarismMatchedChunksListProps {
  matchedChunks?: PlagiarismMatchedChunk[];
  className?: string;
}

const EMPTY_CHUNKS: PlagiarismMatchedChunk[] = [];

export function PlagiarismMatchedChunksList({ matchedChunks, className }: PlagiarismMatchedChunksListProps) {
  const chunks = matchedChunks ?? EMPTY_CHUNKS;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<ChunkSortOption>('similarity-desc');

  const processedChunks = useMemo(() => {
    let result = [...chunks];

    // search by keyword
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      result = result.filter((chunk) => {
        const snippetMatch = chunk.contentSnippet?.toLowerCase().includes(query) ?? false;
        const sourceMatch = chunk.sourceFileName?.toLowerCase().includes(query) ?? false;
        const idMatch = chunk.sourceFileId?.toLowerCase().includes(query) ?? false;
        return snippetMatch || sourceMatch || idMatch;
      });
    }

    result.sort((a, b) => {
      if (sortOption === 'similarity-desc') {
        return (b.similarity ?? 0) - (a.similarity ?? 0);
      }
      if (sortOption === 'similarity-asc') {
        return (a.similarity ?? 0) - (b.similarity ?? 0);
      }
      // 'chunk-index'
      return (a.chunkIndex ?? 0) - (b.chunkIndex ?? 0);
    });

    return result;
  }, [chunks, searchTerm, sortOption]);

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
    <div className={cn('space-y-3.5', className)}>
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle/80 pb-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Chi tiết các đoạn trùng lặp ({chunks.length})
          </h4>
          <p className="text-[11px] text-text-muted mt-0.5">
            Hiển thị {processedChunks.length} / {chunks.length} đoạn được phát hiện
          </p>
        </div>

        {/* Toolbar: Search input & Sort selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative flex items-center min-w-45 sm:min-w-55">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm trong đoạn trích / nguồn..."
              className="w-full h-8 pl-8 pr-7 text-xs bg-surface border border-border-subtle rounded-lg text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              aria-label="Tìm kiếm trong các đoạn trùng lặp"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 text-text-muted hover:text-text-main p-0.5"
                title="Xóa tìm kiếm"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Sort option */}
          <div className="relative flex items-center">
            <ArrowUpDown
              className="absolute left-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as ChunkSortOption)}
              className="h-8 pl-8 pr-7 text-xs bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors appearance-none"
              aria-label="Sắp xếp danh sách đoạn trùng"
            >
              <option value="similarity-desc">Trùng cao nhất</option>
              <option value="similarity-asc">Trùng thấp nhất</option>
              <option value="chunk-index">Thứ tự đoạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* List content or empty search result */}
      {processedChunks.length === 0 ? (
        <div className="p-6 rounded-xl bg-background border border-dashed border-border-subtle text-center space-y-2">
          <p className="text-xs text-text-muted">
            Không tìm thấy đoạn trùng lặp nào khớp với từ khóa{' '}
            <span className="font-semibold text-text-main">"{searchTerm}"</span>.
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-xs font-semibold text-primary hover:underline inline-block"
          >
            Đặt lại tìm kiếm
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {processedChunks.map((chunk, index) => {
            const chunkNum = chunk.chunkIndex ?? index + 1;
            const similarity = chunk.similarity ?? 0;
            const badgeVariant = similarity >= 80 ? 'danger' : similarity >= 50 ? 'warning' : 'neutral';
            const borderAccentClass =
              similarity >= 80 ? 'border-l-danger' : similarity >= 50 ? 'border-l-warning' : 'border-l-primary/70';

            return (
              <div
                key={chunk.chunkIndex ?? index}
                className="p-3.5 rounded-xl bg-background border border-border-subtle space-y-2.5 text-xs transition-colors hover:border-gray-300 shadow-2xs"
              >
                {/* Header chunk info */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-surface border border-border-subtle text-text-main shrink-0">
                      Đoạn #{chunkNum}
                    </span>

                    <div className="flex items-center gap-1.5 min-w-0 text-text-main">
                      <FileText className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
                      <span className="font-medium truncate max-w-xs sm:max-w-md" title={chunk.sourceFileName}>
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
                  <div
                    className={cn(
                      'p-3 rounded-lg bg-surface border-l-4 border border-border-subtle font-mono text-[11px] sm:text-xs text-text-main leading-relaxed whitespace-pre-wrap',
                      borderAccentClass,
                    )}
                  >
                    {chunk.contentSnippet}
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted italic">Không có trích đoạn văn bản hiển thị.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlagiarismMatchedChunksList;
