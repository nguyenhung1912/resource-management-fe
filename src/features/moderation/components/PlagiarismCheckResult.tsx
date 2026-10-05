import { CheckCircle2, Clock3, FileWarning } from 'lucide-react';
import type { PlagiarismCheckResponse } from '../types/moderation.types';

interface PlagiarismCheckResultProps {
  result: PlagiarismCheckResponse;
}

function formatCheckedAt(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString('vi-VN');
}

export function PlagiarismCheckResult({ result }: PlagiarismCheckResultProps) {
  const chunks = result.matchedChunks ?? [];
  const similarity = result.similarityRate ?? result.similarityScore ?? 0;
  const checkedAt = formatCheckedAt(result.checkedAt);

  return (
    <section
      aria-label={`Kết quả kiểm tra trùng lặp ${result.fileName ?? ''}`}
      className="mt-3 rounded-xl border border-border-subtle bg-background p-3 text-xs"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-semibold text-text-main">Tỷ lệ tương đồng: {similarity.toFixed(2)}%</span>
        <span
          className={
            result.isPlagiarism
              ? 'inline-flex items-center gap-1 text-danger'
              : 'inline-flex items-center gap-1 text-success'
          }
        >
          {result.isPlagiarism ? (
            <FileWarning className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {result.isPlagiarism ? 'Phát hiện trùng lặp' : 'Không phát hiện trùng lặp'}
        </span>
        <span className="text-text-muted">
          {result.matchedChunksCount ?? chunks.length}/{result.totalChunksCount ?? chunks.length} đoạn khớp
        </span>
        {typeof result.processingTimeMs === 'number' && (
          <span className="inline-flex items-center gap-1 text-text-muted">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {(result.processingTimeMs / 1000).toFixed(2)} giây
          </span>
        )}
        {checkedAt && <span className="text-text-muted">Kiểm tra lúc {checkedAt}</span>}
      </div>

      {chunks.length > 0 && (
        <ol className="mt-3 space-y-2">
          {chunks.map((chunk, index) => (
            <li
              key={`${chunk.chunkIndex ?? index}-${chunk.matchedWithFileId ?? 'source'}`}
              className="rounded-lg border border-border-subtle bg-surface p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-text-main">Đoạn #{chunk.chunkIndex ?? index + 1}</span>
                {typeof chunk.cosineSimilarity === 'number' && (
                  <span className="font-medium text-primary">
                    Tương đồng {(chunk.cosineSimilarity * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="mt-1 text-text-muted">
                {chunk.snippet ?? chunk.contentSnippet ?? 'Không có nội dung trích dẫn.'}
              </p>
              <p className="mt-1 text-text-muted">
                Nguồn: {chunk.matchedWithFileName ?? chunk.sourceFileName ?? 'Không rõ'}
              </p>
            </li>
          ))}
        </ol>
      )}
      {chunks.length === 0 && <p className="mt-2 text-text-muted">Không có đoạn nội dung khớp.</p>}
    </section>
  );
}
