import { create } from 'zustand';
import type { ReportMutationResponse, ReportTargetContext } from '@/features/reports/types/report.types';

export interface ReportModalState {
  isOpen: boolean;
  target: ReportTargetContext | null;
  onSuccessCallback: ((response: ReportMutationResponse) => void) | null;

  // Actions
  openReportModal: (target: ReportTargetContext, onSuccess?: (response: ReportMutationResponse) => void) => void;
  closeReportModal: () => void;
}

export const useReportModalStore = create<ReportModalState>((set) => ({
  isOpen: false,
  target: null,
  onSuccessCallback: null,

  openReportModal: (target, onSuccess) =>
    set({
      isOpen: true,
      target,
      onSuccessCallback: onSuccess ?? null,
    }),

  closeReportModal: () =>
    set({
      isOpen: false,
      target: null,
      onSuccessCallback: null,
    }),
}));

export default useReportModalStore;
