import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportService } from '@/services/reportService';
import { useReportModalStore } from '@/store/useReportModalStore';
import { clearReportTypesCache } from '@/features/reports/hooks/useReportTypes';
import { GlobalReportModal } from '../GlobalReportModal';
import type {
  FileTargetContext,
  ReportMutationResponse,
  ReportTypeResponse,
} from '@/features/reports/types/report.types';

vi.mock('@/services/reportService', () => ({
  reportService: {
    getReportTypes: vi.fn(),
    createReport: vi.fn(),
  },
}));

describe('GlobalReportModal', () => {
  const mockTypes: ReportTypeResponse[] = [
    {
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      description: 'Sao chép trái phép.',
    },
  ];

  const mockTarget: FileTargetContext = {
    type: 'File',
    id: 'FIL_GLOBAL_01',
    title: 'Tài liệu toàn cục kiểm thử',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearReportTypesCache();
    vi.mocked(reportService.getReportTypes).mockResolvedValue(mockTypes);
    act(() => {
      useReportModalStore.getState().closeReportModal();
    });
  });

  it('không render gì khi store đang đóng', () => {
    const { container } = render(<GlobalReportModal />);
    expect(container).toBeEmptyDOMElement();
  });

  it('render modal khi store được kích hoạt mở với target', async () => {
    render(<GlobalReportModal />);

    act(() => {
      useReportModalStore.getState().openReportModal(mockTarget);
    });

    expect(await screen.findByText('Báo cáo nội dung vi phạm')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu toàn cục kiểm thử')).toBeInTheDocument();
  });

  it('kích hoạt onSuccess callback của store khi gửi báo cáo thành công', async () => {
    const handleSuccess = vi.fn();
    const mockRes: ReportMutationResponse = {
      message: 'Gửi báo cáo thành công.',
    };
    vi.mocked(reportService.createReport).mockResolvedValueOnce(mockRes);

    render(<GlobalReportModal />);

    act(() => {
      useReportModalStore.getState().openReportModal(mockTarget, handleSuccess);
    });

    // Chọn loại vi phạm (chờ types tải xong)
    const option1 = await screen.findByRole('radio', { name: /Vi phạm bản quyền/i });
    fireEvent.click(option1);

    // Nhập lý do
    fireEvent.change(screen.getByRole('textbox', { name: /Mô tả chi tiết vi phạm/i }), {
      target: { value: 'Nội dung sao chép toàn bộ từ nghiên cứu khác.' },
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Gửi báo cáo/i }));
    });

    expect(handleSuccess).toHaveBeenCalledWith(mockRes);
    expect(useReportModalStore.getState().isOpen).toBe(false);
  });
});
