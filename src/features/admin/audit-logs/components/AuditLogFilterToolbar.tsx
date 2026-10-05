import type { FormEvent } from 'react';
import { useState } from 'react';
import { Calendar, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AUDIT_ACTION_MAP, AUDIT_LOG_STATUS } from '../types/audit-log.types';

export interface AuditLogFilterToolbarProps {
  search?: string;
  action?: string;
  status?: number;
  fromDate?: string;
  toDate?: string;
  onSearchChange: (search?: string) => void;
  onActionChange: (action?: string) => void;
  onStatusChange: (status?: number) => void;
  onDateChange: (fromDate?: string, toDate?: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export function AuditLogFilterToolbar({
  search = '',
  action = '',
  status,
  fromDate = '',
  toDate = '',
  onSearchChange,
  onActionChange,
  onStatusChange,
  onDateChange,
  onReset,
  hasActiveFilters,
  className,
}: AuditLogFilterToolbarProps) {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchChange(searchInput.trim() || undefined);
  };

  const handleActionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onActionChange(event.target.value || undefined);
  };

  const handleStatusSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const val = event.target.value;
    onStatusChange(val === '' ? undefined : Number(val));
  };

  const handleFromDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(event.target.value || undefined, toDate || undefined);
  };

  const handleToDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(fromDate || undefined, event.target.value || undefined);
  };

  return (
    <div className={`space-y-4 ${className ?? ''}`} data-testid="audit-log-filter-toolbar">
      {/* Hàng 1: Tìm kiếm chính và nút Đặt lại */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 max-w-md">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            iconLeft={<Search className="size-4" />}
            placeholder="Tìm theo tài khoản, thao tác hoặc mô tả..."
            aria-label="Tìm kiếm nhật ký"
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            Tìm
          </Button>
        </form>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            iconLeft={<RotateCcw className="size-3.5" />}
            onClick={() => {
              setSearchInput('');
              onReset();
            }}
            className="text-text-muted hover:text-text self-start sm:self-auto shrink-0"
          >
            Đặt lại bộ lọc
          </Button>
        )}
      </div>

      {/* Hàng 2: Bộ lọc chi tiết theo Thao tác, Trạng thái và Khoảng ngày */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bộ lọc Hành động */}
        <Select value={action} onChange={handleActionSelect} aria-label="Lọc theo hành động">
          <option value="">Tất cả hành động</option>
          {Object.entries(AUDIT_ACTION_MAP).map(([key, meta]) => (
            <option key={key} value={key}>
              [{meta.categoryLabel}] {meta.label}
            </option>
          ))}
        </Select>

        {/* Bộ lọc Trạng thái */}
        <Select
          value={status === undefined ? '' : String(status)}
          onChange={handleStatusSelect}
          aria-label="Lọc theo trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          <option value={String(AUDIT_LOG_STATUS.SUCCESS)}>Thành công</option>
          <option value={String(AUDIT_LOG_STATUS.WARNING)}>Cảnh báo</option>
          <option value={String(AUDIT_LOG_STATUS.FAILED)}>Thất bại</option>
        </Select>

        {/* Bộ lọc Từ ngày */}
        <Input
          type="date"
          value={fromDate}
          onChange={handleFromDateChange}
          iconLeft={<Calendar className="size-4" />}
          aria-label="Từ ngày"
          title="Từ ngày"
        />

        {/* Bộ lọc Đến ngày */}
        <Input
          type="date"
          value={toDate}
          onChange={handleToDateChange}
          iconLeft={<Calendar className="size-4" />}
          aria-label="Đến ngày"
          title="Đến ngày"
        />
      </div>
    </div>
  );
}

export default AuditLogFilterToolbar;
