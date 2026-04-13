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
    name: assessment.sessionLabel ?? `T${index}`,
    date: new Date(assessment.date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    總分: assessment.totalScore,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          stroke="#e5e7eb"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          stroke="#e5e7eb"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
          labelStyle={{ color: '#111827' }}
          labelFormatter={(label) => {
            const item = chartData.find((d) => d.name === label);
            return item ? `${label}（${item.date}）` : label;
          }}
          formatter={(value: number) => [`${value} 分`, '總分']}
        />
        <Line
          type="monotone"
          dataKey="總分"
          stroke="#4da6e0"
          strokeWidth={2.5}
          dot={{ fill: '#4da6e0', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
          activeDot={{ r: 7, stroke: '#4da6e0', strokeWidth: 2, fill: '#ffffff' }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
