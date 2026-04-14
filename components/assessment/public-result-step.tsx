'use client';

import { usePublicAssessmentStore } from '@/lib/assessment-store';
import { DIMENSION_LABELS, DIMENSION_DESCRIPTIONS, RESILIENCE_LEVELS, type Dimension } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ResilienceRadarChart } from './radar-chart';
import { Download, RefreshCw, Phone, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const NEXT_STEP_TOOLS = [
  {
    emoji: '🤖',
    label: '問問 AI',
    href: 'https://www.familyfinhealth.com/social-worker/ask-ivy',
  },
  {
    emoji: '💬',
    label: '線上財務諮詢',
    href: 'https://www.familyfinhealth.com/social-worker/online-consultation',
  },
  {
    emoji: '📒',
    label: '財務生活記帳助理',
    href: 'https://www.familyfinhealth.com/toolbox/financial-calculator/basic-accounting-preview',
  },
  {
    emoji: '📚',
    label: '專業知識庫',
    href: 'https://www.familyfinhealth.com/knowledge-base',
  },
];

export function PublicResultStep() {
  const { result, userProfile, reset } = usePublicAssessmentStore();

  if (!result) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">尚無評估結果</p>
          <Button onClick={reset} className="mt-4">
            重新開始評估
          </Button>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = RESILIENCE_LEVELS[result.level];

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-success" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-warning" />;
    return <TrendingDown className="w-4 h-4 text-destructive" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-success';
    if (score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">評估結果</CardTitle>
          <CardDescription>
            {userProfile?.name}，以下是您的家庭財務韌性評估結果
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Score */}
          <div className="flex flex-col items-center py-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-foreground">{result.totalScore}</span>
                  <span className="text-sm text-muted-foreground block">/ 100</span>
                </div>
              </div>
            </div>
            <Badge
              className={`mt-4 text-base px-4 py-1 ${
                result.level === 'stable'
                  ? 'bg-success/10 text-success border-success/20'
                  : result.level === 'needsAdjustment'
                  ? 'bg-warning/10 text-warning border-warning/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
              variant="outline"
            >
              {levelInfo.label}
            </Badge>
            <p className="text-muted-foreground text-center mt-3 max-w-sm">
              {levelInfo.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">六大面向分析</CardTitle>
          <CardDescription>各面向得分百分比（越高越好）</CardDescription>
        </CardHeader>
        <CardContent>
          <ResilienceRadarChart data={result.dimensionPercentages} height={280} />
        </CardContent>
      </Card>

      {/* Next Steps Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">後續你可以</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {NEXT_STEP_TOOLS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <span className="text-xl flex-shrink-0">{tool.emoji}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{tool.label}</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            </a>
          ))}
        </CardContent>
      </Card>

      {/* Dimension Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">各面向詳細得分</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(DIMENSION_LABELS) as Dimension[]).map((dim) => {
            const score = result.dimensionPercentages[dim];
            return (
              <div key={dim} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score)}
                    <span className="font-medium text-foreground">
                      {dim}. {DIMENSION_LABELS[dim]}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{score}%</span>
                </div>
                <Progress value={score} className={`h-2 ${getScoreColor(score)}`} />
                <p className="text-xs text-muted-foreground">{DIMENSION_DESCRIPTIONS[dim]}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          下載報告（Word）
        </Button>
        <Button variant="outline" size="lg" className="w-full">
          <Phone className="w-4 h-4 mr-2" />
          申請免費諮詢
        </Button>
        <Link href="/" className="w-full">
          <Button variant="ghost" size="lg" className="w-full" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新評估
          </Button>
        </Link>
      </div>

      {/* Share Notice */}
      {userProfile?.consentToShare && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <p className="text-sm text-center text-primary">
              您已同意將此評估結果分享給服務您的社福單位參考
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
