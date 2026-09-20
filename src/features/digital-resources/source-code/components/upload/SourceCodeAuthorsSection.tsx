import { useState, type KeyboardEvent } from 'react';
import { Plus, User, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export interface SourceCodeAuthorsSectionProps {
  authorIds: string[];
  error?: string;
  disabled?: boolean;
  onAddAuthor: (authorName: string) => void;
  onRemoveAuthor: (authorName: string) => void;
}

export function SourceCodeAuthorsSection({
  authorIds,
  error,
  disabled = false,
  onAddAuthor,
  onRemoveAuthor,
}: SourceCodeAuthorsSectionProps) {
  const [authorInput, setAuthorInput] = useState('');

  const handleAddAuthor = () => {
    const trimmed = authorInput.trim();
    if (!trimmed) return;
    onAddAuthor(trimmed);
    setAuthorInput('');
  };

  const handleAuthorKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddAuthor();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <Users className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-text-main">Tác giả thực hiện</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source-code-author-input" className="text-xs font-medium text-text-main">
          Tác giả thực hiện <span className="text-danger">*</span>
        </Label>

        {authorIds.length > 0 ? (
          <div className="flex flex-wrap gap-2 items-center" aria-label="Danh sách tác giả">
            {authorIds.map((authorName) => (
              <span
                key={authorName}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-primary"
              >
                <User className="size-3.5 text-primary" aria-hidden="true" />
                <span>{authorName}</span>
                <button
                  type="button"
                  aria-label={`Xóa tác giả ${authorName}`}
                  disabled={disabled}
                  className="rounded-full p-0.5 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => onRemoveAuthor(authorName)}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <Input
            id="source-code-author-input"
            placeholder="Nhập họ và tên tác giả và nhấn Enter..."
            value={authorInput}
            disabled={disabled}
            onKeyDown={handleAuthorKeyDown}
            onChange={(e) => setAuthorInput(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={disabled || !authorInput.trim()}
            onClick={handleAddAuthor}
            aria-label="Thêm tác giả"
          >
            <Plus className="size-4 mr-1" aria-hidden="true" />
            Thêm
          </Button>
        </div>
        <p className="text-[11px] text-text-muted">
          Nhập họ và tên từng tác giả thực hiện dự án và nhấn Enter hoặc nút Thêm.
        </p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </div>
  );
}

export default SourceCodeAuthorsSection;
