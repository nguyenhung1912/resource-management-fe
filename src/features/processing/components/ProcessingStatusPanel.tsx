import type { ProcessingJob } from '../types/processing.types';

const labels: Record<string, string> = {
  QUEUED: 'Đang xếp hàng',
  RUNNING: 'Đang xử lý',
  WAITING_RETRY: 'Đang chờ thử lại',
  COMPLETED: 'Đã hoàn tất xử lý',
  CANCELLED: 'Đã huỷ',
  EXTRACTING: 'Đang trích xuất văn bản',
  COMPARING: 'Đang đối chiếu',
  PUBLISHING: 'Đang chuẩn bị xuất bản',
  ACTIVATING: 'Đang kích hoạt chỉ mục',
};

export function ProcessingStatusPanel({ job }: { job: ProcessingJob }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 space-y-3" aria-label="Trạng thái xử lý">
      <p role="status" className="font-semibold text-text-main">
        {labels[job.status] ?? 'Trạng thái xử lý mới'}
      </p>
      <p>
        {labels[job.stage] ?? 'Máy chủ đang xử lý tài liệu'} · Lần chạy {job.attempt}
      </p>
      {job.waitingForEarlierJob ? (
        <p>Đang chờ tài liệu trước trong hàng đợi. Thứ tự tiếp nhận được giữ nguyên.</p>
      ) : null}
      {job.requiresManualRepair ? (
        <p className="text-warning">Cần quản trị viên xử lý. Job sẽ không tự thử lại.</p>
      ) : job.nextRetryAtUtc ? (
        <p>
          Dự kiến thử lại sau {new Date(job.nextRetryAtUtc).toLocaleString('vi-VN')}. Đây không phải thời gian hoàn tất.
        </p>
      ) : null}
      {job.errorCode ? (
        <p className="text-text-muted">Mã hỗ trợ: {job.errorCode}. Lỗi kỹ thuật không phải kết luận đạo văn.</p>
      ) : null}
      {job.status === 'QUEUED' ? (
        <p className="text-text-muted">Yêu cầu đã được tiếp nhận; chưa có kết quả kiểm tra.</p>
      ) : null}
    </section>
  );
}
