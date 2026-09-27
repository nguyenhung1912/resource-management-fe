import { memo, useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, LogIn, Send, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StarRatingInput } from '@/components/ui/StarRatingInput';
import { useRatingMutations } from '../hooks/useRatingMutations';
import { DeleteRatingDialog } from './DeleteRatingDialog';
import { cn } from '@/utils/cn';

export interface UserRatingActionCardProps {
  fileId: string;
  currentUserScore: number | null;
  isAuthenticated: boolean;
  onRequireLogin?: () => void;
  onRatingSuccess?: (score: number) => void;
  onDeleteSuccess?: () => void;
  className?: string;
}

export const UserRatingActionCard = memo(function UserRatingActionCard({
  fileId,
  currentUserScore,
  isAuthenticated,
  onRequireLogin,
  onRatingSuccess,
  onDeleteSuccess,
  className,
}: UserRatingActionCardProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(currentUserScore);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sync selectedScore if currentUserScore changes from outside
  useEffect(() => {
    setSelectedScore(currentUserScore);
  }, [currentUserScore]);

  const { isSubmitting, isDeleting, mutationError, mutationSuccess, clearMutationStatus, submitRating, removeRating } =
    useRatingMutations();

  const handleScoreChange = useCallback(
    (newScore: number) => {
      clearMutationStatus();
      setSelectedScore(newScore);
    },
    [clearMutationStatus],
  );

  const handleSubmit = useCallback(async () => {
    if (!selectedScore) return;
    clearMutationStatus();

    const res = await submitRating(fileId, selectedScore);
    if (res) {
      onRatingSuccess?.(selectedScore);
    }
  }, [clearMutationStatus, fileId, onRatingSuccess, selectedScore, submitRating]);

  const handleConfirmDelete = useCallback(async () => {
    const success = await removeRating(fileId);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedScore(null);
      onDeleteSuccess?.();
    }
  }, [fileId, onDeleteSuccess, removeRating]);

  // Case 1: Unauthenticated user
  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'rounded-xl border border-border-subtle bg-slate-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5',
          className,
        )}
        data-testid="unauthenticated-rating-card"
      >
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Star className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-main">Bạn thấy tài liệu này thế nào?</h4>
            <p className="text-xs text-text-muted mt-0.5">Đăng nhập để chia sẻ đánh giá sao của bạn với cộng đồng.</p>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onRequireLogin}
          className="shrink-0 font-medium"
          data-testid="require-login-rating-btn"
        >
          <LogIn className="size-3.5 mr-1.5" aria-hidden="true" />
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  const hasRated = typeof currentUserScore === 'number' && currentUserScore > 0;
  const isScoreModified = selectedScore !== null && selectedScore !== currentUserScore;
  const canSubmit = selectedScore !== null && selectedScore > 0 && (isScoreModified || !hasRated) && !isSubmitting;

  return (
    <>
      <div
        className={cn(
          'rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-2xs space-y-4 transition-all duration-200',
          className,
        )}
        data-testid="user-rating-action-card"
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-bold text-text-main">Đánh giá của bạn</span>

          {hasRated && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Đã đánh giá: {currentUserScore}★</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  clearMutationStatus();
                  setIsDeleteDialogOpen(true);
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer whitespace-nowrap"
                title="Hủy đánh giá của bạn trên tài liệu này"
                data-testid="open-delete-rating-dialog-btn"
              >
                <Trash2 className="size-3 shrink-0" aria-hidden="true" />
                <span>Hủy đánh giá</span>
              </button>
            </div>
          )}
        </div>

        {/* Star Input row */}
        <div className="flex items-center justify-between gap-3 pt-0.5 flex-wrap sm:flex-nowrap">
          <StarRatingInput
            value={selectedScore}
            onChange={handleScoreChange}
            size="md"
            disabled={isSubmitting || isDeleting}
            id={`user-rating-${fileId}`}
          />

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="shrink-0 font-semibold text-xs px-3 py-1.5 whitespace-nowrap"
            data-testid="submit-rating-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" aria-hidden="true" />
                Đang lưu...
              </>
            ) : (
              <>
                <Send className="size-3.5 mr-1.5" aria-hidden="true" />
                {hasRated ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </>
            )}
          </Button>
        </div>

        {/* Feedback Messages */}
        {mutationSuccess && (
          <div
            role="status"
            className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium"
            data-testid="mutation-success-alert"
          >
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>{mutationSuccess}</span>
          </div>
        )}

        {mutationError && (
          <div
            role="alert"
            className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-medium"
            data-testid="mutation-error-alert"
          >
            <AlertCircle className="size-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span>{mutationError}</span>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <DeleteRatingDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        error={mutationError}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          clearMutationStatus();
          setIsDeleteDialogOpen(false);
        }}
      />
    </>
  );
});

export default UserRatingActionCard;
