import { AlertTriangle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { RejectedResourceContext } from '@/features/appeals/types/appeal.types';

export interface AppealResourceBannerProps {
  resource: RejectedResourceContext;
}

export function AppealResourceBanner({ resource }: AppealResourceBannerProps) {
  return (
    <div className="rounded-xl bg-orange-50/70 border border-orange-200/70 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-white border border-orange-200/60 text-warning shrink-0 mt-0.5 shadow-2xs">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs text-text-muted">
              <span className="font-mono">Mã: {resource.fileId}</span>
              {resource.fileTypeName && (
                <span className="px-2 py-0.5 rounded-md bg-white/80 border border-orange-200/50">
                  {resource.fileTypeName}
                </span>
              )}
            </div>
            <h4
              title={resource.fileName}
              className="text-sm font-semibold text-text-main leading-snug mt-1 wrap-break-word line-clamp-2"
            >
              {resource.fileName}
            </h4>
          </div>
        </div>

        <Badge variant="danger" showDot className="shrink-0">
          Bị từ chối
        </Badge>
      </div>

      <div className="rounded-lg bg-white/90 border border-orange-200/60 p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-danger">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Lý do từ chối của giảng viên:</span>
        </div>
        <p className="text-xs text-text-main italic pl-5 wrap-break-word leading-relaxed">
          "{resource.rejectionReason?.trim() || 'Giảng viên không để lại ghi chú chi tiết.'}"
        </p>
      </div>
    </div>
  );
}

export default AppealResourceBanner;
