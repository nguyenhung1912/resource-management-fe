import { RefreshCw, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import type { ReportTypeResponse } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface ReportTypeSelectorProps {
  reportTypes: ReportTypeResponse[];
  selectedTypeId: string | number | null;
  onSelectType: (id: string | number) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  validationError?: string;
  disabled?: boolean;
}

export function ReportTypeSelector({
  reportTypes,
  selectedTypeId,
  onSelectType,
  isLoading = false,
  error = null,
  onRetry,
  validationError,
  disabled = false,
}: ReportTypeSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label requiredBadge>Lý do vi phạm</Label>
        <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Đang tải danh mục vi phạm">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 rounded-xl border border-border-subtle bg-gray-50/70" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label requiredBadge error>
          Lý do vi phạm
        </Label>
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs text-danger space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-7 text-xs border-red-200 text-danger hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Thử lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label id="report-type-label" requiredBadge error={Boolean(validationError)}>
          Loại vi phạm
        </Label>
        {validationError && (
          <span className="text-xs text-danger font-medium animate-in fade-in">{validationError}</span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-labelledby="report-type-label"
        className="space-y-2 max-h-56 overflow-y-auto overscroll-contain pr-1"
      >
        {reportTypes.map((type) => {
          const isSelected = String(type.reportTypeId) === String(selectedTypeId);

          return (
            <button
              type="button"
              key={String(type.reportTypeId)}
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectType(type.reportTypeId)}
              className={cn(
                'w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-border-subtle bg-surface hover:border-gray-300 hover:bg-gray-50/50',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              )}
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold leading-tight',
                      isSelected ? 'text-primary' : 'text-text-main',
                    )}
                  >
                    {type.reportTypeName}
                  </span>
                </div>
                {type.description && (
                  <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{type.description}</p>
                )}
              </div>

              {/* Radio Indicator */}
              <div
                className={cn(
                  'h-4 w-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors',
                  isSelected ? 'border-primary bg-primary text-white' : 'border-border-subtle bg-surface',
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ReportTypeSelector;
