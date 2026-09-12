import { Calendar, Eye, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AppealStatusBadge } from './AppealStatusBadge';
import type { AppealItemResponse } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';

export interface AppealCardItemProps {
  item: AppealItemResponse;
  onViewDetail: (item: AppealItemResponse) => void;
  className?: string;
}

export function AppealCardItem({ item, onViewDetail, className }: AppealCardItemProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border-subtle p-4 shadow-xs hover:border-gray-300 transition-all duration-150 space-y-3',
        className,
      )}
    >
      {/* Header: Title & Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-main line-clamp-1 leading-snug" title={item.fileName}>
              {item.fileName}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
              <span className="font-mono">{item.appealId}</span>
              <span>•</span>
              <span>Lần {item.appealAttempt}</span>
            </div>
          </div>
        </div>
        <AppealStatusBadge status={item.status} />
      </div>

      {/* Explanation snippet */}
      <p className="text-xs text-text-muted line-clamp-2 bg-background/50 p-2.5 rounded-lg border border-border-subtle/60 leading-relaxed">
        {item.studentExplanation}
      </p>

      {/* Footer Meta & Action */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle text-[11px] text-text-muted">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <span>{formatDateTime(item.createdAt)}</span>
          </div>
          {item.assignedLecturerName && (
            <div className="hidden xs:flex items-center gap-1">
              <User className="h-3 w-3" aria-hidden="true" />
              <span className="truncate max-w-25">{item.assignedLecturerName}</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(item)}
          iconLeft={<Eye className="h-3 w-3 text-primary" />}
          className="h-7 text-xs px-2.5 rounded-lg shrink-0"
        >
          Chi tiết
        </Button>
      </div>
    </div>
  );
}

export default AppealCardItem;
