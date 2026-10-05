import { useCallback, useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import { FileCheck2, RotateCcw, Sparkles } from 'lucide-react';
import { AlertBanner } from '@/components/common/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { APP_PATHS } from '@/constants/path';
import { ApproveDocumentDialog } from '../components/ApproveDocumentDialog';
import { RejectDocumentDialog } from '../components/RejectDocumentDialog';
import { ModerationQueueStatsCards } from '../components/ModerationQueueStatsCards';
import { ModerationQueueFilterBar } from '../components/ModerationQueueFilterBar';
import { ModerationQueueTable } from '../components/ModerationQueueTable';
import { usePlagiarismCheck } from '../hooks/usePlagiarismCheck';
import {
  getModerationUploaderName,
  type ModerationAiRiskFilter,
  type ModerationQueueLoaderData,
  type ModerationResourceItemResponse,
  type ModerationTargetDocument,
  type PlagiarismCheckResponse,
} from '../types/moderation.types';

export function ModerationQueuePage() {
  const loaderData = useLoaderData() as ModerationQueueLoaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const { queue, stats, departments, subMajors, fileTypes, currentFilters } = loaderData;

  // Dialog states
  const [documentToApprove, setDocumentToApprove] = useState<ModerationTargetDocument | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState<boolean>(false);

  const [documentToReject, setDocumentToReject] = useState<ModerationTargetDocument | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);

  // Plagiarism checking state for rows
  const [checkingPlagiarismFileIds, setCheckingPlagiarismFileIds] = useState<Set<string>>(new Set());
  const [plagiarismResults, setPlagiarismResults] = useState<Record<string, PlagiarismCheckResponse>>({});
  const { check: runPlagiarismCheck } = usePlagiarismCheck();

  // Feedback banner & Refreshing
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Helper map to convert item to ModerationTargetDocument
  const mapItemToTargetDocument = (item: ModerationResourceItemResponse): ModerationTargetDocument => ({
    fileId: item.fileId,
    fileName: item.fileName,
    fileTypeName: item.fileTypeName,
    subMajorName: item.subMajorName,
    uploaderName: getModerationUploaderName(item),
    uploaderEmail: item.uploader?.email || item.uploaderEmail,
    createdAt: item.createdAt,
    fileUrl: item.fileUrl,
    latestPlagiarismScore: item.latestPlagiarismScore ?? item.latestModeration?.plagiarismScore,
  });

  // Filter handlers
  const updateSearchParam = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams);
      updater(next);
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const handleSearchChange = (search: string) => {
    updateSearchParam((next) => {
      if (search.length > 0) {
        next.set('search', search);
      } else {
        next.delete('search');
      }
      next.set('page', '1');
    });
  };

  const handleDepartmentChange = (departmentId?: string) => {
    updateSearchParam((next) => {
      if (departmentId) {
        next.set('departmentId', departmentId);
      } else {
        next.delete('departmentId');
      }
      next.set('page', '1');
    });
  };

  const handleSubMajorChange = (subMajorCode?: string) => {
    updateSearchParam((next) => {
      if (subMajorCode) {
        next.set('subMajorCode', subMajorCode);
      } else {
        next.delete('subMajorCode');
      }
      next.set('page', '1');
    });
  };

  const handleFileTypeChange = (fileTypeId?: number) => {
    updateSearchParam((next) => {
      if (typeof fileTypeId === 'number') {
        next.set('fileTypeId', String(fileTypeId));
      } else {
        next.delete('fileTypeId');
      }
      next.set('page', '1');
    });
  };

  const handleAiRiskChange = (aiRisk: ModerationAiRiskFilter) => {
    updateSearchParam((next) => {
      if (aiRisk && aiRisk !== 'all') {
        next.set('aiRisk', aiRisk);
      } else {
        next.delete('aiRisk');
      }
      next.set('page', '1');
    });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParam((next) => {
      next.set('page', String(newPage));
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    revalidator.revalidate();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Actions
  const handleOpenApprove = (item: ModerationResourceItemResponse) => {
    setDocumentToApprove(mapItemToTargetDocument(item));
    setIsApproveOpen(true);
  };

  const handleOpenReject = (item: ModerationResourceItemResponse) => {
    setDocumentToReject(mapItemToTargetDocument(item));
    setIsRejectOpen(true);
  };

  const handleViewDetail = (fileId: string) => {
    navigate(APP_PATHS.MODERATION_DETAIL(fileId));
  };

  const handleCheckPlagiarism = async (fileId: string) => {
    setCheckingPlagiarismFileIds((prev) => new Set(prev).add(fileId));
    setFeedback(null);

    await runPlagiarismCheck(fileId, {
      onSuccess: (result, message) => {
        setPlagiarismResults((previous) => ({ ...previous, [fileId]: result }));
        setFeedback({
          type: 'success',
          message: `${message || 'Kiểm tra trùng lặp AI hoàn tất'}. Tỷ lệ tương đồng: ${(result.similarityRate ?? result.similarityScore ?? 0).toFixed(2)}%.`,
        });
        revalidator.revalidate();
      },
      onError: (errMsg) => {
        setFeedback({
          type: 'danger',
          message: errMsg,
        });
      },
    });

    setCheckingPlagiarismFileIds((prev) => {
      const next = new Set(prev);
      next.delete(fileId);
      return next;
    });
  };

  const handleApproveSuccess = (_decision: unknown, message: string) => {
    setFeedback({
      type: 'success',
      message: message || 'Phê duyệt tài liệu thành công.',
    });
    revalidator.revalidate();
  };

  const handleRejectSuccess = (_decision: unknown, message: string) => {
    setFeedback({
      type: 'success',
      message: message || 'Đã từ chối tài liệu.',
    });
    revalidator.revalidate();
  };

  const hasActiveFilters = Boolean(
    (currentFilters.search && currentFilters.search.trim().length > 0) ||
    currentFilters.departmentId ||
    currentFilters.subMajorCode ||
    currentFilters.fileTypeId !== undefined ||
    (currentFilters.aiRisk && currentFilters.aiRisk !== 'all'),
  );

  const isLoading = isRefreshing || revalidator.state === 'loading';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Hàng đợi kiểm duyệt tài liệu"
        description="Tiếp nhận, phân tích độ trùng lặp AI và thẩm định các tài nguyên, tài liệu học tập đang ở trạng thái chờ duyệt."
        icon={FileCheck2}
        badge={
          <Badge variant="primary" showDot>
            Giảng viên / Quản trị viên
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleRefresh}
              isLoading={isLoading}
              iconLeft={<RotateCcw className="h-4 w-4" />}
              className="text-xs sm:text-sm cursor-pointer"
            >
              Làm mới
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate(APP_PATHS.PLAGIARISM_REPORTS)}
              iconLeft={<Sparkles className="h-4 w-4 text-primary" />}
              className="text-xs sm:text-sm cursor-pointer"
            >
              Báo cáo Đạo văn AI
            </Button>
          </div>
        }
      />

      {/* Feedback Alert Banner */}
      {feedback && <AlertBanner type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />}

      {/* KPI Statistics Cards */}
      <ModerationQueueStatsCards stats={stats} activeRisk={currentFilters.aiRisk} onSelectRisk={handleAiRiskChange} />

      {/* Filter Bar */}
      <ModerationQueueFilterBar
        currentFilters={currentFilters}
        departments={departments}
        subMajors={subMajors}
        fileTypes={fileTypes}
        onSearchChange={handleSearchChange}
        onDepartmentChange={handleDepartmentChange}
        onSubMajorChange={handleSubMajorChange}
        onFileTypeChange={handleFileTypeChange}
        onAiRiskChange={handleAiRiskChange}
        onResetFilters={handleResetFilters}
      />

      {/* Moderation Queue Table & Mobile Cards */}
      <ModerationQueueTable
        items={queue.items}
        plagiarismResults={plagiarismResults}
        checkingPlagiarismFileIds={checkingPlagiarismFileIds}
        onCheckPlagiarism={handleCheckPlagiarism}
        onApprove={handleOpenApprove}
        onReject={handleOpenReject}
        onViewDetail={handleViewDetail}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Pagination */}
      {queue.totalCount > 0 && (
        <Pagination
          currentPage={queue.pageIndex}
          totalPages={queue.totalPages}
          totalCount={queue.totalCount}
          pageSize={queue.pageSize}
          itemLabel="tài liệu"
          onPageChange={handlePageChange}
        />
      )}

      {/* Approve Document Dialog */}
      <ApproveDocumentDialog
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        document={documentToApprove}
        onSuccess={handleApproveSuccess}
      />

      {/* Reject Document Dialog */}
      <RejectDocumentDialog
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        document={documentToReject}
        onSuccess={handleRejectSuccess}
      />
    </div>
  );
}

export default ModerationQueuePage;
