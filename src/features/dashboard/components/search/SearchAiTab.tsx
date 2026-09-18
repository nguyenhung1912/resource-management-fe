import { Sparkles } from 'lucide-react';
import { AI_SUGGESTIONS } from '../../constants/search.constants';

export interface SearchAiTabProps {
  onSelectSuggestion: (prompt: string) => void;
}

export function SearchAiTab({ onSelectSuggestion }: SearchAiTabProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shrink-0 shadow-xs">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-main">Hỏi đáp & Tra cứu Ngữ nghĩa cùng AI</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Mô hình AI sẽ tự động phân tích tóm tắt nội dung tài liệu, phát hiện tương đồng và gợi ý tài liệu học tập
            chính xác nhất.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted">Gợi ý câu hỏi phổ biến:</p>
        <div className="flex flex-wrap gap-2">
          {AI_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              className="rounded-lg border border-primary/20 bg-surface px-3 py-1.5 text-xs font-medium text-text-main hover:border-primary hover:text-primary transition-all shadow-2xs cursor-pointer"
            >
              ✨ {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchAiTab;
