// Components
export { ReportViolationModal } from './components/ReportViolationModal';
export type { ReportViolationModalProps } from './components/ReportViolationModal';
export { GlobalReportModal } from './components/GlobalReportModal';
export { ReportTargetCard } from './components/ReportTargetCard';
export { ReportTypeSelector } from './components/ReportTypeSelector';
export { ReportReasonField, MIN_REASON_LENGTH, MAX_REASON_LENGTH } from './components/ReportReasonField';
export { ReportPolicyNotice } from './components/ReportPolicyNotice';
export { ReportTargetBadge } from './components/ReportTargetBadge';

// Hooks
export { useReportTypes, clearReportTypesCache } from './hooks/useReportTypes';
export type { UseReportTypesOptions, UseReportTypesReturn } from './hooks/useReportTypes';
export { useCreateReport } from './hooks/useCreateReport';
export type { UseCreateReportCallbacks, UseCreateReportReturn } from './hooks/useCreateReport';

// Types
export type {
  ReportTargetType,
  ReportStatus,
  ReportTargetContext,
  FileTargetContext,
  CommentTargetContext,
  UserTargetContext,
  CreateReportPayload,
  CreateReportRequestBody,
  ReportTypeResponse,
  ReportItemResponse,
  ReportDetailResponse,
  PagedReportResponse,
  ReportMutationResponse,
} from './types/report.types';
