'use client';

import { use, useState, useCallback } from 'react';
import { usePersonalStore } from '@/lib/personal-store';
import {
  DIMENSION_LABELS,
  RESILIENCE_LEVELS,
  type Dimension,
  type AssessmentResult,
} from '@/lib/assessment-types';
import { MAX_DIMENSION_SCORES, ASSESSMENT_QUESTIONS } from '@/lib/assessment-questions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Pencil, Save, X, History, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

// ── Constants ────────────────────────────────────────────────────────────────

function getDetailedLevel(score: number): string {
  if (score >= 75) return '財務韌性良好（75–100）';
  if (score >= 60) return '接近韌性（60–74）';
  if (score >= 40) return '財務脆弱（40–59）';
  return '極度脆弱（0–39）';
}

function getDimensionChangeLabel(current: number, prev: number | undefined): string {
  if (prev === undefined) return '—';
  if (current > prev) return '↑ 上升';
  if (current < prev) return '↓ 下降';
  return '→ 持平';
}

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

// ── Edit History Section ──────────────────────────────────────────────────────

function EditHistorySection({ assessment }: { assessment: AssessmentResult }) {
  const [open, setOpen] = useState(false);
  const history = assessment.editHistory;
  if (!history || history.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full bg-muted px-4 py-2.5 flex items-center justify-between text-sm font-semibold hover:bg-muted/80 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <History className="w-4 h-4" />
          編輯歷史紀錄（共 {history.length} 筆）
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="divide-y">
          {[...history].reverse().map((record, i) => {
            const scoreDiff = assessment.totalScore - record.previousTotalScore;
            return (
              <div key={i} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground">
                    {new Date(record.editedAt).toLocaleString('zh-TW')}
                  </span>
                  <span className={`font-medium ${scoreDiff > 0 ? 'text-success' : scoreDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {record.previousTotalScore} 分 → {assessment.totalScore} 分
                    {scoreDiff !== 0 && ` （${scoreDiff > 0 ? '+' : ''}${scoreDiff}）`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  {(Object.keys(DIMENSION_LABELS) as Dimension[]).map((dim) => {
                    const prev = record.previousDimensionScores[dim];
                    const cur = assessment.dimensionScores[dim];
                    if (prev === cur) return null;
                    return (
                      <span key={dim}>
                        {dim}.{DIMENSION_LABELS[dim]}：{prev} → {cur}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PersonalAssessmentDetailPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const { profile, assessments, updateAssessment } = usePersonalStore();

  const assessmentIndex = assessments.findIndex((a) => a.id === assessmentId);
  const assessment: AssessmentResult | undefined = assessments[assessmentIndex];
  const previousAssessment: AssessmentResult | undefined =
    assessmentIndex > 0 ? assessments[assessmentIndex - 1] : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [editAnswers, setEditAnswers] = useState<Record<string, number>>({});

  const startEditing = useCallback(() => {
    if (!assessment) return;
    setEditAnswers({ ...assessment.answers });
    setIsEditing(true);
  }, [assessment]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditAnswers({});
  }, []);

  const saveEditing = useCallback(() => {
    updateAssessment(assessmentId, editAnswers);
    setIsEditing(false);
    setEditAnswers({});
  }, [assessmentId, editAnswers, updateAssessment]);

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center text-muted-foreground">
        找不到此評估紀錄。
        <Link href="/personal" className="ml-2 underline">返回個人頁面</Link>
      </div>
    );
  }

  const displayAnswers = isEditing ? editAnswers : assessment.answers;

  const editDimScores: Record<string, number> = {};
  if (isEditing) {
    for (const dim of ['A', 'B', 'C', 'D', 'E', 'F']) {
      editDimScores[dim] = ASSESSMENT_QUESTIONS
        .filter((q) => q.dimension === dim)
        .reduce((sum, q) => sum + (editAnswers[q.id] ?? 0), 0);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link
        href="/personal"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 text-sm"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回個人頁面
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">家庭財務韌性快速評估（六面向）</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile && <span>姓名：<span className="text-foreground font-medium">{profile.name}</span></span>}
            <span>次數：<span className="text-foreground font-medium">T{assessmentIndex}</span></span>
            <span>日期：<span className="text-foreground font-medium">{new Date(assessment.date).toLocaleDateString('zh-TW')}</span></span>
            <span>總分：<span className="text-foreground font-semibold">{assessment.totalScore} 分</span></span>
            <span className="flex items-center gap-1.5">
              韌性等級：{getLevelBadge(assessment.level)}
              <span className="text-foreground">{getDetailedLevel(assessment.totalScore)}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="w-4 h-4 mr-1" />取消
              </Button>
              <Button size="sm" onClick={saveEditing}>
                <Save className="w-4 h-4 mr-1" />儲存修改
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="w-4 h-4 mr-1" />編輯
            </Button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
          編輯模式：點選選項即可修改答案，完成後請按「儲存修改」。
        </div>
      )}

      {/* Six dimension sections */}
      <div className="space-y-6">
        {(['A', 'B', 'C', 'D', 'E', 'F'] as Dimension[]).map((dim) => {
          const questions = ASSESSMENT_QUESTIONS.filter((q) => q.dimension === dim);
          const dimScore = isEditing ? (editDimScores[dim] ?? 0) : assessment.dimensionScores[dim];
          const maxScore = MAX_DIMENSION_SCORES[dim];
          const prevDimScore = previousAssessment?.dimensionScores[dim];

          return (
            <div key={dim} className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2.5 flex items-center justify-between">
                <span className="font-semibold text-sm">
                  ▌ {dim}. {DIMENSION_LABELS[dim]}（滿分 {maxScore} 分）
                </span>
              </div>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-3 py-2 font-medium w-[30%] border-r">評估題目</th>
                    <th className="text-left px-3 py-2 font-medium border-r">選項（請勾選最符合的一項）</th>
                    <th className="text-left px-3 py-2 font-medium w-[18%]">得分</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, qi) => {
                    const selectedValue = displayAnswers[question.id];

                    return (
                      <tr key={question.id} className={qi % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                        <td className="px-3 py-2.5 align-top border-r border-border/50">
                          <div className="font-semibold leading-relaxed">{question.text}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">（滿分 {question.options[0].value} 分）</div>
                        </td>
                        <td className="px-3 py-2.5 align-top border-r border-border/50">
                          {isEditing ? (
                            <RadioGroup
                              value={selectedValue?.toString()}
                              onValueChange={(val) => setEditAnswers((prev) => ({ ...prev, [question.id]: parseInt(val) }))}
                              className="space-y-1.5"
                            >
                              {question.options.map((opt) => (
                                <div
                                  key={opt.value}
                                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                                    opt.value === selectedValue ? 'bg-primary/8 text-primary font-medium' : 'hover:bg-muted/50'
                                  }`}
                                >
                                  <RadioGroupItem value={opt.value.toString()} id={`edit-${question.id}-${opt.value}`} />
                                  <Label htmlFor={`edit-${question.id}-${opt.value}`} className="cursor-pointer font-normal flex-1">
                                    {opt.label}（{opt.value} 分）
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <div className="space-y-1">
                              {question.options.map((opt) => {
                                const isSelected = opt.value === selectedValue;
                                return (
                                  <div key={opt.value} className={`flex items-start gap-2 ${isSelected ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                    <span className="mt-px shrink-0 text-base leading-none">{isSelected ? '☑' : '☐'}</span>
                                    <span>{opt.label}（{opt.value} 分）</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div className="font-medium">
                            得分：{selectedValue !== undefined ? selectedValue : '—'} 分
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-primary/5 border-t font-semibold">
                    <td colSpan={2} className="px-3 py-2 border-r border-border/50 text-sm">{dim}.面向小計</td>
                    <td className="px-3 py-2 text-sm">
                      {dim} 面向得分：{dimScore} / {maxScore} 分
                      {!isEditing && prevDimScore !== undefined && (
                        <span className={`ml-2 text-xs font-normal ${dimScore > prevDimScore ? 'text-success' : dimScore < prevDimScore ? 'text-destructive' : 'text-muted-foreground'}`}>
                          （{getDimensionChangeLabel(dimScore, prevDimScore)}）
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Summary table */}
        {!isEditing && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2.5 font-semibold text-sm">綜合評分摘要</div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-left px-3 py-2 font-medium border-r">面向</th>
                  <th className="text-center px-3 py-2 font-medium border-r">本次得分</th>
                  {previousAssessment && <th className="text-center px-3 py-2 font-medium border-r">上次得分</th>}
                  {previousAssessment && <th className="text-center px-3 py-2 font-medium">變化方向</th>}
                </tr>
              </thead>
              <tbody>
                {(['A', 'B', 'C', 'D', 'E', 'F'] as Dimension[]).map((dim, i) => {
                  const cur = assessment.dimensionScores[dim];
                  const prev = previousAssessment?.dimensionScores[dim];
                  return (
                    <tr key={dim} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="px-3 py-2 border-r">{dim}.{DIMENSION_LABELS[dim]}</td>
                      <td className="px-3 py-2 text-center border-r">{cur}/{MAX_DIMENSION_SCORES[dim]}</td>
                      {previousAssessment && <td className="px-3 py-2 text-center border-r">{prev}/{MAX_DIMENSION_SCORES[dim]}</td>}
                      {previousAssessment && (
                        <td className={`px-3 py-2 text-center text-xs font-medium ${prev !== undefined && cur > prev ? 'text-success' : prev !== undefined && cur < prev ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {getDimensionChangeLabel(cur, prev)}
                        </td>
                      )}
                    </tr>
                  );
                })}
                <tr className="bg-primary/5 border-t font-semibold">
                  <td className="px-3 py-2 border-r">總分</td>
                  <td className="px-3 py-2 text-center border-r">{assessment.totalScore}/100</td>
                  {previousAssessment && <td className="px-3 py-2 text-center border-r">{previousAssessment.totalScore}/100</td>}
                  {previousAssessment && (
                    <td className={`px-3 py-2 text-center text-xs ${assessment.totalScore > previousAssessment.totalScore ? 'text-success' : assessment.totalScore < previousAssessment.totalScore ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {getDimensionChangeLabel(assessment.totalScore, previousAssessment.totalScore)}
                    </td>
                  )}
                </tr>
                <tr className="bg-muted/20">
                  <td className="px-3 py-2 border-r font-medium">韌性等級</td>
                  <td className="px-3 py-2 border-r">
                    <div className="flex items-center justify-center gap-2">
                      {getLevelBadge(assessment.level)}
                      <span className="text-xs text-muted-foreground">{getDetailedLevel(assessment.totalScore)}</span>
                    </div>
                  </td>
                  {previousAssessment && <td className="px-3 py-2 text-center border-r">{getLevelBadge(previousAssessment.level)}</td>}
                  {previousAssessment && <td className="px-3 py-2" />}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom save in edit mode */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={cancelEditing}><X className="w-4 h-4 mr-1" />取消</Button>
            <Button onClick={saveEditing}><Save className="w-4 h-4 mr-1" />儲存修改</Button>
          </div>
        )}

        {/* Edit history */}
        {!isEditing && <EditHistorySection assessment={assessment} />}
      </div>
    </div>
  );
}
