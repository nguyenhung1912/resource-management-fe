import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlagiarismRiskDashboard } from '../PlagiarismRiskDashboard';
import type { PlagiarismOverviewStats } from '../../types/plagiarism-report.types';

// ─── Fixtures ──────────────────────────────────────────────────────────────

const makeStats = (overrides: Partial<PlagiarismOverviewStats> = {}): PlagiarismOverviewStats => ({
  totalFiles: 100,
  totalScanned: 80,
  totalUnscanned: 20,
  safeCount: 50,
  warningCount: 20,
  dangerCount: 10,
  ...overrides,
});

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('PlagiarismRiskDashboard', () => {
  it('hiển thị tổng số tài liệu trong donut center và header', () => {
    render(<PlagiarismRiskDashboard stats={makeStats({ totalFiles: 142 })} />);

    // Xuất hiện ít nhất một lần trong donut SVG và trong header description
    const matches = screen.getAllByText(/142/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('hiển thị đúng các stat rows với giá trị từ props', () => {
    const stats = makeStats({
      totalFiles: 200,
      totalScanned: 180,
      totalUnscanned: 20,
      safeCount: 120,
      warningCount: 40,
      dangerCount: 20,
    });
    render(<PlagiarismRiskDashboard stats={stats} />);

    // Zone C — stat rows (dùng getAllByText vì "An toàn" xuất hiện ở nhiều zones: legend, stacked bar, stat row)
    expect(screen.getAllByText(/Tổng tài liệu/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Đã quét AI/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/An toàn/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Cần xem xét/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Nguy cơ cao/i).length).toBeGreaterThanOrEqual(1);
  });

  it('hiển thị "0 tài liệu" khi totalFiles = 0 (empty state)', () => {
    const emptyStats = makeStats({
      totalFiles: 0,
      totalScanned: 0,
      totalUnscanned: 0,
      safeCount: 0,
      warningCount: 0,
      dangerCount: 0,
    });
    render(<PlagiarismRiskDashboard stats={emptyStats} />);

    // Donut empty state SVG hiển thị "0"
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('render đúng aria-label region', () => {
    render(<PlagiarismRiskDashboard stats={makeStats()} />);
    expect(screen.getByRole('region', { name: /Thống kê phân tích đạo văn AI/i })).toBeInTheDocument();
  });

  it('hiển thị số lượng cần xem xét = warningCount + dangerCount', () => {
    const stats = makeStats({ warningCount: 15, dangerCount: 8 });
    render(<PlagiarismRiskDashboard stats={stats} />);
    // 15 + 8 = 23 — stat row "Cần xem xét" hiển thị 23
    expect(screen.getByText('23')).toBeInTheDocument();
  });

  it('kích hoạt onSelectRiskLevel khi người dùng click vào nút legend', () => {
    const handleSelect = vi.fn();
    render(<PlagiarismRiskDashboard stats={makeStats()} onSelectRiskLevel={handleSelect} />);

    const safeBtn = screen.getByTitle('Lọc theo: An toàn');
    fireEvent.click(safeBtn);

    expect(handleSelect).toHaveBeenCalledWith('safe');
  });
});
