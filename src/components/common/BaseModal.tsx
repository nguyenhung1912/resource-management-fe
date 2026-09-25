import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  fullScreenOnMobile?: boolean;
  showCloseButton?: boolean;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
} as const;

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

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
  restoreFocusRef,
  className,
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const fallbackRestoreTarget = restoreFocusRef?.current ?? null;
    const dialog = modalRef.current;
    if (!dialog) return;

    const getFocusableElements = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const preferredElement = dialog.querySelector<HTMLElement>('[autofocus]');
    (preferredElement ?? getFocusableElements()[0] ?? dialog).focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => {
      document.removeEventListener('keydown', trapFocus);
      const restoreTarget = previouslyFocusedElement?.isConnected ? previouslyFocusedElement : fallbackRestoreTarget;
      restoreTarget?.focus();
    };
  }, [isOpen, restoreFocusRef]);

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
        tabIndex={-1}
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
