import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface AuthorInputProps {
  id: string;
  authorNames: string[];
  error?: string;
  disabled?: boolean;
  onChange: (authorNames: string[]) => void;
}

export function AuthorInput({ id, authorNames, error, disabled = false, onChange }: AuthorInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addAuthor = () => {
    const authorName = inputValue.trim();
    if (!authorName) return;

    const normalizedName = authorName.toLocaleLowerCase('vi-VN');
    const isDuplicate = authorNames.some((existingName) => existingName.toLocaleLowerCase('vi-VN') === normalizedName);

    if (!isDuplicate) {
      onChange([...authorNames, authorName]);
    }
    setInputValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    addAuthor();
  };

  const removeAuthor = (authorName: string) => {
    onChange(authorNames.filter((existingName) => existingName !== authorName));
  };

  return (
    <div className="space-y-2">
      {authorNames.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Danh sách tác giả">
          {authorNames.map((authorName) => (
            <span
              key={authorName}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/50 bg-blue-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-primary"
            >
              {authorName}
              <button
                type="button"
                aria-label={`Xóa tác giả ${authorName}`}
                disabled={disabled}
                className="rounded-full p-0.5 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => removeAuthor(authorName)}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <Input
        id={id}
        aria-label="Nhập tác giả"
        placeholder="Nhập tên tác giả và nhấn Enter..."
        value={inputValue}
        error={error}
        helperText="Nhấn Enter để thêm tác giả."
        disabled={disabled}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default AuthorInput;
