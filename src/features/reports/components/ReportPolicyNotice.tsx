import { memo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ReportPolicyNoticeProps {
  className?: string;
}

export const ReportPolicyNotice = memo(function ReportPolicyNotice({ className }: ReportPolicyNoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        'rounded-xl bg-amber-50/70 border border-amber-200/70 p-3 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed animate-in fade-in',
        className,
      )}
    >
      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
      <div className="space-y-0.5 min-w-0">
        <p className="font-semibold text-amber-950">Quy định về việc gửi báo cáo vi phạm:</p>
        <p className="text-[11px] text-amber-800">
          Báo cáo sẽ được chuyển đến Giảng viên và Ban Quản trị kiểm duyệt xem xét. Mọi hành vi cố tình báo cáo sai sự
          thật hoặc quấy rối sẽ bị xử lý kỷ luật theo nội quy của Nhà trường.
        </p>
      </div>
    </div>
  );
});

export default ReportPolicyNotice;
