import { useState } from 'react';
import { Link, useLoaderData, useRevalidator } from 'react-router-dom';
import { AlertCircle, BarChart2, CheckCircle2, X } from 'lucide-react';
import { APP_PATHS } from '@/constants/path';
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
import { cn } from '@/utils/cn';

interface FeedbackBannerState {
  type: 'success' | 'danger';
  title: string;
  message: string;
}

export function DocumentModerationDetailPage() {
  const { detail, history } = useLoaderData() as ModerationDetailLoaderData;
  const revalidator = useRevalidator();

  const [plagiarismCheck, setPlagiarismCheck] = useState<PlagiarismCheckResponse | null>(
    detail.latestPlagiarismCheck ?? null,
  );
  const [isApproveOpen, setIsApproveOpen] = useState<boolean>(false);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<FeedbackBannerState | null>(null);

  const { isChecking, apiError: scanError, clearApiError: clearScanError, check } = usePlagiarismCheck();

  const handleCheckPlagiarism = async () => {
    clearScanError();
    await check(detail.fileId, {
      onSuccess: (result, message) => {
        setPlagiarismCheck(result);
        setFeedbackBanner({
          type: 'success',
          title: 'Quét trùng lặp AI hoàn tất',
          message: `${message} Tỷ lệ tương đồng ghi nhận: ${result.similarityScore}%.`,
        });
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
    latestPlagiarismScore: plagiarismCheck?.similarityScore ?? null,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header section with back navigation and action toolbar */}
      <DocumentModerationHeader
        document={detail}
        isCheckingPlagiarism={isChecking}
        onCheckPlagiarism={handleCheckPlagiarism}
        onOpenApprove={() => setIsApproveOpen(true)}
        onOpenReject={() => setIsRejectOpen(true)}
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

      {/* API scan error notification */}
      {scanError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-danger text-xs animate-in fade-in"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-semibold">Lỗi phân tích AI:</span>
              <p>{scanError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearScanError}
            className="p-1 rounded-md text-danger/80 hover:text-danger hover:bg-rose-100 transition-colors"
            aria-label="Đóng thông báo lỗi"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Decision feedback banner */}
      {feedbackBanner && (
        <div
          role="status"
          className={cn(
            'flex items-start justify-between gap-3 p-4 rounded-xl border text-xs animate-in fade-in',
            feedbackBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950',
          )}
        >
          <div className="flex items-start gap-2.5">
            {feedbackBanner.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
            )}
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-semibold">{feedbackBanner.title}</span>
              <p>{feedbackBanner.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className={cn(
              'p-1 rounded-md transition-colors',
              feedbackBanner.type === 'success'
                ? 'text-emerald-800 hover:bg-emerald-100'
                : 'text-rose-800 hover:bg-rose-100',
            )}
            aria-label="Đóng thông báo"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

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
