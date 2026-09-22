import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReportTypeSelector } from '../ReportTypeSelector';
import type { ReportTypeResponse } from '@/features/reports/types/report.types';

describe('ReportTypeSelector', () => {
  const mockTypes: ReportTypeResponse[] = [
    {
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      description: 'Sao chép trái phép không trích dẫn nguồn.',
    },
    {
      reportTypeId: 2,
      reportTypeName: 'Spam / Nội dung rác',
      description: 'Chứa quảng cáo thương mại hoặc bình luận rác.',
    },
  ];

  it('hiển thị skeleton khi isLoading = true', () => {
    render(<ReportTypeSelector reportTypes={[]} selectedTypeId={null} onSelectType={vi.fn()} isLoading />);

    expect(screen.getByLabelText('Đang tải danh mục vi phạm')).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi và nút thử lại khi error có giá trị', () => {
    const handleRetry = vi.fn();

    render(
      <ReportTypeSelector
        reportTypes={[]}
        selectedTypeId={null}
        onSelectType={vi.fn()}
        error="Lỗi kết nối máy chủ"
        onRetry={handleRetry}
      />,
    );

    expect(screen.getByText('Lỗi kết nối máy chủ')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('render danh sách loại vi phạm và gọi onSelectType khi nhấn chọn', () => {
    const handleSelect = vi.fn();

    render(<ReportTypeSelector reportTypes={mockTypes} selectedTypeId={null} onSelectType={handleSelect} />);

    expect(screen.getByText('Vi phạm bản quyền')).toBeInTheDocument();
    expect(screen.getByText('Spam / Nội dung rác')).toBeInTheDocument();

    const option1 = screen.getByRole('radio', { name: /Vi phạm bản quyền/i });
    expect(option1).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(option1);
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it('đánh dấu aria-checked = true cho mục đã chọn', () => {
    render(<ReportTypeSelector reportTypes={mockTypes} selectedTypeId={2} onSelectType={vi.fn()} />);

    const option1 = screen.getByRole('radio', { name: /Vi phạm bản quyền/i });
    const option2 = screen.getByRole('radio', { name: /Spam \/ Nội dung rác/i });

    expect(option1).toHaveAttribute('aria-checked', 'false');
    expect(option2).toHaveAttribute('aria-checked', 'true');
  });

  it('hiển thị thông báo validationError khi được truyền vào', () => {
    render(
      <ReportTypeSelector
        reportTypes={mockTypes}
        selectedTypeId={null}
        onSelectType={vi.fn()}
        validationError="Vui lòng chọn loại vi phạm."
      />,
    );

    expect(screen.getByText('Vui lòng chọn loại vi phạm.')).toBeInTheDocument();
  });
});
