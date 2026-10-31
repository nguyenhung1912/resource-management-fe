import { Link, useLoaderData, useRevalidator } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { Button } from '@/components/ui/Button';
import { ProcessingStatusPanel } from '../components/ProcessingStatusPanel';
import type { ResourceProcessingState } from '../types/processing.types';

export default function ProcessingResourcePage() {
  const state = useLoaderData() as ResourceProcessingState;
  const revalidator = useRevalidator();
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Xử lý và báo cáo tài liệu</h1>
      <p>
        Trạng thái tài liệu: <strong>{state.businessStatus}</strong>
      </p>
      <p>Chỉ mục: {state.publicationReadiness ?? 'Chưa có thông tin sẵn sàng'}</p>
      {state.activeJob ? (
        <>
          <ProcessingStatusPanel job={state.activeJob} />
          <Link className="text-primary underline" to={APP_PATHS.PROCESSING_JOB(state.activeJob.jobId)}>
            Theo dõi job đang hoạt động
          </Link>
        </>
      ) : (
        <p>Không có job đang hoạt động.</p>
      )}
      {!state.supportsDurableProcessing ? (
        <p>Tài liệu cũ cần xác minh dữ liệu tiếp nhận trước khi kiểm tra tự động.</p>
      ) : null}
      <Button variant="secondary" disabled={revalidator.state !== 'idle'} onClick={() => void revalidator.revalidate()}>
        Làm mới
      </Button>
      <Link className="text-primary underline block" to={APP_PATHS.RESOURCES_MANAGER}>
        Tài liệu của tôi
      </Link>
    </main>
  );
}
