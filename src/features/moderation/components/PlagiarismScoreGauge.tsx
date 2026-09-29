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
  dotBg: string;
}

function getScoreTheme(score: number): ScoreTheme {
  if (score < 20) {
    return {
      riskLevel: 'safe',
      label: 'An toàn',
      dotBg: 'bg-emerald-500',
    };
  }
  if (score <= 30) {
    return {
      riskLevel: 'warning',
      label: 'Cần lưu ý',
      dotBg: 'bg-amber-500',
    };
  }
  return {
    riskLevel: 'danger',
    label: 'Nguy hiểm',
    dotBg: 'bg-rose-500',
  };
}

export function PlagiarismScoreGauge({ score, compact = false, className }: PlagiarismScoreGaugeProps) {
  if (score == null) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs text-text-muted select-none', className)}>
        <Clock className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />
        <span>Chưa quét</span>
      </span>
    );
  }

  const theme = getScoreTheme(score);
  const clampedScore = Math.min(100, Math.max(0, score));

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-text-main font-medium select-none', className)}>
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', theme.dotBg)} aria-hidden="true" />
        <span>{score}%</span>
      </span>
    );
  }

  return (
    <div
      className={cn('inline-flex items-center gap-1.5 text-xs select-none', className)}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Tỷ lệ trùng lặp: ${score}%, mức độ ${theme.label}`}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', theme.dotBg)} aria-hidden="true" />
      <span className="font-medium text-text-main">{score}%</span>
      <span className="text-text-muted text-[11px]">•</span>
      <span className="text-text-muted text-xs">{theme.label}</span>
    </div>
  );
}

export default PlagiarismScoreGauge;
