import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlagiarismScoreGauge } from '../PlagiarismScoreGauge';

describe('PlagiarismScoreGauge', () => {
  it('hiển thị "Chưa quét" với Clock icon khi score là null', () => {
    render(<PlagiarismScoreGauge score={null} />);
    expect(screen.getByText('Chưa quét')).toBeInTheDocument();
  });

  it('hiển thị "Chưa quét" khi score là undefined', () => {
    render(<PlagiarismScoreGauge score={undefined} />);
    expect(screen.getByText('Chưa quét')).toBeInTheDocument();
  });

  it('hiển thị score an toàn (< 20) với label "An toàn"', () => {
    render(<PlagiarismScoreGauge score={12.5} />);
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('An toàn')).toBeInTheDocument();
  });

  it('hiển thị score cảnh báo (20 <= score <= 30) với label "Cần lưu ý"', () => {
    render(<PlagiarismScoreGauge score={25} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Cần lưu ý')).toBeInTheDocument();
  });

  it('hiển thị score đúng ngưỡng 30 (warning)', () => {
    render(<PlagiarismScoreGauge score={30} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('Cần lưu ý')).toBeInTheDocument();
  });

  it('hiển thị score nguy hiểm (> 30) với label "Nguy hiểm"', () => {
    render(<PlagiarismScoreGauge score={45.2} />);
    expect(screen.getByText('45.2%')).toBeInTheDocument();
    expect(screen.getByText('Nguy hiểm')).toBeInTheDocument();
  });

  it('compact mode: chỉ hiển thị badge, không có label text', () => {
    render(<PlagiarismScoreGauge score={15} compact />);
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.queryByText('An toàn')).not.toBeInTheDocument();
  });

  it('compact mode với score null: hiển thị "Chưa quét"', () => {
    render(<PlagiarismScoreGauge score={null} compact />);
    expect(screen.getByText('Chưa quét')).toBeInTheDocument();
  });

  it('hiển thị score 0 là an toàn', () => {
    render(<PlagiarismScoreGauge score={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('An toàn')).toBeInTheDocument();
  });

  it('hiển thị score 100 là nguy hiểm', () => {
    render(<PlagiarismScoreGauge score={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Nguy hiểm')).toBeInTheDocument();
  });
});
