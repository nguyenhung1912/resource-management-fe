import { Loader2 } from 'lucide-react';

export function PageLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-100 w-full py-16" role="status">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="text-xs text-text-muted">Đang tải trang...</span>
      </div>
    </div>
  );
}

export default PageLoadingState;
