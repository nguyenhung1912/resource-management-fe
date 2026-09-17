import { Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PlagiarismRiskLevel } from '../types/plagiarism-report.types';

export interface PlagiarismScoreGaugeProps {
  score: number | null | undefined;
  /** Compact mode: chỉ hiển thị badge nhỏ gọn không có mini bar. */
  compact?: boolean;
  className?: string;
}

interface ScoreTheme {
  riskLevel: PlagiarismRiskLevel;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotBg: string;
  barBg: string;
}

function getScoreTheme(score: number): ScoreTheme {
  if (score < 20) {
    return {
      riskLevel: 'safe',
      label: 'An toàn',
      badgeBg: 'bg-badge-success-bg',
      badgeText: 'text-badge-success-text',
      badgeBorder: 'border-emerald-200/50',
      dotBg: 'bg-success',
      barBg: 'bg-success',
    };
  }
  if (score <= 30) {
    return {
      riskLevel: 'warning',
      label: 'Cần lưu ý',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-warning',
      badgeBorder: 'border-orange-200/50',
      dotBg: 'bg-warning',
      barBg: 'bg-warning',
    };
  }
  return {
    riskLevel: 'danger',
    label: 'Nguy hiểm',
    badgeBg: 'bg-badge-danger-bg',
    badgeText: 'text-badge-danger-text',
    badgeBorder: 'border-rose-200/50',
    dotBg: 'bg-danger',
    barBg: 'bg-danger',
  };
}

export function PlagiarismScoreGauge({ score, compact = false, className }: PlagiarismScoreGaugeProps) {
  if (score == null) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
          'bg-gray-100 text-text-muted border border-border-subtle',
          className,
        )}
      >
        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
        Chưa quét
      </span>
    );
  }

  const theme = getScoreTheme(score);
  const clampedScore = Math.min(100, Math.max(0, score));

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border',
          theme.badgeBg,
          theme.badgeText,
          theme.badgeBorder,
          className,
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', theme.dotBg)} aria-hidden="true" />
        {score}%
      </span>
    );
  }

  return (
    <div
      className={cn('flex flex-col gap-1.5 min-w-22.5', className)}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Tỷ lệ trùng lặp: ${score}%, mức độ ${theme.label}`}
    >
      {/* Badge row */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0',
            theme.badgeBg,
            theme.badgeText,
            theme.badgeBorder,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', theme.dotBg)} aria-hidden="true" />
          {score}%
        </span>
        <span className="text-[11px] text-text-muted">{theme.label}</span>
      </div>

      {/* Mini progress bar */}
      <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden" aria-hidden="true">
        <div
          className={cn('h-full rounded-full transition-all duration-500', theme.barBg)}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
}

export default PlagiarismScoreGauge;
