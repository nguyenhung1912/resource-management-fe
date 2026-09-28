import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlagiarismMatchedChunksTable } from '../PlagiarismMatchedChunksTable';
import type { PlagiarismMatchedChunk } from '../../../types/moderation.types';

describe('PlagiarismMatchedChunksTable', () => {
  const mockChunks: PlagiarismMatchedChunk[] = [
    {
      chunkIndex: 1,
      sourceFileId: 'FIL_TEST_01',
      sourceFileName: 'Đề tài Nghiên cứu Máy học',
      similarity: 85.5,
      contentSnippet: 'Mạng nơ-ron tích chập sâu kết hợp cơ chế Attention.',
    },
    {
      chunkIndex: 2,
      sourceFileId: 'FIL_TEST_02',
      sourceFileName: 'Khóa luận Xử lý tiếng Việt',
      similarity: 42.0,
      contentSnippet: 'Phương pháp tách từ và gán nhãn từ loại tiếng Việt.',
    },
    {
      chunkIndex: 3,
      sourceFileId: 'FIL_TEST_03',
      sourceFileName: 'Báo cáo Thống kê Khoa học',
      similarity: 15.0,
      contentSnippet: 'Dữ liệu được thu thập từ 500 sinh viên tại trường đại học.',
    },
  ];

  it('render thông báo an toàn khi mảng chunks rỗng', () => {
    render(<PlagiarismMatchedChunksTable matchedChunks={[]} />);
    expect(screen.getByText('Không phát hiện đoạn văn bản trùng lặp đáng kể')).toBeInTheDocument();
  });

  it('render bảng dữ liệu đầy đủ các cột và các hàng dữ liệu', () => {
    render(<PlagiarismMatchedChunksTable matchedChunks={mockChunks} />);

    // Header cột
    expect(screen.getByRole('columnheader', { name: /^Đoạn$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Độ tương đồng/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tài liệu nguồn gốc/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Đoạn trích đối soát/i })).toBeInTheDocument();

    // Data rows
    expect(screen.getAllByText('Đoạn #1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Đề tài Nghiên cứu Máy học').length).toBeGreaterThan(0);
    expect(screen.getAllByText('85.5%').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mạng nơ-ron tích chập sâu kết hợp cơ chế Attention/i).length).toBeGreaterThan(0);

    expect(screen.getAllByText('Đoạn #2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('42%').length).toBeGreaterThan(0);

    expect(screen.getAllByText('Đoạn #3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15%').length).toBeGreaterThan(0);
  });

  it('lọc theo cấp độ nguy cơ (tab filter)', () => {
    render(<PlagiarismMatchedChunksTable matchedChunks={mockChunks} />);

    // Nhấp vào nút lọc "Nguy cơ cao" (chỉ có chunk #1)
    const dangerBtn = screen.getByRole('button', { name: /Nguy cơ cao/i });
    fireEvent.click(dangerBtn);

    expect(screen.getAllByText('Đề tài Nghiên cứu Máy học').length).toBeGreaterThan(0);
    expect(screen.queryByText('Khóa luận Xử lý tiếng Việt')).not.toBeInTheDocument();
    expect(screen.queryByText('Báo cáo Thống kê Khoa học')).not.toBeInTheDocument();

    // Nhấp vào "Tất cả" để khôi phục
    const allBtn = screen.getByRole('button', { name: /Tất cả/i });
    fireEvent.click(allBtn);

    expect(screen.getAllByText('Khóa luận Xử lý tiếng Việt').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Báo cáo Thống kê Khoa học').length).toBeGreaterThan(0);
  });

  it('lọc theo từ khóa tìm kiếm trong trích đoạn và reset bộ lọc', () => {
    render(<PlagiarismMatchedChunksTable matchedChunks={mockChunks} />);

    const searchInput = screen.getByLabelText('Tìm kiếm trong các đoạn trùng lặp');

    // Tìm kiếm từ khóa không tồn tại
    fireEvent.change(searchInput, { target: { value: 'KhôngTồnTại999' } });

    expect(screen.getByText('Không tìm thấy đoạn trùng khớp phù hợp')).toBeInTheDocument();

    // Nhấn đặt lại bộ lọc
    const resetBtn = screen.getByRole('button', { name: /Đặt lại bộ lọc/i });
    fireEvent.click(resetBtn);

    expect(screen.getAllByText('Đề tài Nghiên cứu Máy học').length).toBeGreaterThan(0);
  });

  it('sắp xếp theo tỷ lệ tương đồng', () => {
    render(<PlagiarismMatchedChunksTable matchedChunks={mockChunks} />);

    const sortSelect = screen.getByLabelText('Sắp xếp danh sách đoạn trùng');

    // Đổi sang trùng thấp nhất
    fireEvent.change(sortSelect, { target: { value: 'similarity-asc' } });
    expect(sortSelect).toHaveValue('similarity-asc');
  });
});
