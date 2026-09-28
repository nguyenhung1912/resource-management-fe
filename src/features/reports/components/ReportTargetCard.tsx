import { memo } from 'react';
import { BookOpen, FileText, MessageSquare, User, UserCheck } from 'lucide-react';
import { ReportTargetBadge } from '@/features/reports/components/ReportTargetBadge';
import type { ReportTargetContext } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface ReportTargetCardProps {
  target: ReportTargetContext;
  className?: string;
}

export const ReportTargetCard = memo(function ReportTargetCard({ target, className }: ReportTargetCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-background p-3.5 sm:p-4 text-xs space-y-3 transition-colors',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Đối tượng bị báo cáo</span>
        <ReportTargetBadge targetType={target.type} size="sm" />
      </div>

      {/* Target: Document / File */}
      {target.type === 'File' && (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-100/80 text-indigo-700 shrink-0 mt-0.5" aria-hidden="true">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-sm font-semibold text-text-main line-clamp-2 leading-snug">{target.title}</h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-muted text-xs">
              {target.authorName && (
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
                  <span>{target.authorName}</span>
                </span>
              )}
              {target.departmentName && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
                  <span>{target.departmentName}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Target: Comment */}
      {target.type === 'Comment' && (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-100/80 text-teal-700 shrink-0 mt-0.5" aria-hidden="true">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-text-main font-medium">
              <span className="font-semibold text-text-main">{target.authorName}</span>
              {target.fileTitle && (
                <span className="text-text-muted truncate">
                  trong tài liệu <span className="italic font-normal">"{target.fileTitle}"</span>
                </span>
              )}
            </div>
            <blockquote className="rounded-lg bg-surface border border-border-subtle p-2.5 text-xs text-text-main italic leading-relaxed line-clamp-3">
              "{target.content}"
            </blockquote>
          </div>
        </div>
      )}

      {/* Target: User */}
      {target.type === 'User' && (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-100/80 text-purple-700 shrink-0 mt-0.5" aria-hidden="true">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-text-main">{target.fullName}</h4>
              {target.roleName && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  {target.roleName}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-muted text-xs">
              {target.userCode && (
                <span>
                  Mã số: <span className="font-medium text-text-main">{target.userCode}</span>
                </span>
              )}
              {target.departmentName && (
                <span>
                  Khoa/Viện: <span className="text-text-main">{target.departmentName}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ReportTargetCard;
