import { CheckCircle2, Clock, History, Percent, UserCheck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { ModerationHistorySummaryDto } from '../types/moderation.types';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/cn';

export interface ModerationHistoryTimelineProps {
  history?: ModerationHistorySummaryDto[];
  className?: string;
}

export function ModerationHistoryTimeline({ history = [], className }: ModerationHistoryTimelineProps) {
  const isActionApprove = (action: string) => /approve/i.test(action);
  const isActionReject = (action: string) => /reject/i.test(action);

  return (
    <div className={cn('bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 space-y-6 shadow-xs', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle/80 pb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
          <History className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-main">Nhật ký Kiểm duyệt & Lịch sử ({history.length})</h2>
          <p className="text-xs text-text-muted">Các quyết định thẩm định và phản hồi trước đây của hội đồng</p>
        </div>
      </div>

      {/* History content */}
      {history.length === 0 ? (
        <div className="p-6 rounded-xl bg-background border border-dashed border-border-subtle text-center space-y-2">
          <div className="size-9 rounded-full bg-gray-100 text-text-muted flex items-center justify-center mx-auto">
            <History className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-semibold text-text-main">Chưa có lịch sử kiểm duyệt nào trước đó</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Đây là lần đầu tiên tài liệu này được chuyển đến hàng đợi thẩm định của giảng viên.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border-l-2 border-border-subtle ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-6">
          {history.map((item, index) => {
            const isApprove = isActionApprove(item.action);
            const isReject = isActionReject(item.action);

            return (
              <div key={item.historyId || index} className="relative group">
                {/* Node dot on timeline */}
                <div
                  className={cn(
                    'absolute -left-6.25 sm:-left-8.25 top-1 size-5 rounded-full border-2 border-surface flex items-center justify-center shadow-2xs',
                    isApprove ? 'bg-success text-white' : isReject ? 'bg-danger text-white' : 'bg-gray-400 text-white',
                  )}
                >
                  {isApprove ? (
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  ) : isReject ? (
                    <XCircle className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <div className="size-1.5 rounded-full bg-white" />
                  )}
                </div>

                {/* Event Card */}
                <div className="p-4 rounded-xl bg-background border border-border-subtle space-y-2.5 text-xs transition-colors hover:border-gray-300">
                  {/* Action & Time Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={isApprove ? 'success' : isReject ? 'danger' : 'neutral'} showDot>
                        {isApprove ? 'Phê duyệt' : isReject ? 'Từ chối' : item.action}
                      </Badge>

                      {typeof item.plagiarismScore === 'number' && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-muted bg-surface px-2 py-0.5 rounded border border-border-subtle">
                          <Percent className="h-3 w-3" aria-hidden="true" />
                          <span>Trùng lặp: {item.plagiarismScore}%</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-text-muted">
                      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                  </div>

                  {/* Moderator Info */}
                  {item.moderatorName && (
                    <div className="flex items-center gap-1.5 text-text-main font-medium">
                      <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                      <span>Kiểm duyệt viên: {item.moderatorName}</span>
                    </div>
                  )}

                  {/* Reason for rejection */}
                  {item.reason && (
                    <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/60 text-rose-950 space-y-0.5">
                      <span className="font-semibold text-rose-900 block text-[11px]">Lý do từ chối:</span>
                      <p className="leading-relaxed">{item.reason}</p>
                    </div>
                  )}

                  {/* Notes / Feedback */}
                  {item.notes && (
                    <div className="space-y-0.5 pt-0.5">
                      <span className="font-medium text-text-muted text-[11px] block">Ghi chú hướng dẫn:</span>
                      <p className="text-text-main leading-relaxed bg-surface p-2.5 rounded-lg border border-border-subtle">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ModerationHistoryTimeline;
