import { Info } from 'lucide-react';

export interface AuditLogDiffViewerProps {
  oldValue: string | null;
  newValue: string | null;
  className?: string;
}

function parseAndFormat(value: string | null): { formatted: string; isJson: boolean } {
  if (!value || value.trim() === '') {
    return { formatted: '', isJson: false };
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) {
      return { formatted: JSON.stringify(parsed, null, 2), isJson: true };
    }
    return { formatted: String(parsed), isJson: false };
  } catch {
    return { formatted: value, isJson: false };
  }
}

export function AuditLogDiffViewer({ oldValue, newValue, className }: AuditLogDiffViewerProps) {
  const oldParsed = parseAndFormat(oldValue);
  const newParsed = parseAndFormat(newValue);

  const hasNoData = !oldParsed.formatted && !newParsed.formatted;

  if (hasNoData) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-border-subtle bg-gray-50/70 p-4 text-xs text-text-muted ${className ?? ''}`}
      >
        <Info className="size-4 shrink-0 text-text-muted" />
        <span>Không có dữ liệu thay đổi (Hành động này chỉ ghi nhận sự kiện hệ thống).</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        So sánh biến động dữ liệu (Payload Diff)
      </h4>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Dữ liệu cũ */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-rose-200/60 bg-rose-50/30">
          <div className="border-b border-rose-200/40 bg-rose-100/40 px-3 py-1.5 text-xs font-medium text-rose-800">
            Dữ liệu cũ (Trước thay đổi)
          </div>
          <div className="flex-1 p-3">
            {oldParsed.formatted ? (
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-text">
                <code>{oldParsed.formatted}</code>
              </pre>
            ) : (
              <span className="text-xs italic text-text-muted">(Không có dữ liệu ban đầu)</span>
            )}
          </div>
        </div>

        {/* Dữ liệu mới */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-emerald-200/60 bg-emerald-50/30">
          <div className="border-b border-emerald-200/40 bg-emerald-100/40 px-3 py-1.5 text-xs font-medium text-emerald-800">
            Dữ liệu mới (Sau thay đổi)
          </div>
          <div className="flex-1 p-3">
            {newParsed.formatted ? (
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-text">
                <code>{newParsed.formatted}</code>
              </pre>
            ) : (
              <span className="text-xs italic text-text-muted">(Đã xóa / Không có dữ liệu mới)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLogDiffViewer;
