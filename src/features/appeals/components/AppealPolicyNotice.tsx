import { Info } from 'lucide-react';

export function AppealPolicyNotice() {
  return (
    <div className="rounded-lg bg-blue-50/70 border border-blue-200/60 p-3 flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <span className="font-semibold text-text-main">Lưu ý: </span>
        Đơn giải trình sẽ được chuyển trực tiếp đến giảng viên phụ trách kiểm duyệt để xem xét lại. Mỗi tài liệu chỉ có
        giới hạn số lượt khiếu nại theo quy định của nhà trường.
      </div>
    </div>
  );
}

export default AppealPolicyNotice;
