import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BaseModal } from '../BaseModal';

describe('BaseModal', () => {
  it('không hiển thị khi isOpen = false', () => {
    render(
      <BaseModal isOpen={false} onClose={vi.fn()}>
        <div>Nội dung modal</div>
      </BaseModal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hiển thị tiêu đề, mô tả và nội dung khi isOpen = true', () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Tiêu đề kiểm thử" description="Mô tả kiểm thử">
        <div>Nội dung modal</div>
      </BaseModal>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Tiêu đề kiểm thử')).toBeInTheDocument();
    expect(screen.getByText('Mô tả kiểm thử')).toBeInTheDocument();
    expect(screen.getByText('Nội dung modal')).toBeInTheDocument();
  });

  it('gọi onClose khi click vào nút Đóng', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose} title="Tiêu đề">
        <div>Nội dung</div>
      </BaseModal>,
    );

    const closeButton = screen.getByRole('button', { name: /đóng/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi onClose khi nhấn phím Escape', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose}>
        <div>Nội dung</div>
      </BaseModal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi onClose khi click vào backdrop', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose}>
        <div>Nội dung</div>
      </BaseModal>,
    );

    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('không gọi onClose khi click vào bên trong dialog container', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose}>
        <div>Nội dung bên trong</div>
      </BaseModal>,
    );

    const insideContent = screen.getByText('Nội dung bên trong');
    fireEvent.click(insideContent);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('hiển thị footer khi được cung cấp', () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} footer={<button type="button">Xác nhận</button>}>
        <div>Nội dung</div>
      </BaseModal>,
    );

    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeInTheDocument();
  });

  it('giữ phím Tab bên trong dialog theo cả hai chiều', () => {
    render(
      <BaseModal isOpen onClose={vi.fn()} footer={<button type="button">Xác nhận</button>}>
        <button type="button">Nội dung</button>
      </BaseModal>,
    );

    const closeButton = screen.getByRole('button', { name: 'Đóng' });
    const confirmButton = screen.getByRole('button', { name: 'Xác nhận' });

    confirmButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(confirmButton).toHaveFocus();
  });

  it('đưa focus vào dialog khi mở và trả lại phần tử trước đó khi đóng', () => {
    const { rerender } = render(
      <>
        <button type="button">Mở dialog</button>
        <BaseModal isOpen={false} onClose={vi.fn()}>
          <button type="button">Nội dung</button>
        </BaseModal>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Mở dialog' });
    trigger.focus();

    rerender(
      <>
        <button type="button">Mở dialog</button>
        <BaseModal isOpen onClose={vi.fn()}>
          <button type="button">Nội dung</button>
        </BaseModal>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Đóng' })).toHaveFocus();

    rerender(
      <>
        <button type="button">Mở dialog</button>
        <BaseModal isOpen={false} onClose={vi.fn()}>
          <button type="button">Nội dung</button>
        </BaseModal>
      </>,
    );
    expect(trigger).toHaveFocus();
  });
});
