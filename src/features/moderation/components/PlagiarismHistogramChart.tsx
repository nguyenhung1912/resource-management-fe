import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RectangleProps } from 'recharts';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PlagiarismHistogramBucket, PlagiarismRiskLevel } from '../types/plagiarism-report.types';

export interface PlagiarismHistogramChartProps {
  histogram: PlagiarismHistogramBucket[];
  className?: string;
}

const RISK_BAR_COLORS: Record<PlagiarismRiskLevel, string> = {
  safe: '#15A34A',
  warning: '#F97316',
  danger: '#DC2626',
  unchecked: '#D1D5DB',
};

const RISK_LABELS: Record<PlagiarismRiskLevel, string> = {
  safe: 'An toàn',
  warning: 'Cần lưu ý',
  danger: 'Nguy hiểm',
  unchecked: 'Chưa quét',
};

interface ChartTooltipPayloadItem {
  value?: number;
  payload?: PlagiarismHistogramBucket;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  const bucket = data.payload;
  if (!bucket) return null;

  return (
    <div className="bg-surface border border-border-subtle rounded-xl shadow-md px-3 py-2.5 text-xs space-y-1 min-w-35">
      <p className="font-semibold text-text-main">{label}</p>
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: RISK_BAR_COLORS[bucket.riskLevel] }}
          aria-hidden="true"
        />
        <span className="text-text-muted">{RISK_LABELS[bucket.riskLevel]}</span>
      </div>

      <p className="text-text-main font-bold text-sm">
        {data.value?.toLocaleString('vi-VN')} <span className="font-normal text-xs text-text-muted">tài liệu</span>
      </p>
    </div>
  );
}

interface BarLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}

function BarTopLabel({ x = 0, y = 0, width = 0, value = 0 }: BarLabelProps) {
  if (value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={11} fill="#71717A" fontFamily="Inter, sans-serif">
      {value}
    </text>
  );
}

interface CustomBarShapeProps extends RectangleProps {
  payload?: PlagiarismHistogramBucket;
}

function CustomBarShape(props: CustomBarShapeProps) {
  const { payload, ...rest } = props;
  const fillColor = payload?.riskLevel ? RISK_BAR_COLORS[payload.riskLevel] : '#256EFF';

  return <Rectangle {...rest} fill={fillColor} fillOpacity={0.85} radius={rest.radius ?? [6, 6, 0, 0]} />;
}

function EmptyHistogram() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 space-y-2">
      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text-main">Chưa có dữ liệu phân tích</p>
      <p className="text-xs text-text-muted text-center max-w-60">
        Biểu đồ sẽ hiển thị sau khi tài liệu được quét lần đầu.
      </p>
    </div>
  );
}

export function PlagiarismHistogramChart({ histogram, className }: PlagiarismHistogramChartProps) {
  const hasData = histogram.some((b) => b.count > 0);

  return (
    <div
      className={cn('bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-xs', className)}
      role="region"
      aria-label="Biểu đồ phân bố tỷ lệ trùng lặp AI"
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-text-main">Phân bố Tỷ lệ Trùng lặp</h2>
        <p className="text-xs text-text-muted mt-0.5">Số lượng tài liệu theo từng ngưỡng tương đồng AI</p>
      </div>

      {/* Chart area */}
      <div className="h-50 w-full">
        {!hasData ? (
          <EmptyHistogram />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram} margin={{ top: 18, right: 8, left: -28, bottom: 0 }} barCategoryGap="28%">
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: '#71717A', fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#71717A', fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', radius: 6 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} label={<BarTopLabel />} shape={<CustomBarShape />} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {(Object.entries(RISK_BAR_COLORS) as [PlagiarismRiskLevel, string][])
          .filter(([level]) => level !== 'unchecked')
          .map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
              <span className="text-[11px] text-text-muted">{RISK_LABELS[level]}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default PlagiarismHistogramChart;
