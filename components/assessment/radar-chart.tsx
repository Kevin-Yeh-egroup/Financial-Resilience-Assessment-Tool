'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DIMENSION_LABELS, type Dimension } from '@/lib/assessment-types';

interface ResilienceRadarChartProps {
  data: Record<Dimension, number>;
  showTooltip?: boolean;
  height?: number;
}

export function ResilienceRadarChart({
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
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="韌性分數"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: number) => [`${value}%`, '得分']}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
