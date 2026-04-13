'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { AssessmentResult } from '@/lib/assessment-types';

interface HistoryLineChartProps {
  assessments: AssessmentResult[];
  height?: number;
}

export function HistoryLineChart({ assessments, height = 250 }: HistoryLineChartProps) {
  const chartData = assessments.map((assessment, index) => ({
    name: `T${index}`,
    date: new Date(assessment.date).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    }),
    總分: assessment.totalScore,
    收支管理: assessment.dimensionPercentages.A,
    儲蓄準備: assessment.dimensionPercentages.B,
    借貸管理: assessment.dimensionPercentages.C,
    財務規劃: assessment.dimensionPercentages.D,
    保險保障: assessment.dimensionPercentages.E,
    支持系統: assessment.dimensionPercentages.F,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          stroke="hsl(var(--border))"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          stroke="hsl(var(--border))"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          type="monotone"
          dataKey="總分"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
