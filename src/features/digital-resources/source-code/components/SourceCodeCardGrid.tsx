import type { SourceCodeItem } from '@/features/digital-resources/source-code/types/source-code.types';
import { SourceCodeCardItem } from './SourceCodeCardItem';

export interface SourceCodeCardGridProps {
  items: SourceCodeItem[];
  onSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName?: string) => void;
}

export function SourceCodeCardGrid({ items, onSelect, onDownload }: SourceCodeCardGridProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
      role="region"
      aria-label="Danh sách dự án mã nguồn dạng lưới"
    >
      {items.map((item) => (
        <SourceCodeCardItem key={item.fileId} item={item} onSelect={onSelect} onDownload={onDownload} />
      ))}
    </div>
  );
}

export default SourceCodeCardGrid;
