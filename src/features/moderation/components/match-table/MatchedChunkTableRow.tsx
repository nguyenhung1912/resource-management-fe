import { memo } from 'react';
import { TableCell, TableRow } from '@/components/ui/Table';
import { SimilarityScoreCell } from './SimilarityScoreCell';
import { SourceFileLinkCell } from './SourceFileLinkCell';
import { SnippetContentCell } from './SnippetContentCell';
import type { NormalizedMatchedChunk } from '../../types/moderation.types';
import { cn } from '@/utils/cn';

export interface MatchedChunkTableRowProps {
  chunk: NormalizedMatchedChunk;
  className?: string;
}

export const MatchedChunkTableRow = memo(function MatchedChunkTableRow({
  chunk,
  className,
}: MatchedChunkTableRowProps) {
  return (
    <TableRow
      className={cn('hover:bg-background/80 transition-colors align-top border-b border-border-subtle/80', className)}
    >
      {/* Chunk Index */}
      <TableCell className="px-4 py-3.5 align-top whitespace-nowrap">
        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-surface border border-border-subtle text-text-main">
          Đoạn #{chunk.chunkIndex}
        </span>
      </TableCell>

      {/* Similarity Score & Meter */}
      <TableCell className="px-4 py-3.5 align-top">
        <SimilarityScoreCell similarity={chunk.similarity} riskLevel={chunk.riskLevel} />
      </TableCell>

      {/* Source Document Link & Actions */}
      <TableCell className="px-4 py-3.5 align-top">
        <SourceFileLinkCell sourceFileId={chunk.sourceFileId} sourceFileName={chunk.sourceFileName} />
      </TableCell>

      {/* Content Snippet */}
      <TableCell className="px-4 py-3.5 align-top">
        <SnippetContentCell contentSnippet={chunk.contentSnippet} chunkIndex={chunk.chunkIndex} />
      </TableCell>
    </TableRow>
  );
});

export default MatchedChunkTableRow;
