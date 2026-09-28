import { memo, useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Edit2, Flag, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CommentActionMenuProps {
  commentId: string;
  canEdit: boolean;
  canDelete: boolean;
  canReport: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  className?: string;
}

export const CommentActionMenu = memo(function CommentActionMenu({
  commentId,
  canEdit,
  canDelete,
  canReport,
  disabled = false,
  onEdit,
  onDelete,
  onReport,
  className,
}: CommentActionMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasAnyAction = canEdit || canDelete || canReport;

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation & accessibility within dropdown
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        setIsOpen(false);
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const menuItems = menuRef.current?.querySelectorAll<HTMLButtonElement>(
          'button[role="menuitem"]:not([disabled])',
        );
        if (!menuItems || menuItems.length === 0) return;

        const currentActive = document.activeElement as HTMLButtonElement | null;
        const currentIndex = Array.from(menuItems).indexOf(currentActive!);

        const nextIndex =
          e.key === 'ArrowDown'
            ? currentIndex < menuItems.length - 1
              ? currentIndex + 1
              : 0
            : currentIndex > 0
              ? currentIndex - 1
              : menuItems.length - 1;

        menuItems[nextIndex]?.focus();
      }
    },
    [isOpen],
  );

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  const handleAction = useCallback((callback: () => void) => {
    setIsOpen(false);
    callback();
  }, []);

  if (!hasAnyAction) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      onKeyDown={handleKeyDown}
      className={cn('relative', className)}
      data-testid={`comment-action-menu-${commentId}`}
    >
      {/* Kebab Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className="inline-flex items-center justify-center size-6 text-text-muted hover:text-text-main hover:bg-neutral-100 active:bg-neutral-200/70 rounded-md -mr-1 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Tùy chọn bình luận"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreVertical className="size-3.5" aria-hidden="true" />
      </button>

      {/* Dropdown Menu Container */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={`comment-action-menu-btn-${commentId}`}
          className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-surface border border-border-subtle shadow-md py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs focus:outline-none"
        >
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onEdit)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-text-main hover:bg-slate-50 transition-colors text-left cursor-pointer focus:bg-slate-100 focus:outline-none"
            >
              <Edit2 className="size-3 text-text-muted shrink-0" aria-hidden="true" />
              <span className="truncate">Chỉnh sửa</span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onDelete)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-danger hover:bg-rose-50 transition-colors text-left cursor-pointer focus:bg-rose-100/70 focus:outline-none"
            >
              <Trash2 className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">Xóa</span>
            </button>
          )}

          {canReport && (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onReport)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-warning hover:bg-amber-50 transition-colors text-left cursor-pointer focus:bg-amber-100/70 focus:outline-none"
            >
              <Flag className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">Báo cáo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default CommentActionMenu;
