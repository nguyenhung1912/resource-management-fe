import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../Input';
import { Label } from '../Label';
import { Textarea } from '../Textarea';

describe('Label component', () => {
  it('hiển thị nội dung label và dấu hoa thị khi requiredBadge = true', () => {
    render(
      <Label requiredBadge htmlFor="test-input">
        Họ và tên
      </Label>,
    );
    expect(screen.getByText('Họ và tên')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('áp dụng class text-danger khi error = true', () => {
    const { container } = render(<Label error>Trường bị lỗi</Label>);
    expect(container.firstChild).toHaveClass('text-danger');
  });
});

describe('Input component', () => {
  it('render input cơ bản và cập nhật giá trị', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Nhập liên kết..." onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Nhập liên kết...');
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('hiển thị thông báo lỗi và aria-invalid khi có error prop', () => {
    render(<Input id="test-id" error="Đường dẫn không hợp lệ" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Đường dẫn không hợp lệ');
  });

  it('hiển thị helperText khi không có lỗi', () => {
    render(<Input helperText="Nhập link Google Drive công khai" />);
    expect(screen.getByText('Nhập link Google Drive công khai')).toBeInTheDocument();
  });
});

describe('Textarea component', () => {
  it('render textarea và hỗ trợ đếm ký tự', () => {
    render(<Textarea placeholder="Nhập nội dung giải trình..." maxLength={500} showCount value="Xin chào" readOnly />);

    expect(screen.getByPlaceholderText('Nhập nội dung giải trình...')).toBeInTheDocument();
    expect(screen.getByText('8/500')).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi khi có error prop', () => {
    render(<Textarea error="Nội dung tối thiểu 20 ký tự" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Nội dung tối thiểu 20 ký tự');
  });
});
