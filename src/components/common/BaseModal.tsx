import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  fullScreenOnMobile?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
} as const;

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth = 'lg',
  closeOnEscape = true,
  closeOnBackdropClick = true,
  fullScreenOnMobile = false,
  showCloseButton = true,
  className,
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Khóa cuộn trang khi modal mở
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Lắng nghe phím Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 sm:p-6',
        fullScreenOnMobile ? 'p-0' : 'p-4',
      )}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'flex w-full flex-col overflow-hidden bg-surface text-text-main shadow-xl animate-in zoom-in-95 duration-150',
          fullScreenOnMobile
            ? 'm-0 h-dvh max-h-dvh rounded-none border-0 sm:my-auto sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-xl sm:border sm:border-border-subtle'
            : 'my-auto rounded-xl border border-border-subtle',
          maxWidthMap[maxWidth],
          className,
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex shrink-0 items-start justify-between px-6 py-4 border-b border-border-subtle gap-4">
            <div className="flex items-start gap-3 min-w-0">
              {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
              <div className="min-w-0">
                {title && (
                  <h2 id={titleId} className="text-base sm:text-lg font-semibold text-text-main leading-tight truncate">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="mt-1 text-xs text-text-muted leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Đóng"
                className="h-8 w-8 text-text-muted hover:text-text-main shrink-0 -mr-2 -mt-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Body Content */}
        <div
          className={cn(
            'overflow-y-auto overscroll-contain px-6 py-5',
            fullScreenOnMobile
              ? 'min-h-0 max-h-none flex-1 sm:max-h-[calc(85vh-130px)] sm:flex-none'
              : 'max-h-[calc(85vh-130px)]',
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-subtle bg-gray-50/50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default BaseModal;
