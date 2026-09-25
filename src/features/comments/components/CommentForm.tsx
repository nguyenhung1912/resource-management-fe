import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, CornerDownRight, Edit3, Loader2, LogIn, Send, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { MAX_COMMENT_LENGTH, getCommentAuthorInitials, getRoleBadgeInfo } from '../utils/commentUtils';

export interface CommentFormProps {
  mode?: 'root' | 'reply' | 'edit';
  parentAuthorName?: string;
  initialValue?: string;
  placeholder?: string;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  onSubmit: (content: string) => Promise<boolean | void> | boolean | void;
  onCancel?: () => void;
  className?: string;
}

export function CommentForm({
  mode = 'root',
  parentAuthorName,
  initialValue = '',
  placeholder,
  isSubmitting = false,
  autoFocus = false,
  onSubmit,
  onCancel,
  className,
}: CommentFormProps) {
  const [prevInitialValue, setPrevInitialValue] = useState<string>(initialValue);
  const [content, setContent] = useState<string>(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (prevInitialValue !== initialValue) {
    setPrevInitialValue(initialValue);
    setContent(initialValue);
  }

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to the end of text
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [autoFocus]);

  const isDirty = mode !== 'edit' || content.trim() !== initialValue.trim();
  const trimmedLength = content.trim().length;
  const isOverLimit = content.length > MAX_COMMENT_LENGTH;
  const canSubmit = trimmedLength > 0 && !isOverLimit && !isSubmitting && isDirty;

  const defaultPlaceholder =
    mode === 'reply'
      ? `Trả lời @${parentAuthorName || 'tác giả'}...`
      : mode === 'edit'
        ? 'Chỉnh sửa nội dung bình luận...'
        : 'Viết bình luận hoặc chia sẻ câu hỏi của bạn về tài liệu này...';

  const effectivePlaceholder = placeholder ?? defaultPlaceholder;

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (!canSubmit) return;

      setValidationError(null);
      const trimmed = content.trim();

      try {
        const result = await onSubmit(trimmed);
        if (result !== false && mode === 'root') {
          setContent('');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể gửi bình luận.';
        setValidationError(message);
      }
    },
    [canSubmit, content, onSubmit, mode],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape' && onCancel) {
        e.preventDefault();
        onCancel();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit, onCancel],
  );

  // If user is guest and trying to write a root comment, show polite login card
  if (!isAuthenticated && mode === 'root') {
    return (
      <div
        className={cn(
          'p-4 rounded-xl border border-border-subtle bg-slate-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3',
          className,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-full bg-slate-200 text-text-muted flex items-center justify-center shrink-0">
            <LogIn className="size-4" aria-hidden="true" />
          </div>
          <div className="text-xs sm:text-sm text-text-muted">
            <span className="font-semibold text-text-main block sm:inline">Bạn chưa đăng nhập. </span>
            Đăng nhập để tham gia thảo luận và gửi bình luận.
          </div>
        </div>
        <Link
          to={APP_PATHS.LOGIN}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <LogIn className="size-3.5" aria-hidden="true" />
          <span>Đăng nhập ngay</span>
        </Link>
      </div>
    );
  }

  const roleInfo = getRoleBadgeInfo(user?.role);
  const userInitials = getCommentAuthorInitials(user?.fullName);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'rounded-xl border border-border-subtle bg-surface p-3.5 transition-shadow focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary',
        mode === 'reply' && 'border-primary/30 bg-blue-50/20',
        mode === 'edit' && 'border-warning/30 bg-amber-50/20',
        className,
      )}
      aria-label={
        mode === 'reply'
          ? 'Khung trả lời bình luận'
          : mode === 'edit'
            ? 'Khung chỉnh sửa bình luận'
            : 'Khung viết bình luận'
      }
    >
      {/* Header for Reply / Edit mode */}
      {mode === 'reply' && (
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle/80 text-xs">
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <CornerDownRight className="size-3.5" aria-hidden="true" />
            <span>
              Đang trả lời <strong className="font-semibold">@{parentAuthorName || 'bình luận'}</strong>
            </span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-text-muted hover:text-text-main flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Hủy trả lời"
            >
              <X className="size-3" aria-hidden="true" />
              <span>Hủy</span>
            </button>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle/80 text-xs">
          <div className="flex items-center gap-1.5 text-warning font-medium">
            <Edit3 className="size-3.5" aria-hidden="true" />
            <span>Đang chỉnh sửa bình luận</span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-text-muted hover:text-text-main flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Hủy chỉnh sửa"
            >
              <X className="size-3" aria-hidden="true" />
              <span>Hủy</span>
            </button>
          )}
        </div>
      )}

      {/* User Info Header for Root Mode */}
      {mode === 'root' && (
        <div className="flex items-center gap-2 mb-2 text-xs">
          <div className="size-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-[10px] shrink-0">
            {userInitials}
          </div>
          <span className="font-semibold text-text-main truncate">{user?.fullName || 'Người dùng'}</span>
          {user?.role && (
            <Badge variant={roleInfo.variant} className="text-[10px] px-1.5 py-0 leading-tight">
              {roleInfo.label}
            </Badge>
          )}
        </div>
      )}

      {/* Input Textarea */}
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (validationError) setValidationError(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder={effectivePlaceholder}
        disabled={isSubmitting}
        maxLength={MAX_COMMENT_LENGTH}
        error={isOverLimit ? 'Vượt quá 4000 ký tự cho phép' : (validationError ?? undefined)}
        className={cn(
          'min-h-20 text-xs sm:text-sm border-0 focus-visible:ring-0 px-1 py-1 resize-none bg-transparent',
          mode === 'reply' ? 'min-h-16' : 'min-h-20',
        )}
      />

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-border-subtle/60 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-mono text-[11px]',
              isOverLimit
                ? 'text-danger font-semibold'
                : content.length > 3800
                  ? 'text-warning font-semibold'
                  : 'text-text-muted',
            )}
            aria-live="polite"
          >
            {content.length}/{MAX_COMMENT_LENGTH}
          </span>
          <span className="hidden sm:inline text-[11px] text-text-muted/70">
            {mode === 'edit' ? (
              <>
                (Nhấn <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Ctrl</kbd> +{' '}
                <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Enter</kbd> để lưu,{' '}
                <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Esc</kbd> để hủy)
              </>
            ) : mode === 'reply' ? (
              <>
                (Nhấn <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Ctrl</kbd> +{' '}
                <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Enter</kbd> để gửi,{' '}
                <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Esc</kbd> để hủy)
              </>
            ) : (
              <>
                (Nhấn <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Ctrl</kbd> +{' '}
                <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Enter</kbd> để gửi)
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-xs h-7.5 px-2.5 cursor-pointer"
            >
              Hủy
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!canSubmit}
            className="text-xs h-7.5 px-3 gap-1.5 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : mode === 'edit' ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Send className="size-3.5" aria-hidden="true" />
            )}
            <span>
              {isSubmitting
                ? 'Đang gửi...'
                : mode === 'edit'
                  ? 'Lưu thay đổi'
                  : mode === 'reply'
                    ? 'Trả lời'
                    : 'Bình luận'}
            </span>
          </Button>
        </div>
      </div>
    </form>
  );
}

export default CommentForm;
