import { useRef, useState } from 'react';
import { processingService, processingErrorMessage } from '@/services/processingService';
import { processingDeployment } from '@/features/processing/utils/processingDeployment';

/** Read current server metadata before exposing a legacy decision dialog. */
export function useLegacyDecisionGuard() {
  const pending = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (fileId: string, open: () => void) => {
    if (pending.current || !processingDeployment().legacyManualDecisions) return;
    pending.current = true;
    setError(null);
    try {
      const state = await processingService.resourceState(fileId);
      if (
        state.fileId !== fileId ||
        state.supportsDurableProcessing !== false ||
        state.activeJob ||
        state.currentCheckId
      ) {
        setError(
          'Tài liệu này dùng quyết định tự động và quy trình khiếu nại gắn với báo cáo. Không thể duyệt hoặc từ chối thủ công tại đây.',
        );
        return;
      }
      open();
    } catch (cause) {
      setError(processingErrorMessage(cause));
    } finally {
      pending.current = false;
    }
  };
  return { run, error };
}
