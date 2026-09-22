import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Plus, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '../Button';

describe('Button component', () => {
  describe('Rendering variants', () => {
    it('renders default primary variant with electric blue styling and hover states', () => {
      render(<Button>Bắt đầu ngay</Button>);
      const button = screen.getByRole('button', { name: 'Bắt đầu ngay' });

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary', 'text-white', 'font-semibold', 'shadow-xs');
    });

    it('renders secondary variant with clean surface and border styling', () => {
      render(<Button variant="secondary">Hủy thao tác</Button>);
      const button = screen.getByRole('button', { name: 'Hủy thao tác' });

      expect(button).toHaveClass('bg-surface', 'text-text-main', 'border-border');
    });

    it('renders outline variant with electric blue border and text', () => {
      render(<Button variant="outline">Xem chi tiết</Button>);
      const button = screen.getByRole('button', { name: 'Xem chi tiết' });

      expect(button).toHaveClass('bg-transparent', 'text-primary');
    });

    it('renders soft variant with subtle electric blue accent tint', () => {
      render(<Button variant="soft">Khám phá</Button>);
      const button = screen.getByRole('button', { name: 'Khám phá' });

      expect(button).toHaveClass('bg-primary/10', 'text-primary');
    });

    it('renders danger variant with crimson red styling', () => {
      render(<Button variant="danger">Xóa tài liệu</Button>);
      const button = screen.getByRole('button', { name: 'Xóa tài liệu' });

      expect(button).toHaveClass('bg-danger', 'text-white');
    });

    it('renders danger-soft variant for subtle destructive actions', () => {
      render(<Button variant="danger-soft">Gỡ bỏ</Button>);
      const button = screen.getByRole('button', { name: 'Gỡ bỏ' });

      expect(button).toHaveClass('bg-danger/10', 'text-danger');
    });

    it('renders success variant with emerald green styling', () => {
      render(<Button variant="success">Phê duyệt</Button>);
      const button = screen.getByRole('button', { name: 'Phê duyệt' });

      expect(button).toHaveClass('bg-success', 'text-white');
    });

    it('renders success-soft variant with light green tint', () => {
      render(<Button variant="success-soft">Đã lưu</Button>);
      const button = screen.getByRole('button', { name: 'Đã lưu' });

      expect(button).toHaveClass('bg-success/10', 'text-success');
    });

    it('renders warning variant with amber orange styling', () => {
      render(<Button variant="warning">Cảnh báo</Button>);
      const button = screen.getByRole('button', { name: 'Cảnh báo' });

      expect(button).toHaveClass('bg-warning', 'text-white');
    });

    it('renders ghost variant with transparent background', () => {
      render(<Button variant="ghost">Đóng</Button>);
      const button = screen.getByRole('button', { name: 'Đóng' });

      expect(button).toHaveClass('bg-transparent', 'text-text-muted');
    });
  });

  describe('Sizes and Icon slots', () => {
    it('applies correct sizing classes for sm, md, lg, icon and icon-sm', () => {
      const { rerender } = render(<Button size="sm">Nhỏ</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8', 'text-xs');

      rerender(<Button size="md">Vừa</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10', 'text-sm');

      rerender(<Button size="lg">Lớn</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-11');

      rerender(<Button size="icon" aria-label="Icon only" />);
      expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10');

      rerender(<Button size="icon-sm" aria-label="Icon small" />);
      expect(screen.getByRole('button')).toHaveClass('h-8', 'w-8');
    });

    it('renders left and right icons correctly', () => {
      render(
        <Button
          iconLeft={<Plus data-testid="plus-icon" className="size-4" />}
          iconRight={<Trash2 data-testid="trash-icon" className="size-4" />}
        >
          Thao tác
        </Button>,
      );

      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
      expect(screen.getByText('Thao tác')).toBeInTheDocument();
    });
  });

  describe('Interactive & Loading states', () => {
    it('handles click events when enabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Bấm tôi</Button>);

      fireEvent.click(screen.getByRole('button', { name: 'Bấm tôi' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button and displays loading spinner when isLoading is true', () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick} iconLeft={<Plus data-testid="hidden-plus" />}>
          Đang xử lý
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.queryByTestId('hidden-plus')).not.toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('buttonVariants utility function', () => {
    it('generates proper class strings for custom elements', () => {
      const classNames = buttonVariants({ variant: 'primary', size: 'md' });
      expect(classNames).toContain('bg-primary');
      expect(classNames).toContain('text-white');
      expect(classNames).toContain('h-10');
    });
  });
});
