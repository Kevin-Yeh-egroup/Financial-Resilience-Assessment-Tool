'use client';

import { useSocialWorkerStore } from '@/lib/assessment-store';
import { RESILIENCE_LEVELS } from '@/lib/assessment-types';
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
import { Plus, Eye, ClipboardList, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function SocialWorkerDashboard() {
  const { cases } = useSocialWorkerStore();

  // Calculate stats
  const totalCases = cases.length;
  const casesWithAssessments = cases.filter((c) => c.assessments.length > 0);
  const avgScore =
    casesWithAssessments.length > 0
      ? Math.round(
          casesWithAssessments.reduce(
            (sum, c) => sum + (c.assessments[c.assessments.length - 1]?.totalScore || 0),
            0
          ) / casesWithAssessments.length
        )
      : 0;
  const atRiskCases = casesWithAssessments.filter(
    (c) => c.assessments[c.assessments.length - 1]?.level === 'atRisk'
  ).length;

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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">個案管理</h1>
          <p className="text-muted-foreground">管理個案資料與評估紀錄</p>
        </div>
        <Link href="/social-worker/new-case">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            新增個案
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCases}</p>
                <p className="text-sm text-muted-foreground">總個案數</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{casesWithAssessments.length}</p>
                <p className="text-sm text-muted-foreground">已評估</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgScore}</p>
                <p className="text-sm text-muted-foreground">平均分數</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{atRiskCases}</p>
                <p className="text-sm text-muted-foreground">高風險</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>個案列表</CardTitle>
          <CardDescription>點擊個案查看詳細資料與評估歷史</CardDescription>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">尚無個案資料</p>
              <Link href="/social-worker/new-case">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新增第一個個案
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>個案編號</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead className="hidden md:table-cell">最近評估</TableHead>
                    <TableHead>總分</TableHead>
                    <TableHead>等級</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => {
                    const latestAssessment = caseItem.assessments[caseItem.assessments.length - 1];
                    return (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-medium">{caseItem.caseNumber}</TableCell>
                        <TableCell>{caseItem.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {latestAssessment
                            ? new Date(latestAssessment.date).toLocaleDateString('zh-TW')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {latestAssessment ? latestAssessment.totalScore : '-'}
                        </TableCell>
                        <TableCell>
                          {latestAssessment ? getLevelBadge(latestAssessment.level) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/social-worker/case/${caseItem.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                查看
                              </Button>
                            </Link>
                            <Link href={`/social-worker/case/${caseItem.id}/assess`}>
                              <Button size="sm">
                                <ClipboardList className="w-4 h-4 mr-1" />
                                評估
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
