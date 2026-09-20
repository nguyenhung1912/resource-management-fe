import type { BadgeProps } from '@/components/ui/Badge';
import type { SourceCodeItem, SourceCodeStats } from '@/features/digital-resources/source-code/types/source-code.types';

export interface StatusBadgeConfig {
  variant: NonNullable<BadgeProps['variant']>;
  label: string;
  dotClassName: string;
}

export function getSourceCodeStatusBadge(statusId: number, statusName?: string | null): StatusBadgeConfig {
  const normalized = (statusName || '').trim().toLowerCase();

  if (statusId === 2 || /approved|đã duyệt|phê duyệt/i.test(normalized)) {
    return {
      variant: 'success',
      label: statusName?.trim() || 'Đã duyệt',
      dotClassName: 'bg-success',
    };
  }
  if (statusId === 1 || /pending|chờ duyệt/i.test(normalized)) {
    return {
      variant: 'warning',
      label: statusName?.trim() || 'Chờ duyệt',
      dotClassName: 'bg-warning',
    };
  }
  if (statusId === 3 || /rejected|từ chối/i.test(normalized)) {
    return {
      variant: 'danger',
      label: statusName?.trim() || 'Bị từ chối',
      dotClassName: 'bg-danger',
    };
  }

  return {
    variant: 'neutral',
    label: statusName?.trim() || 'Không xác định',
    dotClassName: 'bg-text-muted',
  };
}

export function isValidGithubUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return (parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com') && parsed.pathname.length > 1;
  } catch {
    return false;
  }
}

export function calculateSourceCodeStats(items: SourceCodeItem[], totalCount: number): SourceCodeStats {
  const uniqueSubMajors = new Set<string>();
  let withGithubCount = 0;
  let approvedCount = 0;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (isValidGithubUrl(item.githubLink)) {
      withGithubCount += 1;
    }
    if (item.subMajorCode?.trim()) {
      uniqueSubMajors.add(item.subMajorCode.trim());
    }
    const isApproved =
      item.fileStatusId === 2 ||
      (typeof item.fileStatusName === 'string' && /approved|đã duyệt|phê duyệt/i.test(item.fileStatusName));
    if (isApproved) {
      approvedCount += 1;
    }
  }

  return {
    totalCount,
    withGithubCount,
    subMajorsCount: uniqueSubMajors.size,
    approvedCount,
  };
}

export function formatYearCompleted(year?: number | null): string {
  if (!year || year <= 0) return 'N/A';
  return String(year);
}

export function formatAuthors(authors?: { fullName: string }[] | null): string {
  if (!authors || authors.length === 0) return 'Chưa có tác giả';
  return authors.map((a) => a.fullName).join(', ');
}
