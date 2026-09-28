import { memo, useDeferredValue, useMemo, useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { MatchedChunksToolbar, type ChunkSortOption } from './MatchedChunksToolbar';
import { MatchedChunkTableRow } from './MatchedChunkTableRow';
import { MatchedChunkMobileCard } from './MatchedChunkMobileCard';
import { MatchedChunksEmptyState } from './MatchedChunksEmptyState';
import { normalizeMatchedChunks } from '../../utils/plagiarism.utils';
import type { NormalizedMatchedChunk, PlagiarismMatchedChunk, SimilarityRiskLevel } from '../../types/moderation.types';
import { cn } from '@/utils/cn';

export interface PlagiarismMatchedChunksTableProps {
  matchedChunks?: (PlagiarismMatchedChunk | NormalizedMatchedChunk)[];
  className?: string;
  defaultSort?: ChunkSortOption;
}

export const PlagiarismMatchedChunksTable = memo(function PlagiarismMatchedChunksTable({
  matchedChunks,
  className,
  defaultSort = 'similarity-desc',
}: PlagiarismMatchedChunksTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeRiskFilter, setActiveRiskFilter] = useState<'all' | SimilarityRiskLevel>('all');
  const [sortOption, setSortOption] = useState<ChunkSortOption>(defaultSort);

  // useDeferredValue để việc nhập từ khóa tìm kiếm không chặn render luồng chính
  const deferredSearch = useDeferredValue(searchTerm);

  // Chuẩn hóa toàn bộ dữ liệu đầu vào
  const allNormalizedChunks = useMemo(() => {
    return normalizeMatchedChunks(matchedChunks);
  }, [matchedChunks]);

  // Thống kê số lượng theo cấp độ nguy cơ
  const riskCounts = useMemo(() => {
    let danger = 0;
    let warning = 0;
    let safe = 0;

    for (const chunk of allNormalizedChunks) {
      if (chunk.riskLevel === 'danger') danger += 1;
      else if (chunk.riskLevel === 'warning') warning += 1;
      else safe += 1;
    }

    return { danger, warning, safe };
  }, [allNormalizedChunks]);

  // Lọc và sắp xếp
  const processedChunks = useMemo(() => {
    let result = [...allNormalizedChunks];

    // Lọc theo cấp độ nguy cơ
    if (activeRiskFilter !== 'all') {
      result = result.filter((c) => c.riskLevel === activeRiskFilter);
    }

    // Lọc theo từ khóa tìm kiếm (trích đoạn, tên file, hoặc ID file)
    const query = deferredSearch.trim().toLowerCase();
    if (query) {
      result = result.filter((chunk) => {
        const snippetMatch = chunk.contentSnippet.toLowerCase().includes(query);
        const nameMatch = chunk.sourceFileName.toLowerCase().includes(query);
        const idMatch = chunk.sourceFileId.toLowerCase().includes(query);
        return snippetMatch || nameMatch || idMatch;
      });
    }

    // Sắp xếp
    result.sort((a, b) => {
      if (sortOption === 'similarity-desc') {
        return b.similarity - a.similarity;
      }
      if (sortOption === 'similarity-asc') {
        return a.similarity - b.similarity;
      }
      return a.chunkIndex - b.chunkIndex;
    });

    return result;
  }, [allNormalizedChunks, activeRiskFilter, deferredSearch, sortOption]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveRiskFilter('all');
    setSortOption('similarity-desc');
  };

  // Trường hợp tài liệu hoàn toàn sạch, không có đoạn trùng lặp nào
  if (allNormalizedChunks.length === 0) {
    return <MatchedChunksEmptyState type="no-matches" className={className} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar bộ lọc & tìm kiếm */}
      <MatchedChunksToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeRiskFilter={activeRiskFilter}
        onRiskFilterChange={setActiveRiskFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        totalCount={allNormalizedChunks.length}
        filteredCount={processedChunks.length}
        riskCounts={riskCounts}
      />

      {/* Hiển thị kết quả lọc rỗng */}
      {processedChunks.length === 0 ? (
        <MatchedChunksEmptyState type="filter-empty" searchTerm={searchTerm} onResetFilters={handleResetFilters} />
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block rounded-2xl border border-border-subtle bg-surface overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <Table aria-label="Bảng chi tiết các đoạn văn bản trùng lặp">
                <TableHeader>
                  <TableRow className="border-b border-border-subtle bg-background select-none">
                    <TableHead className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Đoạn
                    </TableHead>
                    <TableHead className="w-44 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Độ tương đồng
                    </TableHead>
                    <TableHead className="w-64 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Tài liệu nguồn gốc
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Đoạn trích đối soát
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border-subtle bg-surface">
                  {processedChunks.map((chunk) => (
                    <MatchedChunkTableRow key={chunk.chunkIndex} chunk={chunk} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card Fallback View (< 768px) */}
          <div className="md:hidden space-y-3">
            {processedChunks.map((chunk) => (
              <MatchedChunkMobileCard key={chunk.chunkIndex} chunk={chunk} />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default PlagiarismMatchedChunksTable;
