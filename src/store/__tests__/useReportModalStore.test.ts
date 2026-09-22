import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReportModalStore } from '../useReportModalStore';
import type { FileTargetContext, ReportMutationResponse } from '@/features/reports/types/report.types';

describe('useReportModalStore', () => {
  const mockTarget: FileTargetContext = {
    type: 'File',
    id: 'FIL_TEST_123',
    title: 'Tài liệu nghiên cứu khoa học công nghệ',
  };

  beforeEach(() => {
    act(() => {
      useReportModalStore.getState().closeReportModal();
    });
  });

  it('khởi tạo với trạng thái ban đầu đóng', () => {
    const state = useReportModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.target).toBeNull();
    expect(state.onSuccessCallback).toBeNull();
  });

  it('mở modal và lưu đối tượng mục tiêu cùng callback khi gọi openReportModal', () => {
    const handleSuccess = vi.fn();

    act(() => {
      useReportModalStore.getState().openReportModal(mockTarget, handleSuccess);
    });

    const state = useReportModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.target).toEqual(mockTarget);
    expect(state.onSuccessCallback).toBe(handleSuccess);

    // Kích hoạt callback
    const mockRes: ReportMutationResponse = { message: 'Thành công' };
    state.onSuccessCallback?.(mockRes);
    expect(handleSuccess).toHaveBeenCalledWith(mockRes);
  });

  it('đóng modal và reset trạng thái khi gọi closeReportModal', () => {
    act(() => {
      useReportModalStore.getState().openReportModal(mockTarget);
    });
    expect(useReportModalStore.getState().isOpen).toBe(true);

    act(() => {
      useReportModalStore.getState().closeReportModal();
    });

    const state = useReportModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.target).toBeNull();
    expect(state.onSuccessCallback).toBeNull();
  });
});
