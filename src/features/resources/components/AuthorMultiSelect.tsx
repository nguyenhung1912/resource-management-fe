import { useId, useMemo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { SelectOption } from '@/features/resources/types/resource.types';

interface AuthorMultiSelectProps {
  id: string;
  options: SelectOption<string>[];
  selectedIds: string[];
  error?: string;
  disabled?: boolean;
  onChange: (authorIds: string[]) => void;
}

export function AuthorMultiSelect({
  id,
  options,
  selectedIds,
  error,
  disabled = false,
  onChange,
}: AuthorMultiSelectProps) {
  const optionIdPrefix = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(option.value)),
    [options, selectedSet],
  );
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    if (!normalizedQuery) return options;
    return options.filter((option) => option.label.toLocaleLowerCase('vi').includes(normalizedQuery));
  }, [options, query]);

  const toggleAuthor = (authorId: string) => {
    onChange(
      selectedSet.has(authorId) ? selectedIds.filter((idValue) => idValue !== authorId) : [...selectedIds, authorId],
    );
  };

  return (
    <div className="relative space-y-1.5">
      <Button
        id={id}
        type="button"
        variant="secondary"
        disabled={disabled}
        aria-label="Chọn tác giả"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn('w-full justify-between font-normal', selectedIds.length === 0 && 'text-text-muted')}
        onClick={() => setIsOpen((current) => !current)}
      >
        {selectedIds.length > 0 ? `Đã chọn ${selectedIds.length} tác giả` : 'Chọn tác giả'}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
      </Button>

      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((author) => (
            <span
              key={author.value}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              <span className="truncate">{author.label}</span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Bỏ chọn ${author.label}`}
                className="rounded-full outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
                onClick={() => toggleAuthor(author.value)}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {isOpen ? (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border-subtle bg-surface p-2 shadow-lg">
          <Input
            type="search"
            inputSize="sm"
            aria-label="Tìm tác giả"
            placeholder="Tìm theo tên tác giả..."
            value={query}
            iconLeft={<Search className="h-4 w-4" />}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div role="listbox" aria-multiselectable="true" className="mt-2 max-h-44 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((author, index) => {
                const isSelected = selectedSet.has(author.value);
                const optionId = `${optionIdPrefix}-${index}`;
                return (
                  <label
                    key={author.value}
                    htmlFor={optionId}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-text-main hover:bg-background"
                  >
                    <input
                      id={optionId}
                      type="checkbox"
                      checked={isSelected}
                      className="sr-only"
                      onChange={() => toggleAuthor(author.value)}
                    />
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-sm border border-border-subtle',
                        isSelected && 'border-primary bg-primary text-white',
                      )}
                      aria-hidden="true"
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="truncate">{author.label}</span>
                  </label>
                );
              })
            ) : (
              <p className="px-2.5 py-4 text-center text-xs text-text-muted">Không tìm thấy tác giả phù hợp.</p>
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs leading-tight text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
