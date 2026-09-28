import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentLikeButton } from '../CommentLikeButton';

describe('CommentLikeButton component', () => {
  it('hiển thị nhãn "Thích" khi số lượt thích bằng 0 và chưa thích', () => {
    render(<CommentLikeButton commentId="CMT_001" isLiked={false} likeCount={0} onToggle={vi.fn()} />);

    const button = screen.getByRole('button', { name: /thích bình luận/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Thích');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('hiển thị số lượt thích cụ thể khi likeCount > 0 và chưa thích', () => {
    render(<CommentLikeButton commentId="CMT_001" isLiked={false} likeCount={7} onToggle={vi.fn()} />);

    const button = screen.getByRole('button', {
      name: 'Thích bình luận (hiện có 7 lượt thích)',
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('7');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('hiển thị giao diện đã thích khi isLiked = true', () => {
    render(<CommentLikeButton commentId="CMT_001" isLiked={true} likeCount={8} onToggle={vi.fn()} />);

    const button = screen.getByRole('button', {
      name: 'Bỏ thích bình luận (hiện có 8 lượt thích)',
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveClass('text-primary');
    expect(button).toHaveTextContent('8');
  });

  it('gọi onToggle khi người dùng nhấn nút Thích', () => {
    const handleToggle = vi.fn();
    render(<CommentLikeButton commentId="CMT_001" isLiked={false} likeCount={3} onToggle={handleToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith('CMT_001', false);
  });

  it('gọi onToggle với isLiked = true khi người dùng nhấn Bỏ thích', () => {
    const handleToggle = vi.fn();
    render(<CommentLikeButton commentId="CMT_001" isLiked={true} likeCount={4} onToggle={handleToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith('CMT_001', true);
  });

  it('hiển thị spinner và vô hiệu hóa nút khi isLoading = true', () => {
    const handleToggle = vi.fn();
    render(
      <CommentLikeButton commentId="CMT_001" isLiked={false} likeCount={5} isLoading={true} onToggle={handleToggle} />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleToggle).not.toHaveBeenCalled();
  });

  it('kích hoạt onRequireLogin khi khách chưa đăng nhập bấm nút Thích', () => {
    const handleToggle = vi.fn();
    const handleRequireLogin = vi.fn();

    render(
      <CommentLikeButton
        commentId="CMT_001"
        isLiked={false}
        likeCount={2}
        isAuthenticated={false}
        onToggle={handleToggle}
        onRequireLogin={handleRequireLogin}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Đăng nhập để thích bình luận');

    fireEvent.click(button);

    expect(handleRequireLogin).toHaveBeenCalledTimes(1);
    expect(handleToggle).not.toHaveBeenCalled();
  });

  it('gọi onToggle nếu khách chưa đăng nhập nhưng không truyền onRequireLogin', () => {
    const handleToggle = vi.fn();

    render(
      <CommentLikeButton
        commentId="CMT_001"
        isLiked={false}
        likeCount={2}
        isAuthenticated={false}
        onToggle={handleToggle}
      />,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleToggle).toHaveBeenCalledWith('CMT_001', false);
  });
});
