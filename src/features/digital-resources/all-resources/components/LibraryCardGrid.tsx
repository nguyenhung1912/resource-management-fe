import type { LibraryResourceItem } from '../types/all-resources.types';
import { LibraryResourceCard } from './LibraryResourceCard';

export interface LibraryCardGridProps {
  items: LibraryResourceItem[];
  onSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName?: string) => void;
  downloadingFileId?: string | null;
}

export function LibraryCardGrid({ items, onSelect, onDownload, downloadingFileId }: LibraryCardGridProps) {
  return (
    <div
      aria-label="Kệ sách tài liệu học tập"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
    >
      {items.map((item) => (
        <LibraryResourceCard
          key={item.fileId}
          item={item}
          onSelect={onSelect}
          onDownload={onDownload}
          isDownloading={downloadingFileId === item.fileId}
        />
      ))}
    </div>
  );
}

export default LibraryCardGrid;
