import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppealForm } from '../AppealForm';

describe('AppealForm component', () => {
  it('hiển thị form nhập giải trình và liên kết minh chứng', () => {
    render(<AppealForm isSubmitting={false} apiError={null} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/nội dung giải trình \/ khiếu nại/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/liên kết tài liệu minh chứng/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hủy bỏ/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gửi giải trình/i })).toBeInTheDocument();
  });

  it('báo lỗi khi bấm gửi mà không nhập nội dung giải trình', () => {
    const handleSubmit = vi.fn();
    render(<AppealForm isSubmitting={false} apiError={null} onSubmit={handleSubmit} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /gửi giải trình/i }));

    expect(screen.getByText('Vui lòng nhập nội dung giải trình.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('báo lỗi khi nội dung giải trình ngắn hơn 20 ký tự', () => {
    const handleSubmit = vi.fn();
    render(<AppealForm isSubmitting={false} apiError={null} onSubmit={handleSubmit} onCancel={vi.fn()} />);

    const textarea = screen.getByLabelText(/nội dung giải trình \/ khiếu nại/i);
    fireEvent.change(textarea, { target: { value: 'Quá ngắn' } });
    fireEvent.click(screen.getByRole('button', { name: /gửi giải trình/i }));

    expect(screen.getByText(/nội dung giải trình phải có ít nhất 20 ký tự/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('báo lỗi khi URL minh chứng không hợp lệ', () => {
    const handleSubmit = vi.fn();
    render(<AppealForm isSubmitting={false} apiError={null} onSubmit={handleSubmit} onCancel={vi.fn()} />);

    const textarea = screen.getByLabelText(/nội dung giải trình \/ khiếu nại/i);
    fireEvent.change(textarea, {
      target: { value: 'Đây là nội dung giải trình đầy đủ và hợp lệ trên 20 ký tự.' },
    });

    const urlInput = screen.getByLabelText(/liên kết tài liệu minh chứng/i);
    fireEvent.change(urlInput, { target: { value: 'not-a-valid-url' } });

    fireEvent.click(screen.getByRole('button', { name: /gửi giải trình/i }));

    expect(screen.getByText(/đường dẫn minh chứng phải là một URL hợp lệ/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('gọi onSubmit với dữ liệu hợp lệ khi người dùng nhập đúng chuẩn', () => {
    const handleSubmit = vi.fn();
    render(<AppealForm isSubmitting={false} apiError={null} onSubmit={handleSubmit} onCancel={vi.fn()} />);

    const textarea = screen.getByLabelText(/nội dung giải trình \/ khiếu nại/i);
    fireEvent.change(textarea, {
      target: { value: 'Em xin giải trình nội dung chương 3 không hề vi phạm bản quyền.' },
    });

    const urlInput = screen.getByLabelText(/liên kết tài liệu minh chứng/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://drive.google.com/file/d/minh-chung' },
    });

    fireEvent.click(screen.getByRole('button', { name: /gửi giải trình/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      studentExplanation: 'Em xin giải trình nội dung chương 3 không hề vi phạm bản quyền.',
      attachmentUrl: 'https://drive.google.com/file/d/minh-chung',
    });
  });

  it('gửi attachmentUrl = null khi người dùng không nhập link minh chứng', () => {
    const handleSubmit = vi.fn();
    render(<AppealForm isSubmitting={false} apiError={null} onSubmit={handleSubmit} onCancel={vi.fn()} />);

    const textarea = screen.getByLabelText(/nội dung giải trình \/ khiếu nại/i);
    fireEvent.change(textarea, {
      target: { value: 'Em xin giải trình nội dung chương 3 không hề vi phạm bản quyền.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /gửi giải trình/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      studentExplanation: 'Em xin giải trình nội dung chương 3 không hề vi phạm bản quyền.',
      attachmentUrl: null,
    });
  });

  it('gọi onCancel khi click nút Hủy bỏ', () => {
    const handleCancel = vi.fn();
    render(<AppealForm isSubmitting={false} apiError={null} onSubmit={vi.fn()} onCancel={handleCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /hủy bỏ/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('hiển thị banner thông báo lỗi từ backend khi apiError có giá trị', () => {
    render(
      <AppealForm
        isSubmitting={false}
        apiError="Tài liệu này đã hết số lượt khiếu nại."
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Tài liệu này đã hết số lượt khiếu nại.');
  });
});
