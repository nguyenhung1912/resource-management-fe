import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { CommentForm } from '../CommentForm';

const authenticatedState = {
  user: {
    uid: 'USR_001',
    userCode: 'student01',
    fullName: 'Lê Văn C',
    email: 'levanc@example.com',
    roleId: 2,
    role: 'Student',
  },
  token: 'valid-token',
  expiration: '2099-12-31T23:59:59Z',
  isAuthenticated: true,
  isLoading: false,
};

const unauthenticatedState = {
  user: null,
  token: null,
  expiration: null,
  isAuthenticated: false,
  isLoading: false,
};

describe('CommentForm component', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
    vi.clearAllMocks();
  });

  it('hiển thị form bình luận gốc khi người dùng đã đăng nhập', () => {
    render(
      <MemoryRouter>
        <CommentForm onSubmit={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Lê Văn C')).toBeInTheDocument();
    expect(screen.getByText('Sinh viên')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bình luận/i })).toBeDisabled();
    expect(screen.getByText('0/4000')).toBeInTheDocument();
  });

  it('cập nhật bộ đếm ký tự và mở khóa nút submit khi gõ nội dung', () => {
    render(
      <MemoryRouter>
        <CommentForm onSubmit={vi.fn()} />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/viết bình luận/i);
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Tài liệu rất hay!' } });
    });

    expect(screen.getByText('17/4000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bình luận/i })).toBeEnabled();
  });

  it('gọi onSubmit với nội dung đã trim và xóa text sau khi gửi thành công ở mode root', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(true);

    render(
      <MemoryRouter>
        <CommentForm onSubmit={handleSubmit} />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/viết bình luận/i);
    act(() => {
      fireEvent.change(textarea, { target: { value: '   Nội dung có khoảng trắng   ' } });
    });

    const submitBtn = screen.getByRole('button', { name: /bình luận/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(handleSubmit).toHaveBeenCalledWith('Nội dung có khoảng trắng');
    expect(textarea).toHaveValue('');
  });

  it('hỗ trợ phím Enter để submit form tự động', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(true);

    render(
      <MemoryRouter>
        <CommentForm onSubmit={handleSubmit} />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/viết bình luận/i);
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Bình luận qua Enter' } });
    });

    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    });

    expect(handleSubmit).toHaveBeenCalledWith('Bình luận qua Enter');
  });

  it('cho phép Shift + Enter để xuống hàng mà không submit form', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(true);

    render(
      <MemoryRouter>
        <CommentForm onSubmit={handleSubmit} />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/viết bình luận/i);
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Dòng 1' } });
    });

    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('không hiển thị văn bản hướng dẫn phím tắt trên giao diện', () => {
    render(
      <MemoryRouter>
        <CommentForm onSubmit={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/nhấn/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ctrl/i)).not.toBeInTheDocument();
  });

  it('hiển thị ở chế độ reply với chỉ báo tác giả và nút Hủy', () => {
    const handleCancel = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <MemoryRouter>
        <CommentForm mode="reply" parentAuthorName="TS. Nguyễn Văn A" onCancel={handleCancel} onSubmit={handleSubmit} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/đang trả lời/i)).toBeInTheDocument();
    expect(screen.getByText('@TS. Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^trả lời$/i })).toBeInTheDocument();

    const cancelButtons = screen.getAllByRole('button', { name: /hủy/i });
    expect(cancelButtons.length).toBeGreaterThan(0);
    act(() => {
      fireEvent.click(cancelButtons[0]);
    });

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('hiển thị ở chế độ edit với giá trị ban đầu và nút Lưu thay đổi', () => {
    render(
      <MemoryRouter>
        <CommentForm mode="edit" initialValue="Nội dung cần chỉnh sửa" onSubmit={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Đang chỉnh sửa bình luận')).toBeInTheDocument();
    const textarea = screen.getByDisplayValue('Nội dung cần chỉnh sửa');
    expect(textarea).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lưu thay đổi/i })).toBeInTheDocument();
  });

  it('hỗ trợ phím Escape để hủy bỏ khi có onCancel', async () => {
    const handleCancel = vi.fn();
    render(
      <MemoryRouter>
        <CommentForm mode="edit" initialValue="Nội dung" onCancel={handleCancel} onSubmit={vi.fn()} />
      </MemoryRouter>,
    );

    const textarea = screen.getByDisplayValue('Nội dung');
    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'Escape' });
    });

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('vô hiệu hóa nút Lưu thay đổi nếu nội dung chưa được chỉnh sửa (dirty check) và kích hoạt khi có thay đổi', () => {
    render(
      <MemoryRouter>
        <CommentForm mode="edit" initialValue="Nội dung gốc" onSubmit={vi.fn()} />
      </MemoryRouter>,
    );

    const saveButton = screen.getByRole('button', { name: /lưu thay đổi/i });
    expect(saveButton).toBeDisabled();

    const textarea = screen.getByDisplayValue('Nội dung gốc');
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Nội dung đã được chỉnh sửa' } });
    });

    expect(saveButton).not.toBeDisabled();
  });

  it('hiển thị banner nhắc đăng nhập khi user chưa đăng nhập ở mode root', () => {
    useAuthStore.setState(unauthenticatedState);

    render(
      <MemoryRouter>
        <CommentForm onSubmit={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/bạn chưa đăng nhập/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /đăng nhập ngay/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/viết bình luận/i)).not.toBeInTheDocument();
  });

  it('hiển thị spinner và vô hiệu hóa nút submit khi isSubmitting = true', () => {
    render(
      <MemoryRouter>
        <CommentForm initialValue="Đang gửi bình luận" isSubmitting={true} onSubmit={vi.fn()} />
      </MemoryRouter>,
    );

    const submitBtn = screen.getByRole('button', { name: /đang gửi/i });
    expect(submitBtn).toBeDisabled();
  });
});
