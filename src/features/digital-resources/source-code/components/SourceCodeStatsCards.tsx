import { CheckCircle2, Code2, GitBranch, Layers } from 'lucide-react';
import type { SourceCodeStats } from '@/features/digital-resources/source-code/types/source-code.types';
import { cn } from '@/utils/cn';

export interface SourceCodeStatsCardsProps {
  stats: SourceCodeStats;
  onFilterGithub?: () => void;
  onFilterApproved?: () => void;
  className?: string;
}

export function SourceCodeStatsCards({
  stats,
  onFilterGithub,
  onFilterApproved,
  className,
}: SourceCodeStatsCardsProps) {
  const total = stats.totalCount;
  const githubRate = total > 0 ? Math.round((stats.withGithubCount / total) * 100) : 0;
  const approvedRate = total > 0 ? Math.round((stats.approvedCount / total) * 100) : 0;

  return (
    <section aria-label="Thống kê kho mã nguồn" className={className}>
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-xs">
        {/* 1. Header telemetry */}
        <div className="flex flex-col gap-2.5 border-b border-border-subtle bg-gray-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              TỔNG QUAN KHO MÃ NGUỒN
            </span>
          </div>

          {total > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                <span className="font-medium text-emerald-600">{githubRate}% có GitHub repo</span>
                <span>•</span>
                <span className="font-medium text-blue-600">{approvedRate}% đã phê duyệt</span>
              </div>
              <div
                className="flex h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-gray-200/80"
                title={`Phân bổ: ${githubRate}% có GitHub repo, ${approvedRate}% đã phê duyệt`}
              >
                <div style={{ width: `${githubRate}%` }} className="bg-emerald-500 transition-all duration-300" />
                <div style={{ width: `${approvedRate}%` }} className="bg-primary transition-all duration-300" />
              </div>
            </div>
          )}
        </div>

        {/* 2. Dãy 4 khối chỉ số */}
        <div className="grid grid-cols-2 divide-y divide-border-subtle sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {/* Khối 1: Tổng số dự án */}
          <div className="flex flex-col justify-between p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-muted">Tổng số dự án</span>
              <Code2 className="size-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">
                {stats.totalCount}
              </span>
              <span className="text-xs text-text-muted">dự án</span>
            </div>
            <p className="mt-2 text-[11px] text-text-muted">Tất cả học liệu mã nguồn</p>
          </div>

          {/* Khối 2: Có GitHub Repository */}
          <button
            type="button"
            onClick={onFilterGithub}
            aria-label="Dự án có liên kết GitHub"
            className={cn(
              'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
              onFilterGithub
                ? 'cursor-pointer hover:bg-emerald-50/20 border-b-2 border-transparent hover:border-emerald-500'
                : '',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-muted">Có GitHub Repository</span>
              <GitBranch className="size-4 text-emerald-600 transition-colors group-hover:scale-110" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">
                {stats.withGithubCount}
              </span>
              {total > 0 && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
                  {githubRate}%
                </span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-text-muted">Mã nguồn mở công khai</p>
          </button>

          {/* Khối 3: Chuyên ngành */}
          <div className="flex flex-col justify-between p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-muted">Chuyên ngành</span>
              <Layers className="size-4 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">
                {stats.subMajorsCount}
              </span>
              <span className="text-xs text-text-muted">ngành</span>
            </div>
            <p className="mt-2 text-[11px] text-text-muted">Phân bổ theo lĩnh vực đào tạo</p>
          </div>

          {/* Khối 4: Đã kiểm duyệt */}
          <button
            type="button"
            onClick={onFilterApproved}
            aria-label="Số lượng dự án đã được phê duyệt"
            className={cn(
              'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
              onFilterApproved
                ? 'cursor-pointer hover:bg-blue-50/20 border-b-2 border-transparent hover:border-primary'
                : '',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-muted">Đã kiểm duyệt</span>
              <CheckCircle2 className="size-4 text-primary transition-colors group-hover:scale-110" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">
                {stats.approvedCount}
              </span>
              {total > 0 && (
                <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-primary">
                  {approvedRate}%
                </span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-text-muted">Đã phê duyệt chính thức</p>
          </button>
        </div>
      </div>
    </section>
  );
}

export default SourceCodeStatsCards;
