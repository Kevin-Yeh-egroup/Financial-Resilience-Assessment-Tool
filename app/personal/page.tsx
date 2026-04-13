'use client';

import { useState, useMemo } from 'react';
import { usePersonalStore } from '@/lib/personal-store';
import { DIMENSION_LABELS, RESILIENCE_LEVELS, type Dimension } from '@/lib/assessment-types';
import { MAX_DIMENSION_SCORES } from '@/lib/assessment-questions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ResilienceRadarChart } from '@/components/assessment/radar-chart';
import { HistoryLineChart } from '@/components/assessment/history-line-chart';
import {
  ClipboardList, ExternalLink, Trash2, TrendingUp,
  ArrowUp, ArrowDown, Minus, Pencil, Save, X,
} from 'lucide-react';
import Link from 'next/link';

const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);

function getLevelBadge(level: string) {
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
}

function getDetailedLevel(score: number): string {
  if (score >= 75) return '財務韌性良好';
  if (score >= 60) return '接近韌性';
  if (score >= 40) return '財務脆弱';
  return '極度脆弱';
}

export default function PersonalPage() {
  const { profile, assessments, setProfile, deleteAssessment } = usePersonalStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', birthYear: '', gender: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const latestAssessment = assessments[assessments.length - 1];
  const previousAssessment = assessments.length >= 2 ? assessments[assessments.length - 2] : null;

  const genderLabel = useMemo(() => {
    switch (profile.gender) {
      case 'male': return '男';
      case 'female': return '女';
      default: return '其他';
    }
  }, [profile.gender]);

  const startEditProfile = () => {
    setProfileForm({ name: profile.name, birthYear: profile.birthYear, gender: profile.gender });
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    if (!profileForm.name.trim()) return;
    setProfile(profileForm);
    setIsEditingProfile(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            {latestAssessment && getLevelBadge(latestAssessment.level)}
          </div>
          <p className="text-muted-foreground text-sm">
            {profile.birthYear && `${profile.birthYear} 年生`}
            {profile.birthYear && profile.gender && '　'}
            {profile.gender && genderLabel}
            {(profile.birthYear || profile.gender) && '　'}
            共 {assessments.length} 次評估
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={startEditProfile}>
            <Pencil className="w-4 h-4 mr-1" />
            編輯資料
          </Button>
          <Link href="/personal/assess">
            <Button size="lg">
              <ClipboardList className="w-4 h-4 mr-2" />
              開始評估
            </Button>
          </Link>
        </div>
      </div>

      {/* Inline profile edit form */}
      {isEditingProfile && (
        <Card className="mb-6 border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">編輯個人資料</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">姓名</Label>
                <Input
                  id="edit-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-birthYear">出生年</Label>
                <Select
                  value={profileForm.birthYear}
                  onValueChange={(v) => setProfileForm({ ...profileForm, birthYear: v })}
                >
                  <SelectTrigger id="edit-birthYear">
                    <SelectValue placeholder="請選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    {birthYears.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y} 年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>性別</Label>
                <div className="flex gap-2">
                  {[{ value: 'male', label: '男' }, { value: 'female', label: '女' }, { value: 'other', label: '其他' }].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, gender: opt.value })}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        profileForm.gender === opt.value
                          ? 'border-primary bg-primary/8 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>
                <X className="w-4 h-4 mr-1" />取消
              </Button>
              <Button size="sm" onClick={saveProfile} disabled={!profileForm.name.trim()}>
                <Save className="w-4 h-4 mr-1" />儲存
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Latest Score */}
          {latestAssessment ? (
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
                    <span className="text-5xl font-bold">{latestAssessment.totalScore}</span>
                    <span className="text-xl text-muted-foreground"> / 100</span>
                    <div className="mt-2">{getLevelBadge(latestAssessment.level)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getDetailedLevel(latestAssessment.totalScore)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">尚未完成任何評估</p>
                <Link href="/personal/assess">
                  <Button size="sm">立即開始評估</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Radar chart */}
          {latestAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">各面向分析</CardTitle>
              </CardHeader>
              <CardContent>
                <ResilienceRadarChart data={latestAssessment.dimensionPercentages} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dimension table */}
          {latestAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">六面向評估結果</CardTitle>
                {previousAssessment && <CardDescription>含上次評估對照</CardDescription>}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>面向</TableHead>
                      <TableHead className="text-center">本次得分</TableHead>
                      {previousAssessment && <TableHead className="text-center">上次得分</TableHead>}
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
                          <TableCell className="font-medium">{dim}. {DIMENSION_LABELS[dim]}</TableCell>
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
                              <span className="text-muted-foreground text-sm">—</span>
                            ) : diff > 0 ? (
                              <span className="inline-flex items-center gap-1 text-success text-sm font-medium">
                                <ArrowUp className="w-3.5 h-3.5" />+{diff}
                              </span>
                            ) : diff < 0 ? (
                              <span className="inline-flex items-center gap-1 text-destructive text-sm font-medium">
                                <ArrowDown className="w-3.5 h-3.5" />{diff}
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
                          const diff = previousAssessment
                            ? latestAssessment.totalScore - previousAssessment.totalScore
                            : null;
                          if (diff === null) return <span className="text-muted-foreground text-sm">—</span>;
                          return diff > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-success text-sm font-medium">
                              <ArrowUp className="w-3.5 h-3.5" />+{diff}
                            </span>
                          ) : diff < 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-destructive text-sm font-medium">
                              <ArrowDown className="w-3.5 h-3.5" />{diff}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-muted-foreground text-sm">
                              <Minus className="w-3.5 h-3.5" />持平
                            </span>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* History line chart */}
          {assessments.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">歷史趨勢</CardTitle>
                <CardDescription>總分變化追蹤</CardDescription>
              </CardHeader>
              <CardContent>
                <HistoryLineChart assessments={assessments} />
              </CardContent>
            </Card>
          )}

          {/* Assessment history table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">評估紀錄</CardTitle>
              <CardDescription>家庭財務韌性快速評估歷史紀錄</CardDescription>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">尚無評估紀錄</p>
                  <Link href="/personal/assess">
                    <Button>快速開始評估</Button>
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
                    {[...assessments].reverse().map((assessment, index) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          T{assessments.length - index - 1}
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.date).toLocaleDateString('zh-TW')}
                        </TableCell>
                        <TableCell>{assessment.totalScore}</TableCell>
                        <TableCell>{getLevelBadge(assessment.level)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/personal/assessment/${assessment.id}`} target="_blank">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                查看
                              </Button>
                            </Link>
                            <Button
                              variant="ghost" size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(assessment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
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
              onClick={() => { if (deleteTarget) { deleteAssessment(deleteTarget); setDeleteTarget(null); } }}
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
