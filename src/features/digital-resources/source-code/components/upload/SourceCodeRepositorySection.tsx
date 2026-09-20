import { GitBranch } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export interface SourceCodeRepositorySectionProps {
  githubLink: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onClearError: () => void;
}

export function SourceCodeRepositorySection({
  githubLink,
  error,
  disabled = false,
  onChange,
  onClearError,
}: SourceCodeRepositorySectionProps) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <GitBranch className="size-4 text-primary" aria-hidden="true" />
        <Label htmlFor="source-code-github" className="text-xs font-semibold text-text-main">
          Kho lưu trữ GitHub (Repository URL)
        </Label>
      </div>
      <Input
        id="source-code-github"
        placeholder="https://github.com/username/project-repository"
        value={githubLink}
        error={error}
        helperText="Đính kèm link repository công khai để người học xem trực tiếp commit, sao lưu và cấu trúc code."
        disabled={disabled}
        iconLeft={<GitBranch className="size-4 text-primary" />}
        onChange={(e) => {
          onChange(e.target.value);
          onClearError();
        }}
      />
    </div>
  );
}

export default SourceCodeRepositorySection;
