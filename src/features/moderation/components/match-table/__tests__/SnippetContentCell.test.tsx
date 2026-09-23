import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SnippetContentCell } from '../SnippetContentCell';

describe('SnippetContentCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('render thông báo khi snippet trống', () => {
    render(<SnippetContentCell contentSnippet="" />);
    expect(screen.getByText('Không có đoạn văn bản trích dẫn hiển thị.')).toBeInTheDocument();
  });

  it('render đoạn trích ngắn mà không hiển thị nút mở rộng', () => {
    const shortText = 'Đây là đoạn văn bản ngắn dưới 120 ký tự.';
    render(<SnippetContentCell contentSnippet={shortText} chunkIndex={1} />);

    expect(screen.getByText(shortText)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Xem toàn bộ đoạn trích/i })).not.toBeInTheDocument();
  });

  it('hiển thị nút Xem toàn bộ / Thu gọn khi đoạn trích dài và toggle được trạng thái', () => {
    const longText =
      'Thuật toán YOLOv8 được tối ưu hóa nhằm tăng tốc độ suy luận mạng nơ-ron tích chập trên các thiết bị biên IoT có tài nguyên tính toán giới hạn và yêu cầu phản hồi thời gian thực.';
    render(<SnippetContentCell contentSnippet={longText} chunkIndex={2} />);

    expect(screen.getByText(longText)).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Xem toàn bộ đoạn trích/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click mở rộng
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /Thu gọn đoạn trích/i })).toBeInTheDocument();

    // Click thu gọn lại
    fireEvent.click(screen.getByRole('button', { name: /Thu gọn đoạn trích/i }));
    expect(screen.getByRole('button', { name: /Xem toàn bộ đoạn trích/i })).toBeInTheDocument();
  });

  it('sao chép đoạn trích vào clipboard khi nhấn nút copy', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const snippetText = 'Đoạn trích cần sao chép.';
    render(<SnippetContentCell contentSnippet={snippetText} chunkIndex={1} />);

    const copyBtn = screen.getByRole('button', { name: /Sao chép đoạn trích #1/i });
    expect(copyBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith(snippetText);
  });
});
