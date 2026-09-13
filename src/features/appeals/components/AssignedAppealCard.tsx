import { Calendar, ExternalLink, Eye, FileText, Gavel, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AppealStatusBadge } from './AppealStatusBadge';
import type { AppealItemResponse } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';

export interface AssignedAppealCardProps {
  item: AppealItemResponse;
  onViewDetail: (item: AppealItemResponse) => void;
  onResolve: (item: AppealItemResponse) => void;
  className?: string;
}

export function AssignedAppealCard({ item, onViewDetail, onResolve, className }: AssignedAppealCardProps) {
  const isPending = item.status === 'Pending';

  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border-subtle p-4 shadow-xs flex flex-col gap-3 transition-colors hover:border-gray-300',
        className,
      )}
    >
      {/* Top Header: ID & Status */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-xs text-text-main">{item.appealId}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-text-muted font-medium">
            Lần {item.appealAttempt}
          </span>
        </div>
        <AppealStatusBadge status={item.status} />
      </div>

      {/* Document Info */}
      <div className="space-y-1">
        <div className="flex items-start gap-1.5">
          <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs text-text-main leading-snug">{item.fileName}</h4>
            {item.fileUrl && (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-0.5"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Xem file gốc</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Student & Date Info */}
      <div className="grid grid-cols-2 gap-2 text-[11px] bg-background/60 p-2.5 rounded-lg border border-border-subtle/60">
        <div>
          <span className="text-text-muted block">Sinh viên gửi:</span>
          <div className="flex items-center gap-1 font-medium text-text-main mt-0.5 truncate">
            <User className="h-3 w-3 text-text-muted shrink-0" aria-hidden="true" />
            <span className="truncate">{item.studentName || 'Sinh viên'}</span>
          </div>
        </div>
        <div>
          <span className="text-text-muted block">Ngày gửi:</span>
          <div className="flex items-center gap-1 text-text-main mt-0.5">
            <Calendar className="h-3 w-3 text-text-muted shrink-0" aria-hidden="true" />
            <span>{formatDateTime(item.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Explanation Preview */}
      <div className="text-xs text-text-muted line-clamp-2 bg-gray-50/50 p-2 rounded-md border border-border-subtle/40">
        {item.studentExplanation}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-subtle/60">
        {isPending && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onResolve(item)}
            iconLeft={<Gavel className="h-3.5 w-3.5" />}
            className="flex-1 text-xs h-8 font-semibold"
          >
            Giải quyết
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetail(item)}
          iconLeft={<Eye className="h-3.5 w-3.5 text-text-muted" />}
          className={cn('text-xs h-8', isPending ? 'flex-1' : 'w-full')}
        >
          Xem chi tiết
        </Button>
      </div>
    </div>
  );
}

export default AssignedAppealCard;
