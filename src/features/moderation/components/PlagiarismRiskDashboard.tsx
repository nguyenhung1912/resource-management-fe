import { cn } from '@/utils/cn';
import type { PlagiarismOverviewStats, PlagiarismRiskLevel } from '../types/plagiarism-report.types';

export interface PlagiarismRiskDashboardProps {
  stats: PlagiarismOverviewStats;
  activeRiskLevel?: PlagiarismRiskLevel;
  onSelectRiskLevel?: (riskLevel?: PlagiarismRiskLevel) => void;
  className?: string;
}

// SVG Donut Helpers
const SVG_SIZE = 160;
const SVG_CENTER = SVG_SIZE / 2;
const RADIUS = 58;
const STROKE_WIDTH = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2; // pixel gap giữa các segments

interface DonutSegment {
  color: string;
  count: number;
  label: string;
}

function buildDonutSegments(stats: PlagiarismOverviewStats): DonutSegment[] {
  return [
    { color: '#15A34A', count: stats.safeCount, label: 'An toàn' },
    { color: '#F97316', count: stats.warningCount, label: 'Cần lưu ý' },
    { color: '#DC2626', count: stats.dangerCount, label: 'Nguy hiểm' },
    { color: '#D1D5DB', count: stats.totalUnscanned, label: 'Chưa quét' },
  ];
}

// Zone A: SVG Donut Ring

function DonutRing({ stats }: { stats: PlagiarismOverviewStats }) {
  const segments = buildDonutSegments(stats);
  const total = stats.totalFiles;

  // Tránh chia cho 0 khi chưa có dữ liệu
  if (total === 0) {
    return (
      <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} aria-hidden="true">
        <circle cx={SVG_CENTER} cy={SVG_CENTER} r={RADIUS} fill="none" stroke="#E4E4E4" strokeWidth={STROKE_WIDTH} />
        <text x={SVG_CENTER} y={SVG_CENTER - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1A1A1A">
          0
        </text>
        <text x={SVG_CENTER} y={SVG_CENTER + 14} textAnchor="middle" fontSize="11" fill="#71717A">
          tài liệu
        </text>
      </svg>
    );
  }

  // Tính startAngle cho từng segment theo cách immutable (dùng reduce, không mutate biến ngoài .map)
  interface SegmentGeometry {
    seg: DonutSegment;
    startAngle: number;
    arcLength: number;
  }

  const { result: segmentsWithAngles } = segments
    .filter((seg) => seg.count > 0)
    .reduce<{ result: SegmentGeometry[]; angleAcc: number }>(
      ({ result, angleAcc }, seg) => {
        const pct = seg.count / total;
        const arcLength = Math.max(0, pct * CIRCUMFERENCE - GAP);
        return {
          result: [...result, { seg, startAngle: angleAcc - 90, arcLength }],
          angleAcc: angleAcc + pct * 360,
        };
      },
      { result: [], angleAcc: 0 },
    );

  const renderedSegments = segmentsWithAngles.map(({ seg, startAngle, arcLength }, idx) => (
    <circle
      key={idx}
      cx={SVG_CENTER}
      cy={SVG_CENTER}
      r={RADIUS}
      fill="none"
      stroke={seg.color}
      strokeWidth={STROKE_WIDTH}
      strokeDasharray={`${arcLength} ${CIRCUMFERENCE - arcLength}`}
      strokeLinecap="butt"
      transform={`rotate(${startAngle} ${SVG_CENTER} ${SVG_CENTER})`}
      style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
    />
  ));

  return (
    <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} aria-hidden="true" role="img">
      {/* Track nền */}
      <circle cx={SVG_CENTER} cy={SVG_CENTER} r={RADIUS} fill="none" stroke="#F3F4F6" strokeWidth={STROKE_WIDTH} />

      {/* Các segments màu */}
      {renderedSegments}

      {/* Center: Total Docs */}
      <text
        x={SVG_CENTER}
        y={SVG_CENTER - 8}
        textAnchor="middle"
        fontSize="26"
        fontWeight="700"
        fill="#1A1A1A"
        fontFamily="Inter, sans-serif"
      >
        {total.toLocaleString('vi-VN')}
      </text>
      <text
        x={SVG_CENTER}
        y={SVG_CENTER + 12}
        textAnchor="middle"
        fontSize="11"
        fill="#71717A"
        fontFamily="Inter, sans-serif"
      >
        tài liệu
      </text>
      <text
        x={SVG_CENTER}
        y={SVG_CENTER + 26}
        textAnchor="middle"
        fontSize="10"
        fill="#A0A0A0"
        fontFamily="Inter, sans-serif"
      >
        trong hệ thống
      </text>
    </svg>
  );
}

// Zone B
function VerticalBar({ stats }: { stats: PlagiarismOverviewStats }) {
  const total = stats.totalFiles;
  const segments = buildDonutSegments(stats).filter((s) => s.count > 0);

  if (total === 0) {
    return (
      <div className="h-42 w-full rounded-xl bg-gray-100 flex items-center justify-center">
        <span className="text-[11px] text-text-muted">Không có dữ liệu</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-42 w-full rounded-xl overflow-hidden" aria-hidden="true">
      {segments.map((seg, idx) => {
        const pct = (seg.count / total) * 100;
        const minPct = 12; // min height để label đọc được
        const displayPct = Math.max(pct, minPct);

        return (
          <div
            key={idx}
            className="flex items-center justify-center relative shrink-0"
            style={{
              flex: `${displayPct} 0 0%`,
              backgroundColor: seg.color,
            }}
          >
            <span className="text-white text-[11px] font-semibold leading-tight text-center px-1 select-none">
              {seg.label}
              <br />
              {Math.round(pct)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Zone C
interface StatRow {
  label: string;
  value: number;
  total: number;
  dotColor: string;
  barColor: string;
  riskLevel?: PlagiarismRiskLevel;
  unit?: string;
}

function StatRowItem({
  label,
  value,
  total,
  dotColor,
  barColor,
  riskLevel,
  isActive,
  onSelect,
  unit = 'tài liệu',
}: StatRow & {
  isActive?: boolean;
  onSelect?: (level?: PlagiarismRiskLevel) => void;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const isInteractive = Boolean(onSelect);

  return (
    <div
      onClick={() => isInteractive && onSelect?.(isActive ? undefined : riskLevel)}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect?.(isActive ? undefined : riskLevel);
        }
      }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={cn(
        'space-y-1 p-1.5 rounded-lg transition-colors',
        isInteractive ? 'cursor-pointer hover:bg-background/80' : undefined,
        isActive ? 'bg-primary/5 ring-1 ring-primary/30 font-medium' : undefined,
      )}
      aria-label={`Bộ lọc ${label}: ${value} ${unit}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn('h-2 w-2 rounded-full shrink-0', dotColor)} aria-hidden="true" />
          <span className="text-xs text-text-muted truncate">{label}</span>
        </div>
        <span className="text-xs font-semibold text-text-main tabular-nums shrink-0">
          {value.toLocaleString('vi-VN')}
          <span className="text-text-muted font-normal ml-1 text-[11px]">{unit}</span>
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${pct}%` }}
          aria-label={`${pct}%`}
        />
      </div>
    </div>
  );
}

function StatsPanel({
  stats,
  activeRiskLevel,
  onSelectRiskLevel,
}: {
  stats: PlagiarismOverviewStats;
  activeRiskLevel?: PlagiarismRiskLevel;
  onSelectRiskLevel?: (level?: PlagiarismRiskLevel) => void;
}) {
  const rows: StatRow[] = [
    {
      label: 'Tổng tài liệu',
      value: stats.totalFiles,
      total: stats.totalFiles,
      dotColor: 'bg-primary',
      barColor: 'bg-primary',
      riskLevel: undefined,
    },
    {
      label: 'Đã quét',
      value: stats.totalScanned,
      total: stats.totalFiles,
      dotColor: 'bg-primary',
      barColor: 'bg-primary',
      riskLevel: undefined,
    },
    {
      label: 'An toàn (< 20%)',
      value: stats.safeCount,
      total: stats.totalFiles,
      dotColor: 'bg-success',
      barColor: 'bg-success',
      riskLevel: 'safe',
    },
    {
      label: 'Cần xem xét (≥ 20%)',
      value: stats.warningCount + stats.dangerCount,
      total: stats.totalFiles,
      dotColor: 'bg-warning',
      barColor: 'bg-warning',
      riskLevel: 'warning',
    },
    {
      label: 'Nguy cơ cao (> 30%)',
      value: stats.dangerCount,
      total: stats.totalFiles,
      dotColor: 'bg-danger',
      barColor: 'bg-danger',
      riskLevel: 'danger',
    },
    {
      label: 'Chưa quét',
      value: stats.totalUnscanned,
      total: stats.totalFiles,
      dotColor: 'bg-gray-400',
      barColor: 'bg-gray-400',
      riskLevel: 'unchecked',
    },
  ];

  return (
    <div className="space-y-1.5">
      {rows.map((row) => (
        <StatRowItem
          key={row.label}
          {...row}
          isActive={row.riskLevel !== undefined && activeRiskLevel === row.riskLevel}
          onSelect={row.riskLevel !== undefined ? onSelectRiskLevel : undefined}
        />
      ))}
    </div>
  );
}

// Legend
const LEGEND_ITEMS: { color: string; label: string; riskLevel: PlagiarismRiskLevel }[] = [
  { color: '#15A34A', label: 'An toàn', riskLevel: 'safe' },
  { color: '#F97316', label: 'Cần lưu ý', riskLevel: 'warning' },
  { color: '#DC2626', label: 'Nguy hiểm', riskLevel: 'danger' },
  { color: '#D1D5DB', label: 'Chưa quét', riskLevel: 'unchecked' },
];

function DonutLegend({
  activeRiskLevel,
  onSelectRiskLevel,
}: {
  activeRiskLevel?: PlagiarismRiskLevel;
  onSelectRiskLevel?: (level?: PlagiarismRiskLevel) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 justify-center mt-1">
      {LEGEND_ITEMS.map(({ color, label, riskLevel }) => {
        const isActive = activeRiskLevel === riskLevel;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelectRiskLevel?.(isActive ? undefined : riskLevel)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors border',
              isActive
                ? 'bg-primary/10 border-primary/40 font-semibold text-text-main shadow-2xs'
                : 'border-transparent text-text-muted hover:bg-background',
            )}
            title={`Lọc theo: ${label}`}
          >
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
            <span className="text-[11px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Main Component
export function PlagiarismRiskDashboard({
  stats,
  activeRiskLevel,
  onSelectRiskLevel,
  className,
}: PlagiarismRiskDashboardProps) {
  return (
    <div
      className={cn('bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-xs', className)}
      role="region"
      aria-label="Thống kê phân tích đạo văn AI"
    >
      {/* Panel header */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-text-main">Phân bố Mức độ Rủi ro</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Tổng quan tỷ lệ trùng lặp AI của{' '}
          <span className="font-semibold text-text-main">{stats.totalFiles.toLocaleString('vi-VN')}</span> tài liệu
          trong hệ thống
        </p>
      </div>

      {/* 3-zone grid */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-stretch">
        {/* Zone A — Donut Ring + Legend */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <DonutRing stats={stats} />
          <DonutLegend activeRiskLevel={activeRiskLevel} onSelectRiskLevel={onSelectRiskLevel} />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-border-subtle self-stretch shrink-0" aria-hidden="true" />

        {/* Zone B — Vertical Segmented Bar (ẩn trên mobile) */}
        <div className="hidden xl:flex flex-col items-center gap-2 w-16 shrink-0">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Phân bổ</span>
          <VerticalBar stats={stats} />
        </div>

        {/* Divider */}
        <div className="hidden xl:block w-px bg-border-subtle self-stretch shrink-0" aria-hidden="true" />

        {/* Zone C — Stat Rows */}
        <div className="flex-1 min-w-0 w-full">
          <StatsPanel stats={stats} activeRiskLevel={activeRiskLevel} onSelectRiskLevel={onSelectRiskLevel} />
        </div>
      </div>
    </div>
  );
}

export default PlagiarismRiskDashboard;
