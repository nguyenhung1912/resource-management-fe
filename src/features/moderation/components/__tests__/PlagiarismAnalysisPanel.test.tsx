import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PlagiarismAnalysisPanel, type PlagiarismAnalysisPanelProps } from '../PlagiarismAnalysisPanel';
import type { PlagiarismCheckResponse } from '../../types/moderation.types';

function renderWithRouter(props: PlagiarismAnalysisPanelProps) {
  return render(
    <MemoryRouter>
      <PlagiarismAnalysisPanel {...props} />
    </MemoryRouter>,
  );
}

describe('PlagiarismAnalysisPanel', () => {
  it('hiển thị thông báo chưa quét AI và kích hoạt nút quét khi chưa có dữ liệu phân tích', () => {
    const handleScan = vi.fn();

    renderWithRouter({ fileId: 'FIL_UNCHECKED', plagiarismCheck: null, onCheckPlagiarism: handleScan });

    expect(screen.getByText('Tài liệu chưa được quét trùng lặp')).toBeInTheDocument();
    const scanBtn = screen.getByRole('button', { name: /Kích hoạt Quét Trùng Lặp/i });
    expect(scanBtn).toBeInTheDocument();

    fireEvent.click(scanBtn);
    expect(handleScan).toHaveBeenCalledTimes(1);
  });

  it('render điểm số an toàn khi tỷ lệ trùng lặp < 20%', () => {
    const mockCheck: PlagiarismCheckResponse = {
      fileId: 'FIL_SAFE',
      similarityScore: 12.5,
      checkedAt: '2026-09-13T14:30:00Z',
      matchedChunks: [],
    };

    renderWithRouter({ fileId: 'FIL_SAFE', plagiarismCheck: mockCheck });

    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText(/Mức độ An toàn \(Trùng lặp thấp\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Không phát hiện đoạn văn bản trùng lặp đáng kể/i)).toBeInTheDocument();
  });

  it('render điểm số cảnh báo khi tỷ lệ trùng lặp từ 20% đến 30%', () => {
    const mockCheck: PlagiarismCheckResponse = {
      fileId: 'FIL_WARN',
      similarityScore: 24.8,
      checkedAt: '2026-09-13T14:30:00Z',
      matchedChunks: [],
    };

    renderWithRouter({ fileId: 'FIL_WARN', plagiarismCheck: mockCheck });

    expect(screen.getByText('24.8%')).toBeInTheDocument();
    expect(screen.getByText(/Cần lưu ý \(Trùng lặp trung bình\)/i)).toBeInTheDocument();
  });

  it('render điểm số nguy cơ cao khi tỷ lệ trùng lặp > 30%', () => {
    const mockCheck: PlagiarismCheckResponse = {
      fileId: 'FIL_DANGER',
      similarityScore: 42.1,
      checkedAt: '2026-09-13T14:30:00Z',
      matchedChunks: [
        {
          chunkIndex: 1,
          sourceFileName: 'Đề tài mẫu 2024',
          similarity: 90,
          contentSnippet: 'Mẫu đoạn trích trùng...',
        },
      ],
    };

    renderWithRouter({ fileId: 'FIL_DANGER', plagiarismCheck: mockCheck });

    expect(screen.getByText('42.1%')).toBeInTheDocument();
    expect(screen.getByText(/Vượt ngưỡng quy định \(Nguy cơ cao\)/i)).toBeInTheDocument();
    expect(screen.getByText('Đoạn #1')).toBeInTheDocument();
    expect(screen.getByText('Đề tài mẫu 2024')).toBeInTheDocument();
  });

  it('kích hoạt onCheckPlagiarism khi người dùng bấm nút Quét lại', () => {
    const handleRecheck = vi.fn();
    const mockCheck: PlagiarismCheckResponse = {
      fileId: 'FIL_RECHECK',
      similarityScore: 15,
      checkedAt: '2026-09-13T14:30:00Z',
      matchedChunks: [],
    };

    renderWithRouter({
      fileId: 'FIL_RECHECK',
      plagiarismCheck: mockCheck,
      onCheckPlagiarism: handleRecheck,
    });

    const recheckBtns = screen.getAllByRole('button', { name: /Quét lại/i });
    fireEvent.click(recheckBtns[0]);

    expect(handleRecheck).toHaveBeenCalledTimes(1);
  });
});
