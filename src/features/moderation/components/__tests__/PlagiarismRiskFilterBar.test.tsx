import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlagiarismRiskFilterBar } from '../PlagiarismRiskFilterBar';
import type { PlagiarismRiskLevel } from '../../types/plagiarism-report.types';

const defaultProps = {
  currentSearch: '',
  currentRiskLevel: undefined as PlagiarismRiskLevel | undefined,
  onSearchChange: vi.fn(),
  onRiskLevelChange: vi.fn(),
  onResetFilters: vi.fn(),
  totalCount: 100,
  filteredCount: 100,
};

describe('PlagiarismRiskFilterBar', () => {
  it('render search input và placeholder', () => {
    render(<PlagiarismRiskFilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Tìm theo tên tài liệu/i)).toBeInTheDocument();
  });

  it('hiển thị đúng 5 filter pills', () => {
    render(<PlagiarismRiskFilterBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Tất cả/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /An toàn/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cần lưu ý/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nguy hiểm/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chưa quét/ })).toBeInTheDocument();
  });

  it('gọi onSearchChange khi nhấn Enter', () => {
    const onSearchChange = vi.fn();
    render(<PlagiarismRiskFilterBar {...defaultProps} onSearchChange={onSearchChange} />);
    const input = screen.getByPlaceholderText(/Tìm theo tên tài liệu/i);
    fireEvent.change(input, { target: { value: 'Test doc' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearchChange).toHaveBeenCalledWith('Test doc');
  });

  it('gọi onSearchChange khi blur ra khỏi input (giá trị thay đổi)', () => {
    const onSearchChange = vi.fn();
    render(<PlagiarismRiskFilterBar {...defaultProps} onSearchChange={onSearchChange} />);
    const input = screen.getByPlaceholderText(/Tìm theo tên tài liệu/i);
    fireEvent.change(input, { target: { value: 'Blur test' } });
    fireEvent.blur(input);
    expect(onSearchChange).toHaveBeenCalledWith('Blur test');
  });

  it('gọi onRiskLevelChange("danger") khi click "Nguy hiểm"', () => {
    const onRiskLevelChange = vi.fn();
    render(<PlagiarismRiskFilterBar {...defaultProps} onRiskLevelChange={onRiskLevelChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Nguy hiểm/ }));
    expect(onRiskLevelChange).toHaveBeenCalledWith('danger');
  });

  it('gọi onRiskLevelChange(undefined) khi click "Tất cả"', () => {
    const onRiskLevelChange = vi.fn();
    render(<PlagiarismRiskFilterBar {...defaultProps} onRiskLevelChange={onRiskLevelChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Tất cả/ }));
    expect(onRiskLevelChange).toHaveBeenCalledWith(undefined);
  });

  it('hiển thị nút "Đặt lại" khi có active filter (currentRiskLevel)', () => {
    render(<PlagiarismRiskFilterBar {...defaultProps} currentRiskLevel="danger" />);
    expect(screen.getByRole('button', { name: /Đặt lại/ })).toBeInTheDocument();
  });

  it('gọi onResetFilters khi click "Đặt lại"', () => {
    const onResetFilters = vi.fn();
    render(<PlagiarismRiskFilterBar {...defaultProps} currentSearch="test" onResetFilters={onResetFilters} />);
    fireEvent.click(screen.getByRole('button', { name: /Đặt lại/ }));
    expect(onResetFilters).toHaveBeenCalledOnce();
  });

  it('không hiển thị nút "Đặt lại" khi không có filter active', () => {
    render(<PlagiarismRiskFilterBar {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /Đặt lại/ })).not.toBeInTheDocument();
  });

  it('hiển thị đúng số lượng filteredCount / totalCount', () => {
    render(<PlagiarismRiskFilterBar {...defaultProps} totalCount={200} filteredCount={45} />);
    expect(screen.getByText(/45/)).toBeInTheDocument();
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('filter pill "Nguy hiểm" có aria-pressed=true khi đang active', () => {
    render(<PlagiarismRiskFilterBar {...defaultProps} currentRiskLevel="danger" />);
    const pill = screen.getByRole('button', { name: /Nguy hiểm/ });
    expect(pill).toHaveAttribute('aria-pressed', 'true');
  });
});
