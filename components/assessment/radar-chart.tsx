'use client';

import { memo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Dot,
} from 'recharts';
import { DIMENSION_LABELS, type Dimension } from '@/lib/assessment-types';

interface ResilienceRadarChartProps {
  data: Record<Dimension, number>;
  showTooltip?: boolean;
  height?: number;
}

const RADAR_BLUE = '#4da6e0';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RadarDot(props: any) {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={RADAR_BLUE}
      stroke="#ffffff"
      strokeWidth={2}
    />
  );
}

export const ResilienceRadarChart = memo(function ResilienceRadarChart({
  data,
  showTooltip = true,
  height = 300,
}: ResilienceRadarChartProps) {
  const chartData = (Object.keys(DIMENSION_LABELS) as Dimension[]).map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    value: data[dim],
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
        <PolarGrid stroke="#d1d5db" strokeWidth={1} />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickCount={5}
          stroke="transparent"
          axisLine={false}
        />
        <Radar
          name="韌性分數"
          dataKey="value"
          stroke={RADAR_BLUE}
          fill={RADAR_BLUE}
          fillOpacity={0.08}
          strokeWidth={2}
          dot={<RadarDot />}
        />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            formatter={(value: number) => [`${value}%`, '得分']}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
});
