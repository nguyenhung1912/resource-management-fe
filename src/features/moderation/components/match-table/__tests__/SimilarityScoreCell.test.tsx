import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimilarityScoreCell } from '../SimilarityScoreCell';

describe('SimilarityScoreCell', () => {
  it('render tỷ lệ phần trăm và badge nguy cơ cao khi score >= 70%', () => {
    render(<SimilarityScoreCell similarity={85.4} riskLevel="danger" />);

    expect(screen.getByText('85.4%')).toBeInTheDocument();
    expect(screen.getByText('Nguy cơ cao')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: /Mức độ tương đồng 85.4%/i })).toBeInTheDocument();
  });

  it('render badge cần lưu ý khi score ở mức cảnh báo', () => {
    render(<SimilarityScoreCell similarity={45} riskLevel="warning" />);

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('Cần lưu ý')).toBeInTheDocument();
  });

  it('render badge tương đồng thấp khi score an toàn', () => {
    render(<SimilarityScoreCell similarity={12.5} riskLevel="safe" />);

    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('Tương đồng thấp')).toBeInTheDocument();
  });

  it('ẩn mini meter khi showMeter = false', () => {
    render(<SimilarityScoreCell similarity={12.5} riskLevel="safe" showMeter={false} />);

    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });
});
