import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReportReasonField } from '../ReportReasonField';

describe('ReportReasonField', () => {
  it('render đúng nhãn và số ký tự ban đầu', () => {
    render(<ReportReasonField value="" onChange={vi.fn()} />);

    expect(screen.getByLabelText(/Mô tả chi tiết vi phạm/i)).toBeInTheDocument();
    expect(screen.getByText('0 / 4000 ký tự')).toBeInTheDocument();
    expect(screen.getByText(/Tối thiểu 20 ký tự/i)).toBeInTheDocument();
  });

  it('gọi onChange khi người dùng nhập văn bản', () => {
    const handleChange = vi.fn();

    render(<ReportReasonField value="" onChange={handleChange} />);

    const textarea = screen.getByRole('textbox', { name: /Mô tả chi tiết vi phạm/i });
    fireEvent.change(textarea, { target: { value: 'Tài liệu sao chép' } });

    expect(handleChange).toHaveBeenCalledWith('Tài liệu sao chép');
  });

  it('hiển thị cảnh báo số ký tự cần thêm khi dưới 20 ký tự', () => {
    render(<ReportReasonField value="Ngắn quá" onChange={vi.fn()} />);

    expect(screen.getByText(/Cần thêm 12 ký tự/i)).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi khi prop error có giá trị', () => {
    render(<ReportReasonField value="" onChange={vi.fn()} error="Nội dung báo cáo phải có ít nhất 20 ký tự." />);

    expect(screen.getByText('Nội dung báo cáo phải có ít nhất 20 ký tự.')).toBeInTheDocument();
  });
});
