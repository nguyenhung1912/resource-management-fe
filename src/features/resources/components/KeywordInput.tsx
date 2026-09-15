import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface KeywordInputProps {
  id: string;
  keywords: string[];
  disabled?: boolean;
  onChange: (keywords: string[]) => void;
}

export function KeywordInput({ id, keywords, disabled = false, onChange }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addKeyword = () => {
    const keyword = inputValue.trim();
    if (!keyword) return;

    const normalizedKeyword = keyword.toLocaleLowerCase('vi-VN');
    const isDuplicate = keywords.some(
      (existingKeyword) => existingKeyword.toLocaleLowerCase('vi-VN') === normalizedKeyword,
    );

    if (!isDuplicate) {
      onChange([...keywords, keyword]);
    }
    setInputValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    addKeyword();
  };

  const removeKeyword = (keyword: string) => {
    onChange(keywords.filter((existingKeyword) => existingKeyword !== keyword));
  };

  return (
    <div className="space-y-2">
      {keywords.length > 0 ? (
        <ul aria-label="Danh sách từ khóa" className="flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <li
              key={keyword}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 py-1 pl-2.5 pr-1.5 text-xs font-medium text-primary"
            >
              {keyword}
              <button
                type="button"
                aria-label={`Xóa từ khóa ${keyword}`}
                disabled={disabled}
                className="rounded-full p-0.5 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => removeKeyword(keyword)}
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Input
        id={id}
        aria-label="Nhập từ khóa"
        placeholder="Nhập từ khóa và nhấn Enter..."
        value={inputValue}
        helperText="Nhấn Enter để thêm từ khóa."
        disabled={disabled}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default KeywordInput;
