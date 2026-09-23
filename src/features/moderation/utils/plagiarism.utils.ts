import type { NormalizedMatchedChunk, PlagiarismMatchedChunk, SimilarityRiskLevel } from '../types/moderation.types';

export interface SimilarityBadgeConfig {
  variant: 'danger' | 'warning' | 'success';
  label: string;
  dotColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
}

export function getSimilarityRiskLevel(score: number): SimilarityRiskLevel {
  if (score >= 70) {
    return 'danger';
  }
  if (score >= 30) {
    return 'warning';
  }
  return 'safe';
}

export function getSimilarityBadgeConfig(level: SimilarityRiskLevel): SimilarityBadgeConfig {
  switch (level) {
    case 'danger':
      return {
        variant: 'danger',
        label: 'Nguy cơ cao',
        dotColor: 'bg-danger',
        textColor: 'text-danger',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200/70',
        barColor: 'bg-danger',
      };
    case 'warning':
      return {
        variant: 'warning',
        label: 'Cần lưu ý',
        dotColor: 'bg-warning',
        textColor: 'text-warning',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200/70',
        barColor: 'bg-warning',
      };
    case 'safe':
    default:
      return {
        variant: 'success',
        label: 'Tương đồng thấp',
        dotColor: 'bg-success',
        textColor: 'text-success',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200/70',
        barColor: 'bg-success',
      };
  }
}

/**
 * Định dạng số phần trăm tương đồng (vd: 88.5%)
 */
export function formatSimilarityPercent(val?: number | null): string {
  if (typeof val !== 'number' || Number.isNaN(val)) {
    return '0%';
  }
  const clamped = Math.max(0, Math.min(100, val));
  return `${Number(clamped.toFixed(1))}%`;
}

/**
 * Adapter chuẩn hóa một đoạn văn bản trùng lặp từ BE
 * sang NormalizedMatchedChunk an toàn, không chứa trường null/undefined.
 */
export function normalizeMatchedChunk(
  raw?: PlagiarismMatchedChunk | null,
  fallbackIndex: number = 1,
): NormalizedMatchedChunk {
  const chunkIndex = typeof raw?.chunkIndex === 'number' && raw.chunkIndex > 0 ? raw.chunkIndex : fallbackIndex;

  const sourceFileId = raw?.sourceFileId?.trim() || raw?.matchedWithFileId?.trim() || '';

  const rawFileName = raw?.sourceFileName?.trim() || raw?.matchedWithFileName?.trim() || '';
  const sourceFileName = rawFileName || (sourceFileId ? `Tài liệu #${sourceFileId}` : 'Tài liệu nguồn ẩn danh');

  let similarity = 0;
  if (typeof raw?.similarity === 'number' && !Number.isNaN(raw.similarity)) {
    similarity = Math.max(0, Math.min(100, Number(raw.similarity.toFixed(1))));
  } else if (typeof raw?.cosineSimilarity === 'number' && !Number.isNaN(raw.cosineSimilarity)) {
    similarity = Math.max(0, Math.min(100, Number((raw.cosineSimilarity * 100).toFixed(1))));
  }

  const contentSnippet = raw?.contentSnippet?.trim() || raw?.snippet?.trim() || '';

  const riskLevel = getSimilarityRiskLevel(similarity);

  return {
    chunkIndex,
    sourceFileId,
    sourceFileName,
    similarity,
    contentSnippet,
    riskLevel,
  };
}

/**
 * Chuẩn hóa một danh sách các matchedChunks từ kết quả API
 */
export function normalizeMatchedChunks(chunks?: PlagiarismMatchedChunk[] | null): NormalizedMatchedChunk[] {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }
  return chunks.map((chunk, index) => normalizeMatchedChunk(chunk, index + 1));
}
