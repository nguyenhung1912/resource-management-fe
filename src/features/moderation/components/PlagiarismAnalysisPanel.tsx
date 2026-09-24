import { Clock, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PlagiarismMatchedChunksTable } from './match-table/PlagiarismMatchedChunksTable';
import type { PlagiarismCheckResponse } from '../types/moderation.types';
import { APP_PATHS } from '@/constants/path';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/cn';

export interface PlagiarismAnalysisPanelProps {
  fileId: string;
  plagiarismCheck?: PlagiarismCheckResponse | null;
  isChecking?: boolean;
  onCheckPlagiarism?: () => void;
  className?: string;
}

function getScoreClassification(val: number) {
  if (val < 20) {
    return {
      variant: 'success' as const,
      label: 'Mức độ An toàn (Trùng lặp thấp)',
      textColor: 'text-success',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200/60',
      barColor: 'bg-success',
      description: 'Tỷ lệ trùng lặp nằm trong hạn mức tiêu chuẩn cho phép (< 20%).',
    };
  }
  if (val <= 30) {
    return {
      variant: 'warning' as const,
      label: 'Cần lưu ý (Trùng lặp trung bình)',
      textColor: 'text-warning',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200/60',
      barColor: 'bg-warning',
      description: 'Tỷ lệ trùng lặp từ 20% đến 30%. Kiểm duyệt viên cần đối chiếu kỹ trích dẫn.',
    };
  }
  return {
    variant: 'danger' as const,
    label: 'Vượt ngưỡng quy định (Nguy cơ cao)',
    textColor: 'text-danger',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200/60',
    barColor: 'bg-danger',
    description: 'Tỷ lệ trùng lặp vượt quá 30% quy chuẩn của nhà trường.',
  };
}

function ScoreProgressBar({ score, barColor }: { score: number; barColor: string }) {
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div
      className="space-y-1.5 pt-1"
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Thước đo tỷ lệ trùng lặp ${clampedScore}%`}
    >
      {/* Bar container */}
      <div className="relative h-2.5 w-full rounded-full bg-gray-200 overflow-visible">
        {/* Fill */}
        <div
          className={cn('h-full rounded-full transition-all duration-500 absolute left-0 top-0', barColor)}
          style={{ width: `${clampedScore}%` }}
          aria-hidden="true"
        />

        {/* Threshold marker: 20% */}
        <div className="absolute top-0 bottom-0 w-px bg-orange-400/80 z-10" style={{ left: '20%' }} aria-hidden="true">
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-orange-500 whitespace-nowrap">
            20%
          </span>
        </div>

        {/* Threshold marker: 30% */}
        <div className="absolute top-0 bottom-0 w-px bg-rose-500/80 z-10" style={{ left: '30%' }} aria-hidden="true">
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-rose-500 whitespace-nowrap">
            30%
          </span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-text-muted select-none pt-0.5">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function ChunkCountStat({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0 pt-0.5">
      <span
        className={cn('h-2 w-2 rounded-full shrink-0', count > 0 ? 'bg-primary' : 'bg-emerald-500')}
        aria-hidden="true"
      />
      <span>
        Số đoạn trùng phát hiện: <span className="font-semibold text-text-main tabular-nums">{count}</span>
        {count > 0 ? ' đoạn' : ' (Không có đoạn trùng)'}
      </span>
    </div>
  );
}

// Main Component
export function PlagiarismAnalysisPanel({
  plagiarismCheck,
  isChecking = false,
  onCheckPlagiarism,
  className,
}: PlagiarismAnalysisPanelProps) {
  const score = plagiarismCheck?.similarityScore;
  const hasScore = typeof score === 'number';
  const chunkCount = plagiarismCheck?.matchedChunks?.length ?? 0;
  const classification = hasScore ? getScoreClassification(score) : null;

  return (
    <div className={cn('bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 space-y-6 shadow-xs', className)}>
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-main">Phân tích Trùng lặp & Đạo văn AI</h2>
            <p className="text-xs text-text-muted">Đối soát văn bản với các khóa luận, đề tài và báo cáo khoa học</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Link to full report */}
          <Link
            to={APP_PATHS.PLAGIARISM_REPORTS}
            className="hidden sm:inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            title="Xem báo cáo tổng hợp"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Báo cáo toàn hệ thống</span>
          </Link>

          {hasScore && onCheckPlagiarism && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isChecking}
              disabled={isChecking}
              iconLeft={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={onCheckPlagiarism}
              className="hidden sm:inline-flex"
            >
              Quét lại
            </Button>
          )}
        </div>
      </div>

      {/* Main Score Area */}
      {!hasScore ? (
        <div className="p-6 rounded-xl bg-background border border-dashed border-border-subtle text-center space-y-3">
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-text-main">Tài liệu chưa được quét trùng lặp</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Kích hoạt phân tích để hệ thống tự động so khớp nội dung và tính toán tỷ lệ tương đồng văn bản.
            </p>
          </div>
          {onCheckPlagiarism && (
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={isChecking}
              disabled={isChecking}
              iconLeft={<Sparkles className="h-4 w-4" />}
              onClick={onCheckPlagiarism}
              className="mt-2"
            >
              Kích hoạt Quét Trùng Lặp
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Gauge card */}
          <div
            className={cn('p-5 rounded-xl border space-y-3.5', classification?.bgColor, classification?.borderColor)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Tỷ lệ tương đồng tổng thể
                </span>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className={cn('text-3xl sm:text-4xl font-bold tracking-tight', classification?.textColor)}>
                    {score}%
                  </span>
                  <Badge variant={classification?.variant ?? 'neutral'} showDot>
                    {classification?.label}
                  </Badge>
                </div>

                {/* Chunk count stat — inline bên cạnh score */}
                <ChunkCountStat count={chunkCount} />
              </div>

              {plagiarismCheck?.checkedAt && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Quét lúc: {formatDateTime(plagiarismCheck.checkedAt)}</span>
                </div>
              )}
            </div>

            {/* Progress bar with threshold markers */}
            <ScoreProgressBar score={score} barColor={classification?.barColor ?? 'bg-primary'} />

            {/* Description */}
            <p className="text-[11px] text-text-muted">{classification?.description}</p>

            {/* Mobile re-scan button */}
            {onCheckPlagiarism && (
              <div className="sm:hidden pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={isChecking}
                  disabled={isChecking}
                  iconLeft={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={onCheckPlagiarism}
                  className="w-full bg-surface"
                >
                  Quét lại
                </Button>
              </div>
            )}
          </div>

          {/* Matched Chunks Table (Bảng chi tiết các đoạn trùng lặp) */}
          <PlagiarismMatchedChunksTable matchedChunks={plagiarismCheck?.matchedChunks} />
        </div>
      )}
    </div>
  );
}

export default PlagiarismAnalysisPanel;
