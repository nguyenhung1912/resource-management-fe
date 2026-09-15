import { Clock, RefreshCw, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PlagiarismMatchedChunksList } from './PlagiarismMatchedChunksList';
import type { PlagiarismCheckResponse } from '../types/moderation.types';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/cn';

export interface PlagiarismAnalysisPanelProps {
  fileId: string;
  plagiarismCheck?: PlagiarismCheckResponse | null;
  isChecking?: boolean;
  onCheckPlagiarism?: () => void;
  className?: string;
}

export function PlagiarismAnalysisPanel({
  plagiarismCheck,
  isChecking = false,
  onCheckPlagiarism,
  className,
}: PlagiarismAnalysisPanelProps) {
  const score = plagiarismCheck?.similarityScore;
  const hasScore = typeof score === 'number';

  // phân loại mức độ trùng lặp
  const getScoreClassification = (val: number) => {
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
  };

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

        {hasScore && onCheckPlagiarism && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isChecking}
            disabled={isChecking}
            iconLeft={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={onCheckPlagiarism}
            className="hidden sm:inline-flex shrink-0"
          >
            Quét lại với AI
          </Button>
        )}
      </div>

      {/* Main Score Area */}
      {!hasScore ? (
        <div className="p-6 rounded-xl bg-background border border-dashed border-border-subtle text-center space-y-3">
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-text-main">Tài liệu chưa được quét trùng lặp AI</h3>
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
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-3xl sm:text-4xl font-bold tracking-tight', classification?.textColor)}>
                    {score}%
                  </span>
                  <Badge variant={classification?.variant ?? 'neutral'} showDot>
                    {classification?.label}
                  </Badge>
                </div>
              </div>

              {plagiarismCheck?.checkedAt && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Quét lúc: {formatDateTime(plagiarismCheck.checkedAt)}</span>
                </div>
              )}
            </div>

            {/* Visual score bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', classification?.barColor)}
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>
              <p className="text-[11px] text-text-muted">{classification?.description}</p>
            </div>

            {onCheckPlagiarism && (
              <div className="sm:hidden pt-2">
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
                  Quét lại với AI
                </Button>
              </div>
            )}
          </div>

          {/* Matched Chunks List */}
          <PlagiarismMatchedChunksList matchedChunks={plagiarismCheck?.matchedChunks} />
        </div>
      )}
    </div>
  );
}

export default PlagiarismAnalysisPanel;
