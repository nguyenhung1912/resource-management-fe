import type { CheckReport } from '../types/processing.types';

export function ReportMetadata({ report }: { report: CheckReport }) {
  const threshold = report.policy.approval_max_similarity_percent;
  const rows = [
    ['Mã báo cáo', report.summary.checkId],
    ['Hồ sơ mô hình', report.summary.modelProfileId],
    ['Phiên bản mô hình', report.modelRevision || 'Không có dữ liệu'],
    ['Bộ trích xuất', report.extractorVersion || 'Không có dữ liệu'],
    ['Quy tắc loại trừ', report.exclusionVersion || 'Không có dữ liệu'],
    [
      'Ngưỡng duyệt của báo cáo',
      typeof threshold === 'number' || typeof threshold === 'string' ? `≤ ${threshold}%` : 'Không có dữ liệu',
    ],
    ['Mốc tiếp nhận gốc', new Date(report.originalCutoffUtc).toLocaleString('vi-VN')],
  ];
  return (
    <details className="rounded-xl border border-border bg-surface p-5">
      <summary className="cursor-pointer font-semibold">Phiên bản và chính sách của lần kiểm tra</summary>
      <dl className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 sm:grid-cols-2">
            <dt className="text-text-muted">{label}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-text-muted">
        Mỗi báo cáo giữ chính sách tại thời điểm kiểm tra. Báo cáo cũ không thay đổi khi cấu hình mới được áp dụng.
      </p>
    </details>
  );
}
