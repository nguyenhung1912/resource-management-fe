import { render, screen } from '@testing-library/react';
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
});
