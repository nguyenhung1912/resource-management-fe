import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlagiarismHistogramChart } from '../PlagiarismHistogramChart';
import type { PlagiarismHistogramBucket } from '../../types/plagiarism-report.types';

// recharts dùng ResizeObserver, cần mock trong môi trường JSDOM
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {
      /* noop */
    }
    unobserve() {
      /* noop */
    }
    disconnect() {
      /* noop */
    }
  },
);

const SAMPLE_HISTOGRAM: PlagiarismHistogramBucket[] = [
  { range: '0–10%', count: 30, riskLevel: 'safe' },
  { range: '10–20%', count: 20, riskLevel: 'safe' },
  { range: '20–30%', count: 15, riskLevel: 'warning' },
  { range: '30–50%', count: 8, riskLevel: 'danger' },
  { range: '50–100%', count: 3, riskLevel: 'danger' },
];

describe('PlagiarismHistogramChart', () => {
  it('render header title và subtitle', () => {
    render(<PlagiarismHistogramChart histogram={SAMPLE_HISTOGRAM} />);
    expect(screen.getByText('Phân bố Tỷ lệ Trùng lặp')).toBeInTheDocument();
    expect(screen.getByText(/Số lượng tài liệu theo từng ngưỡng/i)).toBeInTheDocument();
  });

  it('render empty state khi tất cả buckets đều có count = 0', () => {
    const emptyHistogram: PlagiarismHistogramBucket[] = [
      { range: '0–10%', count: 0, riskLevel: 'safe' },
      { range: '10–20%', count: 0, riskLevel: 'safe' },
      { range: '20–30%', count: 0, riskLevel: 'warning' },
      { range: '30–50%', count: 0, riskLevel: 'danger' },
      { range: '50–100%', count: 0, riskLevel: 'danger' },
    ];
    render(<PlagiarismHistogramChart histogram={emptyHistogram} />);
    expect(screen.getByText('Chưa có dữ liệu phân tích')).toBeInTheDocument();
  });

  it('render empty state khi histogram array rỗng', () => {
    render(<PlagiarismHistogramChart histogram={[]} />);
    expect(screen.getByText('Chưa có dữ liệu phân tích')).toBeInTheDocument();
  });

  it('hiển thị legend với 3 mức rủi ro (không hiện Chưa quét)', () => {
    render(<PlagiarismHistogramChart histogram={SAMPLE_HISTOGRAM} />);
    expect(screen.getByText('An toàn')).toBeInTheDocument();
    expect(screen.getByText('Cần lưu ý')).toBeInTheDocument();
    expect(screen.getByText('Nguy hiểm')).toBeInTheDocument();
    expect(screen.queryByText('Chưa quét')).not.toBeInTheDocument();
  });

  it('render không crash khi histogram có 1 bucket duy nhất', () => {
    const single: PlagiarismHistogramBucket[] = [{ range: '0–10%', count: 50, riskLevel: 'safe' }];
    expect(() => render(<PlagiarismHistogramChart histogram={single} />)).not.toThrow();
  });
});
