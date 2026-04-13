'use client';

import { useState, useMemo } from 'react';
import { useSocialWorkerStore } from '@/lib/assessment-store';
import { RESILIENCE_LEVELS } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, ClipboardList, Users, TrendingUp, AlertTriangle, Trash2, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import Link from 'next/link';

type SortKey = 'caseNumber' | 'name' | 'date' | 'score' | 'level';
type SortDir = 'asc' | 'desc';

const LEVEL_ORDER: Record<string, number> = { atRisk: 0, needsAdjustment: 1, stable: 2, '': 3 };

export default function SocialWorkerDashboard() {
  const { cases, deleteCase, deleteManyCases } = useSocialWorkerStore();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [filterAtRisk, setFilterAtRisk] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('caseNumber');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />;
  };

  const sortedFilteredCases = useMemo(() => {
    let list = filterAtRisk
      ? cases.filter((c) => c.assessments[c.assessments.length - 1]?.level === 'atRisk')
      : [...cases];

    list.sort((a, b) => {
      const la = a.assessments[a.assessments.length - 1];
      const lb = b.assessments[b.assessments.length - 1];
      let cmp = 0;
      if (sortKey === 'caseNumber') cmp = a.caseNumber.localeCompare(b.caseNumber);
      else if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'zh-TW');
      else if (sortKey === 'date') {
        const da = la ? new Date(la.date).getTime() : 0;
        const db = lb ? new Date(lb.date).getTime() : 0;
        cmp = da - db;
      } else if (sortKey === 'score') {
        cmp = (la?.totalScore ?? -1) - (lb?.totalScore ?? -1);
      } else if (sortKey === 'level') {
        cmp = (LEVEL_ORDER[la?.level ?? ''] ?? 3) - (LEVEL_ORDER[lb?.level ?? ''] ?? 3);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [cases, filterAtRisk, sortKey, sortDir]);

  const allSelected = sortedFilteredCases.length > 0 && sortedFilteredCases.every((c) => selected.has(c.id));
  const someSelected = sortedFilteredCases.some((c) => selected.has(c.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        sortedFilteredCases.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        sortedFilteredCases.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmDeleteOne = (id: string) => setDeleteTarget(id);

  const handleDeleteOne = () => {
    if (deleteTarget) {
      deleteCase(deleteTarget);
      setSelected((prev) => { const n = new Set(prev); n.delete(deleteTarget); return n; });
      setDeleteTarget(null);
    }
  };

  const handleBatchDelete = () => {
    deleteManyCases(Array.from(selected));
    setSelected(new Set());
    setShowBatchConfirm(false);
  };

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
        <Card
          className={`cursor-pointer transition-all ${filterAtRisk ? 'ring-2 ring-destructive' : 'hover:shadow-md'}`}
          onClick={() => setFilterAtRisk((v) => !v)}
          title="點擊篩選高風險個案"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${filterAtRisk ? 'bg-destructive/20' : 'bg-destructive/10'}`}>
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{atRiskCases}</p>
                <p className="text-sm text-muted-foreground">
                  高風險
                  {filterAtRisk && <span className="ml-1 text-destructive font-medium">（篩選中）</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>個案列表</CardTitle>
                {filterAtRisk && (
                  <Badge
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/20 cursor-pointer"
                    onClick={() => setFilterAtRisk(false)}
                  >
                    高風險篩選中
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </div>
              <CardDescription>
                {filterAtRisk
                  ? `顯示 ${sortedFilteredCases.length} 筆高風險個案，點擊右上角 ✕ 取消篩選`
                  : '點擊個案查看詳細資料與評估歷史'}
              </CardDescription>
            </div>
            {selected.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBatchConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                刪除選取（{selected.size}）
              </Button>
            )}
          </div>
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
          ) : sortedFilteredCases.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">目前沒有高風險個案</p>
              <Button variant="outline" onClick={() => setFilterAtRisk(false)}>清除篩選</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAll}
                        aria-label="全選"
                        data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-foreground"
                      onClick={() => handleSort('caseNumber')}
                    >
                      <span className="inline-flex items-center">
                        個案編號 <SortIcon col="caseNumber" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-foreground"
                      onClick={() => handleSort('name')}
                    >
                      <span className="inline-flex items-center">
                        姓名 <SortIcon col="name" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="hidden md:table-cell cursor-pointer select-none hover:text-foreground"
                      onClick={() => handleSort('date')}
                    >
                      <span className="inline-flex items-center">
                        最近評估 <SortIcon col="date" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-foreground"
                      onClick={() => handleSort('score')}
                    >
                      <span className="inline-flex items-center">
                        總分 <SortIcon col="score" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-foreground"
                      onClick={() => handleSort('level')}
                    >
                      <span className="inline-flex items-center">
                        等級 <SortIcon col="level" />
                      </span>
                    </TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFilteredCases.map((caseItem) => {
                    const latestAssessment = caseItem.assessments[caseItem.assessments.length - 1];
                    return (
                      <TableRow
                        key={caseItem.id}
                        className={selected.has(caseItem.id) ? 'bg-muted/40' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selected.has(caseItem.id)}
                            onCheckedChange={() => toggleOne(caseItem.id)}
                            aria-label={`選取 ${caseItem.name}`}
                          />
                        </TableCell>
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
                                快速開始評估
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => confirmDeleteOne(caseItem.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

      {/* Single delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除個案？</AlertDialogTitle>
            <AlertDialogDescription>
              刪除後將無法復原，該個案的所有評估紀錄也會一併刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteOne}
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch delete confirm */}
      <AlertDialog open={showBatchConfirm} onOpenChange={setShowBatchConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認批次刪除？</AlertDialogTitle>
            <AlertDialogDescription>
              即將刪除 <span className="font-semibold text-foreground">{selected.size}</span> 筆個案，所有評估紀錄也會一併刪除，此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBatchDelete}
            >
              確認刪除 {selected.size} 筆
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
