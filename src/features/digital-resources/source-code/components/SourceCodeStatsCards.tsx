import { CheckCircle2, Code2, GitBranch, Layers } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { StatCardsGroup } from '@/components/common/StatCardsGroup';
import type { SourceCodeStats } from '@/features/digital-resources/source-code/types/source-code.types';

export interface SourceCodeStatsCardsProps {
  stats: SourceCodeStats;
  onFilterGithub?: () => void;
  onFilterApproved?: () => void;
}

export function SourceCodeStatsCards({ stats, onFilterGithub, onFilterApproved }: SourceCodeStatsCardsProps) {
  return (
    <section aria-label="Thống kê kho mã nguồn">
      <StatCardsGroup columns={4}>
        <StatCard
          label="Tổng số dự án"
          value={stats.totalCount}
          unit="dự án"
          detail="Tất cả học liệu mã nguồn"
          icon={Code2}
          colorVariant="primary"
          ariaLabel="Tổng số dự án mã nguồn"
        />

        <StatCard
          label="Có GitHub Repository"
          value={stats.withGithubCount}
          unit="repo"
          detail="Mã nguồn mở công khai"
          icon={GitBranch}
          colorVariant="success"
          onClick={onFilterGithub}
          ariaLabel="Dự án có liên kết GitHub"
        />

        <StatCard
          label="Chuyên ngành"
          value={stats.subMajorsCount}
          unit="ngành"
          detail="Phân bổ lĩnh vực"
          icon={Layers}
          colorVariant="warning"
          ariaLabel="Số chuyên ngành tham gia"
        />

        <StatCard
          label="Đã kiểm duyệt"
          value={stats.approvedCount}
          unit="dự án"
          detail="Đã phê duyệt chính thức"
          icon={CheckCircle2}
          colorVariant="neutral"
          onClick={onFilterApproved}
          ariaLabel="Số lượng dự án đã được phê duyệt"
        />
      </StatCardsGroup>
    </section>
  );
}

export default SourceCodeStatsCards;
