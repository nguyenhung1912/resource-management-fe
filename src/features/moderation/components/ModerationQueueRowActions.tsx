import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ModerationResourceItemResponse } from '../types/moderation.types';
import { cn } from '@/utils/cn';

export interface ModerationQueueRowActionsProps {
  item: ModerationResourceItemResponse;
  isCheckingPlagiarism?: boolean;
  onCheckPlagiarism: (fileId: string) => void;
  onApprove: (item: ModerationResourceItemResponse) => void;
  onReject: (item: ModerationResourceItemResponse) => void;
  onViewDetail: (fileId: string) => void;
  className?: string;
  allowManualDecisions?: boolean;
}

export function ModerationQueueRowActions({
  item,
  isCheckingPlagiarism = false,
  onCheckPlagiarism,
  onApprove,
  onReject,
  onViewDetail,
  className,
  allowManualDecisions = true,
}: ModerationQueueRowActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-1.5 shrink-0', className)}>
      {/* Quét AI - Compact button */}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        isLoading={isCheckingPlagiarism}
        onClick={() => onCheckPlagiarism(item.fileId)}
        aria-label={`Kích hoạt quét AI cho tài liệu ${item.fileName}`}
        title="Quét kiểm tra độ trùng lặp AI"
        iconLeft={
          !isCheckingPlagiarism ? <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> : undefined
        }
        className="text-xs h-7 px-2 cursor-pointer border border-border-subtle hover:border-primary/40"
      >
        <span className="hidden 2xl:inline text-[11px]">Quét AI</span>
      </Button>

      {allowManualDecisions ? (
        <>
          {/* Duyệt - Soft button */}
          <Button
            type="button"
            size="sm"
            onClick={() => onApprove(item)}
            aria-label={`Phê duyệt tài liệu ${item.fileName}`}
            title="Phê duyệt tài liệu"
            className="text-xs h-7 px-2.5 cursor-pointer bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200/80 active:bg-emerald-200/60 font-medium"
          >
            <Check className="h-3.5 w-3.5 mr-1 shrink-0" aria-hidden="true" />
            <span>Duyệt</span>
          </Button>

          {/* Từ chối - Soft button */}
          <Button
            type="button"
            size="sm"
            onClick={() => onReject(item)}
            aria-label={`Từ chối tài liệu ${item.fileName}`}
            title="Từ chối tài liệu"
            className="text-xs h-7 px-2.5 cursor-pointer bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200/80 active:bg-rose-200/60 font-medium"
          >
            <X className="h-3.5 w-3.5 mr-1 shrink-0" aria-hidden="true" />
            <span>Từ chối</span>
          </Button>
        </>
      ) : null}
      {/* Chi tiết - Icon button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onViewDetail(item.fileId)}
        aria-label={`Xem chi tiết tài liệu ${item.fileName}`}
        title="Xem toàn văn và kết quả thẩm định chi tiết"
        className="text-xs h-7 w-7 p-0 flex items-center justify-center text-text-muted hover:text-primary hover:bg-neutral-100 cursor-pointer"
      >
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}

export default ModerationQueueRowActions;
