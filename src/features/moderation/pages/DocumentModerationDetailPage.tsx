import { useState } from 'react';
import { Link, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { processingDeployment, processingPausedMessage } from '@/features/processing/utils/processingDeployment';
import { useLegacyDecisionGuard } from '../hooks/useLegacyDecisionGuard';
import { APP_PATHS } from '@/constants/path';
import { AlertBanner } from '@/components/common/AlertBanner';
import { DocumentModerationHeader } from '../components/DocumentModerationHeader';
import { DocumentMetadataCard } from '../components/DocumentMetadataCard';
import { DocumentFileViewer } from '../components/DocumentFileViewer';
import { PlagiarismAnalysisPanel } from '../components/PlagiarismAnalysisPanel';
import { ModerationHistoryTimeline } from '../components/ModerationHistoryTimeline';
import { ApproveDocumentDialog } from '../components/ApproveDocumentDialog';
import { RejectDocumentDialog } from '../components/RejectDocumentDialog';
import { usePlagiarismCheck } from '../hooks/usePlagiarismCheck';
import type {
  ModerationDecisionResponse,
  ModerationDetailLoaderData,
  ModerationTargetDocument,
  PlagiarismCheckResponse,
} from '../types/moderation.types';

interface FeedbackBannerState {
  type: 'success' | 'danger';
  title: string;
  message: string;
}

export function DocumentModerationDetailPage() {
  const { detail, history } = useLoaderData() as ModerationDetailLoaderData;
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const legacyDecision = useLegacyDecisionGuard();
  const deployment = processingDeployment();

  const plagiarismCheck: PlagiarismCheckResponse | null = detail.latestPlagiarismCheck ?? null;
  const [isApproveOpen, setIsApproveOpen] = useState<boolean>(false);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<FeedbackBannerState | null>(null);

  const { isChecking, apiError: scanError, clearApiError: clearScanError, check } = usePlagiarismCheck();

  const handleCheckPlagiarism = async () => {
    clearScanError();
    await check(detail.fileId, {
      onSuccess: (result) => {
        setFeedbackBanner({
          type: 'success',
          title: 'Đã tiếp nhận yêu cầu kiểm tra',
          message: 'Yêu cầu đang chờ xử lý; chưa có kết quả mới.',
        });
        void navigate(APP_PATHS.PROCESSING_JOB(result.jobId));
      },
    });
  };

  const handleApproveSuccess = (_decision: ModerationDecisionResponse, message: string) => {
    setIsApproveOpen(false);
    setFeedbackBanner({
      type: 'success',
      title: 'Phê duyệt tài liệu thành công',
      message: message || 'Tài liệu đã được chuyển sang trạng thái Đã duyệt và sẵn sàng tra cứu.',
    });
    revalidator.revalidate();
  };

  const handleRejectSuccess = (_decision: ModerationDecisionResponse, message: string) => {
    setIsRejectOpen(false);
    setFeedbackBanner({
      type: 'danger',
      title: 'Đã từ chối tài liệu',
      message: message || 'Thông báo từ chối kèm lý do thẩm định đã được gửi đến sinh viên/tác giả.',
    });
    revalidator.revalidate();
  };

  // Chuẩn hóa document cho modal Approve & Reject
  const documentTarget: ModerationTargetDocument = {
    fileId: detail.fileId,
    fileName: detail.fileName,
    fileTypeName: detail.fileTypeName,
    subMajorName: detail.subMajorName,
    departmentName: detail.departmentName,
    uploaderName: detail.uploader?.fullName,
    uploaderEmail: detail.uploader?.email,
    createdAt: detail.createdAt,
    fileUrl: detail.fileUrl,
    latestPlagiarismScore: plagiarismCheck?.similarityRate ?? plagiarismCheck?.similarityScore ?? null,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header section with back navigation and action toolbar */}
      <DocumentModerationHeader
        document={detail}
        isCheckingPlagiarism={isChecking}
        onCheckPlagiarism={handleCheckPlagiarism}
        onOpenApprove={
          deployment.legacyManualDecisions
            ? () => void legacyDecision.run(detail.fileId, () => setIsApproveOpen(true))
            : undefined
        }
        onOpenReject={
          deployment.legacyManualDecisions
            ? () => void legacyDecision.run(detail.fileId, () => setIsRejectOpen(true))
            : undefined
        }
      />

      {/* Quick link to Plagiarism Report overview */}
      <div className="flex items-center justify-end">
        <Link
          to={APP_PATHS.PLAGIARISM_REPORTS}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
        >
          <BarChart2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
          Xem Báo cáo Đạo văn AI toàn hệ thống
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {!deployment.enabled ? (
        <p role="status" className="text-text-muted">
          {processingPausedMessage}
        </p>
      ) : null}
      {legacyDecision.error ? (
        <p role="alert" className="text-danger">
          {legacyDecision.error}
        </p>
      ) : null}
      {/* API scan error notification */}
      {scanError ? (
        <AlertBanner type="danger" title="Lỗi phân tích AI:" message={scanError} onClose={clearScanError} />
      ) : null}

      {/* Decision feedback banner */}
      {feedbackBanner ? (
        <AlertBanner
          type={feedbackBanner.type}
          title={feedbackBanner.title}
          message={feedbackBanner.message}
          onClose={() => setFeedbackBanner(null)}
        />
      ) : null}

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Metadata Card & Document File Viewer */}
        <div className="xl:col-span-7 space-y-6">
          <DocumentMetadataCard document={detail} />
          <DocumentFileViewer fileUrl={detail.fileUrl} fileName={detail.fileName} fileId={detail.fileId} />
        </div>

        {/* Right Column: AI Plagiarism Panel & History Timeline */}
        <div className="xl:col-span-5 space-y-6">
          <PlagiarismAnalysisPanel
            fileId={detail.fileId}
            plagiarismCheck={plagiarismCheck}
            isChecking={isChecking}
            onCheckPlagiarism={handleCheckPlagiarism}
          />
          <ModerationHistoryTimeline history={history} />
        </div>
      </div>

      {/* Confirmation & Feedback Dialogs */}
      <ApproveDocumentDialog
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        document={documentTarget}
        onSuccess={handleApproveSuccess}
      />

      <RejectDocumentDialog
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        document={documentTarget}
        onSuccess={handleRejectSuccess}
      />
    </div>
  );
}

export default DocumentModerationDetailPage;
