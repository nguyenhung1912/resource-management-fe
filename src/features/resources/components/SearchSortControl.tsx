import React from 'react';
import { ArrowUpDown } from 'lucide-react';

// Các khóa sắp xếp hợp lệ
export type SortKey = 'latest' | 'oldest' | 'views_desc' | 'title_asc';

export interface SearchSortControlProps {
  currentSort: SortKey;
  onSortChange: (value: SortKey) => void;
}

// Thành phần điều khiển sắp xếp cho danh sách tài nguyên
export default function SearchSortControl({ currentSort, onSortChange }: SearchSortControlProps) {
  const options: { value: SortKey; label: string }[] = [
    { value: 'latest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'views_desc', label: 'Xem nhiều nhất' },
    { value: 'title_asc', label: 'Tên A-Z' },
  ];

  // Xử lý khi người dùng đổi lựa chọn
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SortKey;
    onSortChange(val);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Nhãn mô tả */}
      <span className="text-sm text-text-muted">Sắp xếp theo:</span>

      {/* Icon chỉ báo sắp xếp */}
      <ArrowUpDown className="text-text-muted" size={16} />

      {/* Select native được styled bằng Tailwind với semantic tokens */}
      <select
        aria-label="Chọn cách sắp xếp"
        value={currentSort}
        onChange={handleChange}
        className="rounded-lg border border-border px-3 py-2 bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-text-main">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
