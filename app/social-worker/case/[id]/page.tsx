'use client';

import { use, useMemo } from 'react';
import { useSocialWorkerStore } from '@/lib/assessment-store';
import { DIMENSION_LABELS, RESILIENCE_LEVELS, type Dimension } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ResilienceRadarChart } from '@/components/assessment/radar-chart';
import { HistoryLineChart } from '@/components/assessment/history-line-chart';
import {
  ChevronLeft,
  ClipboardList,
  Download,
  User,
  Calendar,
  Users,
  Baby,
  Phone,
  FileText,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { cases } = useSocialWorkerStore();
  const caseData = cases.find((c) => c.id === id);

  const latestAssessment = caseData?.assessments[caseData.assessments.length - 1];

  const genderLabel = useMemo(() => {
    if (!caseData) return '';
    switch (caseData.gender) {
      case 'male':
        return '男';
      case 'female':
        return '女';
      default:
        return '其他';
    }
  }, [caseData]);

  if (!caseData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">找不到此個案</p>
            <Link href="/social-worker">
              <Button>返回個案列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getLevelBadge = (level: string) => {
    const info = RESILIENCE_LEVELS[level as keyof typeof RESILIENCE_LEVELS];
    if (!info) return null;
    return (
      <Badge
        variant="outline"
        className={
          level === 'stable'
            ? 'bg-success/10 text-success border-success/20'
            : level === 'needsAdjustment'
            ? 'bg-warning/10 text-warning border-warning/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
        }
      >
        {info.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Link
        href="/social-worker"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回個案列表
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{caseData.name}</h1>
            {latestAssessment && getLevelBadge(latestAssessment.level)}
          </div>
          <p className="text-muted-foreground">
            個案編號：{caseData.caseNumber} | 歷史評估次數：{caseData.assessments.length} 次
          </p>
        </div>
        <Link href={`/social-worker/case/${id}/assess`}>
          <Button size="lg">
            <ClipboardList className="w-4 h-4 mr-2" />
            進行評估
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                基本資料
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">出生年：</span>
                <span className="text-foreground">{caseData.birthYear} 年</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">性別：</span>
                <span className="text-foreground">{genderLabel}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">聯絡方式：</span>
                <span className="text-foreground">{caseData.contact || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">家庭人口：</span>
                <span className="text-foreground">{caseData.familySize} 人</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Baby className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">兒童人數：</span>
                <span className="text-foreground">{caseData.childrenCount} 人</span>
              </div>
              {caseData.notes && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-start gap-3 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block mb-1">備註：</span>
                      <span className="text-foreground">{caseData.notes}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Latest Score */}
          {latestAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  最新評估
                </CardTitle>
                <CardDescription>
                  {new Date(latestAssessment.date).toLocaleDateString('zh-TW')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-foreground">
                      {latestAssessment.totalScore}
                    </span>
                    <span className="text-lg text-muted-foreground"> / 100</span>
                    <div className="mt-2">{getLevelBadge(latestAssessment.level)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Radar Chart */}
          {latestAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最新雷達圖</CardTitle>
                <CardDescription>六大面向得分百分比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResilienceRadarChart data={latestAssessment.dimensionPercentages} height={300} />
              </CardContent>
            </Card>
          )}

          {/* History Line Chart */}
          {caseData.assessments.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">歷史趨勢</CardTitle>
                <CardDescription>總分變化追蹤</CardDescription>
              </CardHeader>
              <CardContent>
                <HistoryLineChart assessments={caseData.assessments} />
              </CardContent>
            </Card>
          )}

          {/* Assessment History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">評估紀錄</CardTitle>
              <CardDescription>所有歷史評估結果</CardDescription>
            </CardHeader>
            <CardContent>
              {caseData.assessments.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">尚無評估紀錄</p>
                  <Link href={`/social-worker/case/${id}/assess`}>
                    <Button>進行第一次評估</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>次數</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>分數</TableHead>
                      <TableHead>等級</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...caseData.assessments].reverse().map((assessment, index) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          T{caseData.assessments.length - index - 1}
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.date).toLocaleDateString('zh-TW')}
                        </TableCell>
                        <TableCell>{assessment.totalScore}</TableCell>
                        <TableCell>{getLevelBadge(assessment.level)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            匯出
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
