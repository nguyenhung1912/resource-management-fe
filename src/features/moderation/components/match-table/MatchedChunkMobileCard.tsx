import { memo } from 'react';
import { SimilarityScoreCell } from './SimilarityScoreCell';
import { SourceFileLinkCell } from './SourceFileLinkCell';
import { SnippetContentCell } from './SnippetContentCell';
import type { NormalizedMatchedChunk } from '../../types/moderation.types';
import { cn } from '@/utils/cn';

export interface MatchedChunkMobileCardProps {
  chunk: NormalizedMatchedChunk;
  className?: string;
}

export const MatchedChunkMobileCard = memo(function MatchedChunkMobileCard({
  chunk,
  className,
}: MatchedChunkMobileCardProps) {
  return (
    <div
      className={cn(
        'p-3.5 rounded-xl bg-surface border border-border-subtle shadow-2xs space-y-3 transition-colors hover:border-gray-300',
        className,
      )}
    >
      {/* Header: Chunk # + Similarity Score */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle/60 pb-2.5">
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-background border border-border-subtle text-text-main">
          Đoạn #{chunk.chunkIndex}
        </span>

        <SimilarityScoreCell similarity={chunk.similarity} riskLevel={chunk.riskLevel} showMeter={false} />
      </div>

      {/* Source File */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
          Tài liệu nguồn
        </span>
        <SourceFileLinkCell sourceFileId={chunk.sourceFileId} sourceFileName={chunk.sourceFileName} />
      </div>

      {/* Snippet */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
          Đoạn trích dẫn
        </span>
        <SnippetContentCell contentSnippet={chunk.contentSnippet} chunkIndex={chunk.chunkIndex} />
      </div>
    </div>
  );
});

export default MatchedChunkMobileCard;
