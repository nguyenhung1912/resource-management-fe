import { useState } from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

// Kiểu dữ liệu cho filter
export type DocumentType = 'thesis' | 'lecture' | 'source' | 'report' | 'other';

export interface Filters {
  types: DocumentType[];
  department?: string;
  formats: string[];
  dateFrom?: string;
  dateTo?: string;
  timeframe?: 'latest' | 'week' | 'month' | 'range';
}

export interface SearchFilterPanelProps {
  initial?: Partial<Filters>;
  onApply?: (filters: Filters) => void;
  onClear?: () => void;
}

/**
 * SearchFilterPanel
 * - Panel lọc tài nguyên.
 */
export function SearchFilterPanel({ initial, onApply, onClear }: SearchFilterPanelProps) {
  // Khởi tạo state cho các bộ lọc
  const [types, setTypes] = useState<DocumentType[]>(initial?.types ?? []);
  const [department, setDepartment] = useState<string | undefined>(initial?.department);
  const [formats, setFormats] = useState<string[]>(initial?.formats ?? []);
  const [dateFrom, setDateFrom] = useState<string | undefined>(initial?.dateFrom);
  const [dateTo, setDateTo] = useState<string | undefined>(initial?.dateTo);
  const [timeframe, setTimeframe] = useState<Filters['timeframe']>(initial?.timeframe ?? 'latest');

  // Danh sách loại tài liệu mẫu
  const docTypes: { key: DocumentType; label: string }[] = [
    { key: 'thesis', label: 'Khóa luận' },
    { key: 'lecture', label: 'Bài giảng' },
    { key: 'source', label: 'Mã nguồn' },
    { key: 'report', label: 'Báo cáo' },
    { key: 'other', label: 'Khác' },
  ];

  // Các định dạng tệp
  const fileFormats = ['PDF', 'DOCX', 'PPTX'];

  // Hàm toggle cho checkbox loại tài liệu
  const toggleType = (t: DocumentType) => {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  // Hàm toggle cho chips định dạng file
  const toggleFormat = (f: string) => {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  // Hàm cập nhật mốc thời gian
  const handleTimeframeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeframe(e.target.value as Filters['timeframe']);
  };

  // Áp dụng bộ lọc
  const handleApply = () => {
    const payload: Filters = {
      types,
      department,
      formats,
      dateFrom,
      dateTo,
      timeframe,
    };
    onApply?.(payload);
  };

  // Xóa bộ lọc về mặc định
  const handleClear = () => {
    setTypes([]);
    setDepartment(undefined);
    setFormats([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setTimeframe('latest');
    onClear?.();
  };

  return (
    <aside className={cn('w-full max-w-xs flex flex-col bg-surface border border-border rounded-xl p-4')}>
      {/* Header với tiêu đề và icon filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="size-5 text-primary" strokeWidth={2} aria-hidden="true" />
        <h3 className="text-sm font-semibold text-text-main">Bộ lọc</h3>
      </div>

      {/* Nội dung filter */}
      <div className="flex flex-col gap-5">
        {/* Nhóm 1 - Loại tài liệu */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Loại tài liệu</Label>
          <div className="flex flex-col gap-2.5">
            {docTypes.map((d) => (
              <label key={d.key} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={types.includes(d.key)}
                  onChange={() => toggleType(d.key)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-main hover:text-primary transition-colors">{d.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nhóm 2 - Khoa / Chuyên ngành */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Khoa / Chuyên ngành</Label>
          <Input
            placeholder="Chọn khoa hoặc nhập tên..."
            value={department ?? ''}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        {/* Nhóm 3 - Định dạng tệp (Chips) */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Định dạng tệp</Label>
          <div className="flex flex-wrap gap-2">
            {fileFormats.map((f) => {
              const active = formats.includes(f);
              return (
                <Button
                  key={f}
                  type="button"
                  size="sm"
                  variant={active ? 'primary' : 'secondary'}
                  className={cn('rounded-full px-3 py-1 text-xs', active ? 'shadow-sm' : '')}
                  onClick={() => toggleFormat(f)}
                >
                  {f}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Nhóm 4 - Mốc thời gian */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Mốc thời gian</Label>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-2.5">
              {[
                { value: 'latest', label: 'Mới nhất' },
                { value: 'week', label: 'Trong tuần' },
                { value: 'month', label: 'Trong tháng' },
                { value: 'range', label: 'Chọn khoảng' },
              ].map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="timeframe"
                    value={option.value}
                    checked={timeframe === option.value}
                    onChange={handleTimeframeChange}
                    className="size-4 border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-main hover:text-primary transition-colors">{option.label}</span>
                </label>
              ))}
            </div>

            {/* Nếu chọn range thì hiển thị 2 input date */}
            {timeframe === 'range' && (
              <div className="mt-2 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 text-xs text-text-muted">Từ:</span>
                  <Input
                    type="date"
                    value={dateFrom ?? ''}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-xs text-text-muted">Đến:</span>
                  <Input
                    type="date"
                    value={dateTo ?? ''}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer với 2 nút luôn nằm dưới cùng */}
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <Button className="flex-1 font-semibold" onClick={handleApply}>
          Áp dụng
        </Button>
        <Button variant="outline" className="flex-1 font-semibold" onClick={handleClear}>
          Xóa
        </Button>
      </div>
    </aside>
  );
}

export default SearchFilterPanel;
