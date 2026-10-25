import { useCallback, useSyncExternalStore } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { processingTracker } from '../hooks/processingTracker';
import { ProcessingStatusPanel } from '../components/ProcessingStatusPanel';
import type { ProcessingJob } from '../types/processing.types';

export default function ProcessingJobPage() {
  const initial = useLoaderData() as ProcessingJob;
  const subscribe = useCallback(
    (listener: () => void) => processingTracker.subscribe(initial.jobId, listener),
    [initial.jobId],
  );
  const snapshot = useCallback(() => processingTracker.snapshot(initial.jobId), [initial.jobId]);
  const state = useSyncExternalStore(subscribe, snapshot);
  const job = state?.job;
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Theo dõi xử lý tài liệu</h1>
      {job ? (
        <ProcessingStatusPanel job={job} />
      ) : (
        <p role="alert">{state?.error ?? 'Không còn trạng thái trong phiên hiện tại.'}</p>
      )}
      <Button variant="secondary" onClick={() => void processingTracker.refresh(initial.jobId)}>
        Làm mới trạng thái
      </Button>
      <Link className="text-primary underline block" to={APP_PATHS.RESOURCES_MANAGER}>
        Quay lại tài liệu của tôi
      </Link>
      <p className="text-text-muted">
        Trạng thái xử lý và trạng thái duyệt tài liệu được theo dõi riêng. Không gửi lại yêu cầu chỉ vì kết nối bị ngắt.
      </p>
    </main>
  );
}
