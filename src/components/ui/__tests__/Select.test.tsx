import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '../Select';

const sampleOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'pending', label: 'Chờ duyệt', disabled: true },
];

describe('Select component', () => {
  it('render thẻ select với options được truyền vào', () => {
    render(<Select options={sampleOptions} aria-label="Bộ lọc" defaultValue="all" />);

    const select = screen.getByRole('combobox', { name: 'Bộ lọc' });
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Tất cả trạng thái')).toBeInTheDocument();
    expect(screen.getByText('Đã duyệt')).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeDisabled();
  });

  it('gọi hàm onChange khi người dùng chọn option khác', () => {
    const handleChange = vi.fn();
    render(<Select options={sampleOptions} aria-label="Bộ lọc" onChange={handleChange} />);

    const select = screen.getByRole('combobox', { name: 'Bộ lọc' });
    fireEvent.change(select, { target: { value: 'approved' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('hiển thị nhãn label khi có prop label', () => {
    render(<Select id="major-select" label="Chuyên ngành" options={sampleOptions} />);

    expect(screen.getByLabelText('Chuyên ngành')).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi và gắn cờ aria-invalid khi có prop error', () => {
    render(<Select id="type-select" error="Vui lòng chọn loại tài nguyên" options={sampleOptions} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng chọn loại tài nguyên');
  });

  it('hiển thị helperText khi không có lỗi', () => {
    render(<Select helperText="Chọn danh mục phù hợp nhất" options={sampleOptions} />);

    expect(screen.getByText('Chọn danh mục phù hợp nhất')).toBeInTheDocument();
  });

  it('hỗ trợ trạng thái disabled', () => {
    render(<Select disabled options={sampleOptions} aria-label="Khóa" />);

    const select = screen.getByRole('combobox', { name: 'Khóa' });
    expect(select).toBeDisabled();
  });
});
