'use client';

import { use, useMemo, useState } from 'react';
import { useSocialWorkerStore } from '@/lib/assessment-store';
import { DIMENSION_LABELS, RESILIENCE_LEVELS, INTERVENTION_OPTIONS, type Dimension } from '@/lib/assessment-types';
import { MAX_DIMENSION_SCORES } from '@/lib/assessment-questions';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  Pencil,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  Minus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { cases, updateCase, deleteAssessment, deleteManyAssessments } = useSocialWorkerStore();
  const caseData = cases.find((c) => c.id === id);

  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set());
  const [deleteAssessmentTarget, setDeleteAssessmentTarget] = useState<string | null>(null);
  const [showBatchAssessmentConfirm, setShowBatchAssessmentConfirm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    caseNumber: '',
    name: '',
    birthYear: '',
    gender: '',
    contact: '',
    familySize: 1,
    childrenCount: 0,
    notes: '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const startEditing = () => {
    if (!caseData) return;
    setEditForm({
      caseNumber: caseData.caseNumber,
      name: caseData.name,
      birthYear: caseData.birthYear,
      gender: caseData.gender,
      contact: caseData.contact,
      familySize: caseData.familySize,
      childrenCount: caseData.childrenCount,
      notes: caseData.notes,
    });
    setEditErrors({});
    setIsEditing(true);
  };

  const validateEdit = () => {
    const errs: Record<string, string> = {};
    if (!editForm.name.trim()) errs.name = '請輸入姓名';
    if (!editForm.birthYear) errs.birthYear = '請選擇出生年';
    if (!editForm.gender) errs.gender = '請選擇戶長性別';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveEdit = () => {
    if (!validateEdit()) return;
    updateCase(id, editForm);
    setIsEditing(false);
  };

  const latestAssessment = caseData?.assessments[caseData.assessments.length - 1];
  const previousAssessment = caseData?.assessments.length >= 2
    ? caseData.assessments[caseData.assessments.length - 2]
    : null;

  const genderLabel = useMemo(() => {
    if (!caseData) return '';
    switch (caseData.gender) {
      case 'male': return '男';
      case 'female': return '女';
      default: return '其他';
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
            快速開始評估
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  基本資料
                </CardTitle>
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onClick={startEditing}>
                    <Pencil className="w-4 h-4 mr-1" />
                    編輯
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">個案編號：</span>
                    <span className="text-foreground">{caseData.caseNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">出生年：</span>
                    <span className="text-foreground">{caseData.birthYear} 年</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">戶長性別：</span>
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-caseNumber">個案編號</Label>
                    <Input
                      id="edit-caseNumber"
                      value={editForm.caseNumber}
                      onChange={(e) => setEditForm({ ...editForm, caseNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name">姓名 *</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    {editErrors.name && <p className="text-xs text-destructive">{editErrors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>出生年 *</Label>
                    <Select
                      value={editForm.birthYear}
                      onValueChange={(v) => setEditForm({ ...editForm, birthYear: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇出生年" />
                      </SelectTrigger>
                      <SelectContent>
                        {birthYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year} 年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editErrors.birthYear && <p className="text-xs text-destructive">{editErrors.birthYear}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>戶長性別 *</Label>
                    <RadioGroup
                      value={editForm.gender}
                      onValueChange={(v) => setEditForm({ ...editForm, gender: v })}
                      className="flex flex-row gap-4"
                    >
                      {[{ value: 'male', label: '男' }, { value: 'female', label: '女' }, { value: 'other', label: '其他' }].map((g) => (
                        <div key={g.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={g.value} id={`edit-gender-${g.value}`} />
                          <Label htmlFor={`edit-gender-${g.value}`} className="font-normal cursor-pointer">{g.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {editErrors.gender && <p className="text-xs text-destructive">{editErrors.gender}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-contact">聯絡方式</Label>
                    <Input
                      id="edit-contact"
                      value={editForm.contact}
                      onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                      placeholder="電話或 Email"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-familySize">家庭人口</Label>
                      <Input
                        id="edit-familySize"
                        type="number"
                        min={1}
                        value={editForm.familySize}
                        onChange={(e) => setEditForm({ ...editForm, familySize: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-childrenCount">兒童人數</Label>
                      <Input
                        id="edit-childrenCount"
                        type="number"
                        min={0}
                        value={editForm.childrenCount}
                        onChange={(e) => setEditForm({ ...editForm, childrenCount: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-notes">備註</Label>
                    <Textarea
                      id="edit-notes"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button onClick={saveEdit} className="w-full" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    儲存變更
                  </Button>
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

          {/* Intervention Priorities */}
          {(() => {
            const priorities = caseData.interventionPriorities ?? { selected: [], otherChecked: false, other: '' };
            const toggleOption = (opt: string) => {
              const next = priorities.selected.includes(opt)
                ? priorities.selected.filter((s) => s !== opt)
                : [...priorities.selected, opt];
              updateCase(id, { interventionPriorities: { ...priorities, selected: next } });
            };
            const toggleOtherChecked = () => {
              updateCase(id, { interventionPriorities: { ...priorities, otherChecked: !priorities.otherChecked } });
            };
            const setOther = (val: string) => {
              updateCase(id, {
                interventionPriorities: {
                  ...priorities,
                  other: val,
                  otherChecked: val.trim().length > 0 ? true : priorities.otherChecked,
                },
              });
            };
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">優先介入面向識別</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-2.5">
                    {INTERVENTION_OPTIONS.map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <Checkbox
                          id={`intervention-${opt}`}
                          checked={priorities.selected.includes(opt)}
                          onCheckedChange={() => toggleOption(opt)}
                        />
                        <Label
                          htmlFor={`intervention-${opt}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="intervention-other-check"
                      checked={priorities.otherChecked}
                      onCheckedChange={toggleOtherChecked}
                    />
                    <Label htmlFor="intervention-other-check" className="text-sm font-normal shrink-0">
                      其他：
                    </Label>
                    <Input
                      value={priorities.other}
                      onChange={(e) => setOther(e.target.value)}
                      placeholder="請填寫"
                      className="h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">後續你可以</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  label: '語音轉文字',
                  href: 'https://www.familyfinhealth.com/toolbox/voice-to-text',
                  icon: '🎙️',
                },
                {
                  label: '財務風險快篩',
                  href: 'https://www.familyfinhealth.com/social-worker/toolbox/finance-screening',
                  icon: '📋',
                },
                {
                  label: '問問 AI',
                  href: 'https://www.familyfinhealth.com/social-worker/ask-ivy',
                  icon: '🤖',
                },
                {
                  label: '線上財務諮詢',
                  href: 'https://www.familyfinhealth.com/social-worker/online-consultation',
                  icon: '💬',
                },
                {
                  label: '財務生活記帳助理',
                  href: 'https://www.familyfinhealth.com/toolbox/financial-calculator/basic-accounting-preview',
                  icon: '📒',
                },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-foreground"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              ))}
            </CardContent>
          </Card>
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

          {/* Dimension Scores Table */}
          {latestAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  各面向得分
                </CardTitle>
                <CardDescription>
                  本次（T{caseData.assessments.length - 1}）
                  {previousAssessment && `，上次（T${caseData.assessments.length - 2}）對照`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>面向</TableHead>
                      <TableHead className="text-center">本次得分</TableHead>
                      {previousAssessment && (
                        <TableHead className="text-center">上次得分</TableHead>
                      )}
                      <TableHead className="text-center">變化</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Object.keys(DIMENSION_LABELS) as Dimension[]).map((dim) => {
                      const current = latestAssessment.dimensionScores[dim];
                      const previous = previousAssessment?.dimensionScores[dim];
                      const max = MAX_DIMENSION_SCORES[dim];
                      const diff = previous !== undefined ? current - previous : null;
                      return (
                        <TableRow key={dim}>
                          <TableCell className="font-medium">
                            {dim}. {DIMENSION_LABELS[dim]}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">{current}</span>
                            <span className="text-muted-foreground text-xs"> /{max}</span>
                          </TableCell>
                          {previousAssessment && (
                            <TableCell className="text-center">
                              <span>{previous}</span>
                              <span className="text-muted-foreground text-xs"> /{max}</span>
                            </TableCell>
                          )}
                          <TableCell className="text-center">
                            {diff === null ? (
                              <span className="text-muted-foreground text-xs">—</span>
                            ) : diff > 0 ? (
                              <span className="inline-flex items-center gap-1 text-success text-sm font-medium">
                                <ArrowUp className="w-3.5 h-3.5" />上升
                              </span>
                            ) : diff < 0 ? (
                              <span className="inline-flex items-center gap-1 text-destructive text-sm font-medium">
                                <ArrowDown className="w-3.5 h-3.5" />下降
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                                <Minus className="w-3.5 h-3.5" />持平
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Total Row */}
                    <TableRow className="border-t-2 bg-muted/30">
                      <TableCell className="font-bold">總分</TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-base">{latestAssessment.totalScore}</span>
                        <span className="text-muted-foreground text-xs"> /100</span>
                      </TableCell>
                      {previousAssessment && (
                        <TableCell className="text-center">
                          <span className="font-semibold">{previousAssessment.totalScore}</span>
                          <span className="text-muted-foreground text-xs"> /100</span>
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        {(() => {
                          const score = latestAssessment.totalScore;
                          const diff = previousAssessment
                            ? latestAssessment.totalScore - previousAssessment.totalScore
                            : null;
                          const levelLabel =
                            score >= 75 ? '財務韌性良好'
                            : score >= 60 ? '接近韌性'
                            : score >= 40 ? '財務脆弱'
                            : '極度脆弱';
                          const levelColor =
                            score >= 75 ? 'text-success'
                            : score >= 60 ? 'text-primary'
                            : score >= 40 ? 'text-warning'
                            : 'text-destructive';
                          return (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-semibold ${levelColor}`}>
                                {levelLabel}
                              </span>
                              {diff !== null && (
                                diff > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-success text-xs">
                                    <ArrowUp className="w-3 h-3" />+{diff}
                                  </span>
                                ) : diff < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-destructive text-xs">
                                    <ArrowDown className="w-3 h-3" />{diff}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-muted-foreground text-xs">
                                    <Minus className="w-3 h-3" />持平
                                  </span>
                                )
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* History Line Chart */}
          {caseData.assessments.length >= 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">歷史趨勢</CardTitle>
                <CardDescription>總分變化追蹤（每次評估為獨立一筆）</CardDescription>
              </CardHeader>
              <CardContent>
                <HistoryLineChart assessments={caseData.assessments} />
              </CardContent>
            </Card>
          )}

          {/* Assessment History Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">評估紀錄</CardTitle>
                  <CardDescription>所有歷史評估結果</CardDescription>
                </div>
                {selectedAssessments.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBatchAssessmentConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    刪除選取（{selectedAssessments.size}）
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {caseData.assessments.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">尚無評估紀錄</p>
                  <Link href={`/social-worker/case/${id}/assess`}>
                    <Button>快速開始評估</Button>
                  </Link>
                </div>
              ) : (() => {
                const reversed = [...caseData.assessments].reverse();
                const allAssessmentSelected = selectedAssessments.size === caseData.assessments.length;
                const someAssessmentSelected = selectedAssessments.size > 0 && !allAssessmentSelected;
                const toggleAllAssessments = () => {
                  if (allAssessmentSelected) setSelectedAssessments(new Set());
                  else setSelectedAssessments(new Set(caseData.assessments.map((a) => a.id)));
                };
                const toggleOneAssessment = (aid: string) => {
                  setSelectedAssessments((prev) => {
                    const next = new Set(prev);
                    if (next.has(aid)) next.delete(aid); else next.add(aid);
                    return next;
                  });
                };
                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={allAssessmentSelected}
                            data-state={someAssessmentSelected ? 'indeterminate' : allAssessmentSelected ? 'checked' : 'unchecked'}
                            onCheckedChange={toggleAllAssessments}
                            aria-label="全選評估"
                          />
                        </TableHead>
                        <TableHead>次數</TableHead>
                        <TableHead>日期</TableHead>
                        <TableHead>分數</TableHead>
                        <TableHead>等級</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reversed.map((assessment, index) => (
                        <TableRow
                          key={assessment.id}
                          className={selectedAssessments.has(assessment.id) ? 'bg-muted/40' : ''}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedAssessments.has(assessment.id)}
                              onCheckedChange={() => toggleOneAssessment(assessment.id)}
                              aria-label={`選取評估 ${assessment.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            T{caseData.assessments.length - index - 1}
                          </TableCell>
                          <TableCell>
                            {new Date(assessment.date).toLocaleDateString('zh-TW')}
                          </TableCell>
                          <TableCell>{assessment.totalScore}</TableCell>
                          <TableCell>{getLevelBadge(assessment.level)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                匯出
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteAssessmentTarget(assessment.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Single assessment delete confirm */}
      <AlertDialog open={!!deleteAssessmentTarget} onOpenChange={(open) => { if (!open) setDeleteAssessmentTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除此筆評估？</AlertDialogTitle>
            <AlertDialogDescription>
              刪除後將無法復原，該次評估資料會永久移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteAssessmentTarget) {
                  deleteAssessment(id, deleteAssessmentTarget);
                  setSelectedAssessments((prev) => { const n = new Set(prev); n.delete(deleteAssessmentTarget); return n; });
                  setDeleteAssessmentTarget(null);
                }
              }}
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch assessment delete confirm */}
      <AlertDialog open={showBatchAssessmentConfirm} onOpenChange={setShowBatchAssessmentConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認批次刪除評估？</AlertDialogTitle>
            <AlertDialogDescription>
              即將刪除 <span className="font-semibold text-foreground">{selectedAssessments.size}</span> 筆評估紀錄，此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteManyAssessments(id, Array.from(selectedAssessments));
                setSelectedAssessments(new Set());
                setShowBatchAssessmentConfirm(false);
              }}
            >
              確認刪除 {selectedAssessments.size} 筆
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
