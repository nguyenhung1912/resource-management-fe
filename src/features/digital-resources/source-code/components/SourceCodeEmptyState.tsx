import { FolderCode, RotateCcw } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';

export interface SourceCodeEmptyStateProps {
  onResetFilters?: () => void;
}

export function SourceCodeEmptyState({ onResetFilters }: SourceCodeEmptyStateProps) {
  return (
    <EmptyState
      icon={FolderCode}
      iconBg="bg-primary/10 text-primary"
      title="Không tìm thấy dự án mã nguồn nào"
      description="Không có mã nguồn nào khớp với từ khóa tìm kiếm hoặc các điều kiện lọc hiện tại. Vui lòng thử lại với từ khóa khác."
      action={
        onResetFilters ? (
          <Button type="button" variant="outline" size="md" onClick={onResetFilters}>
            <RotateCcw className="size-4 mr-1.5" aria-hidden="true" />
            Đặt lại bộ lọc
          </Button>
        ) : undefined
      }
    />
  );
}

export default SourceCodeEmptyState;
