import axios from 'axios';
import axiosClient from './axiosClient';
import type {
  CheckReport,
  CheckSummary,
  ProcessingDiagnostics,
  ProcessingJob,
} from '@/features/processing/types/processing.types';

const checksPath = (fileId: string) => `/api/resources/${encodeURIComponent(fileId)}/plagiarism-checks`;
const reportPath = (fileId: string, checkId: string) => `${checksPath(fileId)}/${encodeURIComponent(checkId)}`;

function jobEnvelope(value: { data: ProcessingJob }): ProcessingJob {
  if (!value?.data || typeof value.data.jobId !== 'string' || typeof value.data.status !== 'string') {
    throw new Error('Invalid processing job response');
  }
  return value.data;
}

export const processingService = {
  async getJob(jobId: string, signal?: AbortSignal): Promise<ProcessingJob> {
    return jobEnvelope(
      (await axiosClient.get<{ data: ProcessingJob }>(`/api/processing-jobs/${encodeURIComponent(jobId)}`, { signal }))
        .data,
    );
  },
  async requestCheck(fileId: string, key: string, reviewer = false): Promise<ProcessingJob> {
    const path = reviewer ? `/api/Moderation/${encodeURIComponent(fileId)}/check-plagiarism` : checksPath(fileId);
    return jobEnvelope(
      (await axiosClient.post<{ data: ProcessingJob }>(path, null, { headers: { 'Idempotency-Key': key } })).data,
    );
  },
  async history(fileId: string, page = 1, signal?: AbortSignal): Promise<CheckSummary[]> {
    const result = (await axiosClient.get<CheckSummary[]>(checksPath(fileId), { params: { page, size: 20 }, signal }))
      .data;
    if (!Array.isArray(result)) throw new Error('Invalid report history response');
    return result;
  },
  async report(fileId: string, checkId: string, signal?: AbortSignal): Promise<CheckReport> {
    const result = (await axiosClient.get<CheckReport>(reportPath(fileId, checkId), { signal })).data;
    if (!result?.summary || result.summary.checkId !== checkId || !Array.isArray(result.sources))
      throw new Error('Invalid report response');
    return result;
  },
  async preview(fileId: string, checkId: string, side: string, signal?: AbortSignal): Promise<Blob> {
    return (
      await axiosClient.get<Blob>(`${reportPath(fileId, checkId)}/previews/${encodeURIComponent(side)}`, {
        responseType: 'blob',
        signal,
      })
    ).data;
  },
  async diagnostics(signal?: AbortSignal): Promise<ProcessingDiagnostics> {
    return (await axiosClient.get<ProcessingDiagnostics>('/api/processing/diagnostics', { signal })).data;
  },
  async operate(
    kind: 'jobs' | 'outbox' | 'publications',
    id: string,
    action: 'retry' | 'cancel' | 'repair',
    reason: string,
  ): Promise<unknown> {
    return (await axiosClient.post<unknown>(`/api/processing/${kind}/${encodeURIComponent(id)}/${action}`, { reason }))
      .data;
  },
  async reconcile(reason: string): Promise<unknown> {
    return (await axiosClient.post<unknown>('/api/processing/reconcile', { reason })).data;
  },
};

const publicErrors: Record<string, string> = {
  LEGACY_RECEPTION_UNVERIFIED: 'Tài liệu cũ cần được quản trị viên xác minh thời điểm tiếp nhận.',
  CONTENT_REVISION_UNVERIFIED: 'Tài liệu cần được xác minh phiên bản trước khi kiểm tra.',
  MANUAL_REPAIR_REQUIRED: 'Cần quản trị viên xử lý trước khi tiếp tục.',
  PUBLICATION_RECOVERY_REQUIRED: 'Quyết định đã được ghi nhận. Cần phục hồi job hiện tại thay vì huỷ.',
  JOB_NOT_WAITING_FOR_REPAIR: 'Trạng thái job đã thay đổi. Hãy tải lại trước khi thao tác.',
};

export function processingErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ code?: string }>(error)) {
    const code = error.response?.data?.code;
    if (code && publicErrors[code]) return publicErrors[code];
    if (error.response?.status === 401) return 'Phiên đăng nhập đã hết hạn.';
    if (error.response?.status === 403 || error.response?.status === 404)
      return 'Không tìm thấy dữ liệu hoặc bạn không còn quyền truy cập.';
    if (error.response?.status === 409) return 'Dữ liệu đã thay đổi. Hãy tải lại trước khi thao tác.';
  }
  return 'Chưa thể tải dữ liệu xử lý. Hãy kiểm tra kết nối và thử lại.';
}
