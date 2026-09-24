import { memo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatSimilarityPercent, getSimilarityBadgeConfig } from '../../utils/plagiarism.utils';
import type { SimilarityRiskLevel } from '../../types/moderation.types';
import { cn } from '@/utils/cn';

export interface SimilarityScoreCellProps {
  similarity: number;
  riskLevel: SimilarityRiskLevel;
  className?: string;
  showMeter?: boolean;
}

export const SimilarityScoreCell = memo(function SimilarityScoreCell({
  similarity,
  riskLevel,
  className,
  showMeter = true,
}: SimilarityScoreCellProps) {
  const config = getSimilarityBadgeConfig(riskLevel);
  const formattedScore = formatSimilarityPercent(similarity);
  const clampedSimilarity = Math.max(0, Math.min(100, similarity));

  return (
    <div className={cn('flex flex-col gap-1.5 min-w-[120px]', className)}>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-xs tabular-nums text-text-main">{formattedScore}</span>
        <Badge variant={config.variant} showDot>
          {config.label}
        </Badge>
      </div>

      {showMeter && (
        <div
          className="relative h-1.5 w-full max-w-[110px] rounded-full bg-gray-200/90 overflow-hidden"
          role="meter"
          aria-valuenow={clampedSimilarity}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Mức độ tương đồng ${formattedScore}`}
        >
          <div
            className={cn('h-full rounded-full transition-all duration-300', config.barColor)}
            style={{ width: `${clampedSimilarity}%` }}
          />
        </div>
      )}
    </div>
  );
});

export default SimilarityScoreCell;
