import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, type TabItem } from '../Tabs';

const sampleTabs: TabItem<string>[] = [
  { id: 'all', label: 'Tất cả', count: 120 },
  { id: 'approved', label: 'Đã duyệt', count: 95, dotColor: 'bg-success' },
  { id: 'pending', label: 'Chờ duyệt', count: 25, dotColor: 'bg-warning' },
  { id: 'disabled', label: 'Không khả dụng', disabled: true },
];

describe('Tabs component', () => {
  it('render danh sách tab dạng pills mặc định và hiển thị đúng số lượng', () => {
    const handleChange = vi.fn();
    render(<Tabs items={sampleTabs} activeValue="all" onChange={handleChange} />);

    expect(screen.getByRole('tab', { name: /Tất cả/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  it('gọi onChange với id tương ứng khi click vào tab', () => {
    const handleChange = vi.fn();
    render(<Tabs items={sampleTabs} activeValue="all" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('tab', { name: /Đã duyệt/ }));
    expect(handleChange).toHaveBeenCalledWith('approved');
  });

  it('không gọi onChange khi tab bị disabled', () => {
    const handleChange = vi.fn();
    render(<Tabs items={sampleTabs} activeValue="all" onChange={handleChange} />);

    const disabledTab = screen.getByRole('tab', { name: /Không khả dụng/ });
    expect(disabledTab).toBeDisabled();
    fireEvent.click(disabledTab);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('render đúng cấu trúc variant segmented', () => {
    const handleChange = vi.fn();
    render(<Tabs items={sampleTabs} activeValue="pending" onChange={handleChange} variant="segmented" />);

    const activeTab = screen.getByRole('tab', { name: /Chờ duyệt/ });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(activeTab).toHaveClass('bg-surface');
  });

  it('render đúng cấu trúc variant underline', () => {
    const handleChange = vi.fn();
    render(<Tabs items={sampleTabs} activeValue="all" onChange={handleChange} variant="underline" />);

    const activeTab = screen.getByRole('tab', { name: /Tất cả/ });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(activeTab).toHaveClass('text-primary');
  });
});
