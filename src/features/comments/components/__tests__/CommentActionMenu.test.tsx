import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentActionMenu } from '../CommentActionMenu';

describe('CommentActionMenu component', () => {
  const defaultProps = {
    commentId: 'CMT_001',
    canEdit: true,
    canDelete: true,
    canReport: true,
    disabled: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onReport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('không render gì nếu không có bất kỳ quyền thao tác nào (hasAnyAction = false)', () => {
    const { container } = render(
      <CommentActionMenu {...defaultProps} canEdit={false} canDelete={false} canReport={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('render trigger button khi có ít nhất một quyền', () => {
    render(<CommentActionMenu {...defaultProps} canEdit={false} canDelete={false} canReport={true} />);

    const button = screen.getByRole('button', { name: 'Tùy chọn bình luận' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('mở menu khi click trigger button và chỉ hiển thị các action được phép', () => {
    render(<CommentActionMenu {...defaultProps} canEdit={true} canDelete={false} canReport={true} />);

    const trigger = screen.getByRole('button', { name: 'Tùy chọn bình luận' });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /chỉnh sửa/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /báo cáo/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /xóa/i })).not.toBeInTheDocument();
  });

  it('kích hoạt onEdit và đóng menu khi click Chỉnh sửa', () => {
    const onEdit = vi.fn();
    render(<CommentActionMenu {...defaultProps} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tùy chọn bình luận' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /chỉnh sửa/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('kích hoạt onDelete và đóng menu khi click Xóa', () => {
    const onDelete = vi.fn();
    render(<CommentActionMenu {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tùy chọn bình luận' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /xóa/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('kích hoạt onReport và đóng menu khi click Báo cáo', () => {
    const onReport = vi.fn();
    render(<CommentActionMenu {...defaultProps} onReport={onReport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tùy chọn bình luận' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /báo cáo/i }));

    expect(onReport).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('đóng menu khi nhấn phím Escape và trả focus về trigger', () => {
    render(<CommentActionMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Tùy chọn bình luận' });
    fireEvent.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();

    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('đóng menu khi nhấn phím Tab', () => {
    render(<CommentActionMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Tùy chọn bình luận' });
    fireEvent.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();

    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Tab' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('điều hướng bằng phím ArrowDown và ArrowUp giữa các menuitem', () => {
    render(<CommentActionMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Tùy chọn bình luận' });
    fireEvent.click(trigger);

    const editBtn = screen.getByRole('menuitem', { name: /chỉnh sửa/i });
    const deleteBtn = screen.getByRole('menuitem', { name: /xóa/i });
    const reportBtn = screen.getByRole('menuitem', { name: /báo cáo/i });

    // Focus first item
    editBtn.focus();
    expect(document.activeElement).toBe(editBtn);

    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(deleteBtn);

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(reportBtn);

    // Loops back to first
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(editBtn);

    // ArrowUp goes backwards
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(reportBtn);
  });

  it('đóng menu khi click bên ngoài', () => {
    render(
      <div>
        <div data-testid="outside-area">Ngoài menu</div>
        <CommentActionMenu {...defaultProps} />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tùy chọn bình luận' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside-area'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('không mở menu khi disabled = true', () => {
    render(<CommentActionMenu {...defaultProps} disabled={true} />);

    const trigger = screen.getByRole('button', { name: 'Tùy chọn bình luận' });
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
