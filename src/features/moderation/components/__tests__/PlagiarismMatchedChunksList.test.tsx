import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlagiarismMatchedChunksList } from '../PlagiarismMatchedChunksList';
import type { PlagiarismMatchedChunk } from '../../types/moderation.types';

describe('PlagiarismMatchedChunksList', () => {
  it('render thông báo an toàn khi matchedChunks trống hoặc undefined', () => {
    const { rerender } = render(<PlagiarismMatchedChunksList matchedChunks={[]} />);
    expect(screen.getByText('Không phát hiện đoạn văn bản trùng lặp đáng kể')).toBeInTheDocument();

    rerender(<PlagiarismMatchedChunksList matchedChunks={undefined} />);
    expect(screen.getByText('Không phát hiện đoạn văn bản trùng lặp đáng kể')).toBeInTheDocument();
  });

  it('render danh sách các đoạn trùng lặp kèm tên file nguồn, phần trăm và trích đoạn', () => {
    const mockChunks: PlagiarismMatchedChunk[] = [
      {
        chunkIndex: 1,
        sourceFileId: 'FIL_SRC_01',
        sourceFileName: 'Khóa luận K18 - Học sâu trong Thị giác',
        similarity: 88.5,
        contentSnippet: 'Thuật toán YOLOv8 được triển khai trên nền tảng PyTorch...',
      },
      {
        chunkIndex: 2,
        sourceFileId: 'FIL_SRC_02',
        sourceFileName: 'Báo cáo khoa học 2025',
        similarity: 54.2,
        contentSnippet: 'Độ chính xác trung bình mAP đạt ngưỡng 92.4%...',
      },
    ];

    render(<PlagiarismMatchedChunksList matchedChunks={mockChunks} />);

    expect(screen.getByText(/Chi tiết các đoạn trùng lặp \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('Đoạn #1')).toBeInTheDocument();
    expect(screen.getByText('Khóa luận K18 - Học sâu trong Thị giác')).toBeInTheDocument();
    expect(screen.getByText('Trùng lặp 88.5%')).toBeInTheDocument();
    expect(screen.getByText(/Thuật toán YOLOv8 được triển khai trên nền tảng PyTorch/i)).toBeInTheDocument();

    expect(screen.getByText('Đoạn #2')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo khoa học 2025')).toBeInTheDocument();
    expect(screen.getByText('Trùng lặp 54.2%')).toBeInTheDocument();
  });

  it('lọc danh sách đoạn trùng theo từ khóa tìm kiếm trong contentSnippet và sourceFileName', () => {
    const mockChunks: PlagiarismMatchedChunk[] = [
      {
        chunkIndex: 1,
        sourceFileName: 'Đề tài Thị giác máy tính',
        similarity: 90,
        contentSnippet: 'Mô hình Transformer được tối ưu hóa cho bài toán...',
      },
      {
        chunkIndex: 2,
        sourceFileName: 'Khóa luận Xử lý ngôn ngữ tự nhiên',
        similarity: 70,
        contentSnippet: 'Phân tích cảm xúc văn bản sử dụng mạng LSTM...',
      },
    ];

    render(<PlagiarismMatchedChunksList matchedChunks={mockChunks} />);

    const searchInput = screen.getByLabelText('Tìm kiếm trong các đoạn trùng lặp');

    // Tìm kiếm theo từ khóa trong snippet
    fireEvent.change(searchInput, { target: { value: 'Transformer' } });
    expect(screen.getByText('Đề tài Thị giác máy tính')).toBeInTheDocument();
    expect(screen.queryByText('Khóa luận Xử lý ngôn ngữ tự nhiên')).not.toBeInTheDocument();

    // Tìm kiếm theo tên file nguồn
    fireEvent.change(searchInput, { target: { value: 'ngôn ngữ' } });
    expect(screen.queryByText('Đề tài Thị giác máy tính')).not.toBeInTheDocument();
    expect(screen.getByText('Khóa luận Xử lý ngôn ngữ tự nhiên')).toBeInTheDocument();

    // Tìm kiếm không ra kết quả
    fireEvent.change(searchInput, { target: { value: 'KhôngTồnTại123' } });
    expect(screen.getByText(/Không tìm thấy đoạn trùng lặp nào khớp với từ khóa/i)).toBeInTheDocument();

    // Reset tìm kiếm
    const resetBtn = screen.getByRole('button', { name: /Đặt lại tìm kiếm/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText('Đề tài Thị giác máy tính')).toBeInTheDocument();
    expect(screen.getByText('Khóa luận Xử lý ngôn ngữ tự nhiên')).toBeInTheDocument();
  });

  it('sắp xếp danh sách theo tỷ lệ trùng tăng dần và giảm dần', () => {
    const mockChunks: PlagiarismMatchedChunk[] = [
      {
        chunkIndex: 1,
        sourceFileName: 'File A',
        similarity: 45,
        contentSnippet: 'Đoạn A',
      },
      {
        chunkIndex: 2,
        sourceFileName: 'File B',
        similarity: 95,
        contentSnippet: 'Đoạn B',
      },
    ];

    render(<PlagiarismMatchedChunksList matchedChunks={mockChunks} />);

    const sortSelect = screen.getByLabelText('Sắp xếp danh sách đoạn trùng');

    // Mặc định là similarity-desc (File B 95% trước File A 45%)
    const badgesBefore = screen.getAllByText(/^Trùng lặp \d+%/);
    expect(badgesBefore[0]).toHaveTextContent('Trùng lặp 95%');
    expect(badgesBefore[1]).toHaveTextContent('Trùng lặp 45%');

    // Chuyển sang similarity-asc (File A 45% trước File B 95%)
    fireEvent.change(sortSelect, { target: { value: 'similarity-asc' } });
    const badgesAfter = screen.getAllByText(/^Trùng lặp \d+%/);
    expect(badgesAfter[0]).toHaveTextContent('Trùng lặp 45%');
    expect(badgesAfter[1]).toHaveTextContent('Trùng lặp 95%');
  });
});
