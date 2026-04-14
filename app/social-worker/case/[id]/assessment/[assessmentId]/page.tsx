'use client';

import { use, useState, useCallback } from 'react';
import { useSocialWorkerStore } from '@/lib/assessment-store';
import {
  DIMENSION_LABELS,
  RESILIENCE_LEVELS,
  INTERVENTION_OPTIONS,
  type Dimension,
  type AssessmentResult,
} from '@/lib/assessment-types';
import { MAX_DIMENSION_SCORES, ASSESSMENT_QUESTIONS } from '@/lib/assessment-questions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Pencil, Save, X, History, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const DIMENSION_ROLES: Record<string, string> = {
  A: '社工詢問個案',
  B: '社工詢問個案',
  C: '社工詢問個案',
  D: '社工與個案共同確認',
  E: '社工詢問個案',
  F: '個案自填',
};

const QUESTION_SHORT_TITLES: Record<string, string> = {
  A1: '月收入', A2: '收入穩定性', A3: '儲蓄狀況', A4: '債務狀況', A5: '其他資產',
  B1: '應急籌款能力', B2: '主要籌款管道', B3: '保險覆蓋',
  C1: '銀行帳戶', C2: '銀行服務使用熟練度', C3: '金融服務可近性',
  D1: '預算規劃習慣', D2: '記帳習慣', D3: '儲蓄習慣', D4: '金融知識程度',
  E1: '親友支持強度', E2: '社區連結程度', E3: '社會資源了解度',
  F1: '財務壓力感受', F2: '未來財務信心',
};

function getQuestionNote(questionId: string, value: number): string | null {
  if (questionId === 'A4' && value <= 1) return '如有債務→建議啟動 家庭債務風險評估標準 深入評估';
  if (questionId === 'B1' && value <= 1) return '如困難→建議啟動 家庭緊急資金充足度評估標準 深入評估';
  if (questionId === 'C1' && value === 0) return '無→優先協助開戶';
  if (questionId === 'D2' && value === 0) return '如無→建議評估後啟動家庭財務管理行為評估檢核表';
  if (questionId === 'D4') return '社工依對話過程綜合判斷';
  if (questionId === 'F1' && value === 0) return '如高壓力→建議施測財務壓力與掌控感評估量表';
  return null;
}

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

// ────────────────────────────────────────────
// Edit History Section
// ────────────────────────────────────────────

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

// ────────────────────────────────────────────
// Amount field (A1 / A3) — saves on blur
// ────────────────────────────────────────────

function AmountField({
  questionId,
  initialValue,
  onSave,
}: {
  questionId: string;
  initialValue: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  const handleBlur = useCallback(() => {
    onSave(value);
  }, [value, onSave]);

  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground shrink-0">實際金額：NT$</span>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="請填寫"
        className="h-6 w-28 text-xs px-1.5 py-0"
      />
      <span className="text-muted-foreground shrink-0">元</span>
    </div>
  );
}

// ────────────────────────────────────────────
// Page
// ────────────────────────────────────────────

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; assessmentId: string }>;
}) {
  const { id, assessmentId } = use(params);
  const { cases, updateAssessment, updateAssessmentFieldNotes, updateAssessmentInterventionPriorities } = useSocialWorkerStore();

  const caseData = cases.find((c) => c.id === id);
  const assessmentIndex = caseData?.assessments.findIndex((a) => a.id === assessmentId) ?? -1;
  const assessment: AssessmentResult | undefined = caseData?.assessments[assessmentIndex];
  const previousAssessment: AssessmentResult | undefined =
    assessmentIndex > 0 ? caseData?.assessments[assessmentIndex - 1] : undefined;

  // Edit mode state
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
    updateAssessment(id, assessmentId, editAnswers);
    setIsEditing(false);
    setEditAnswers({});
  }, [id, assessmentId, editAnswers, updateAssessment]);

  const saveFieldNote = useCallback(
    (questionId: string, value: string) => {
      updateAssessmentFieldNotes(id, assessmentId, { [questionId]: value });
    },
    [id, assessmentId, updateAssessmentFieldNotes]
  );

  const toggleInterventionOption = useCallback(
    (opt: string) => {
      if (!assessment) return;
      const current = assessment.interventionPriorities ?? { selected: [], otherChecked: false, other: '' };
      const next = current.selected.includes(opt)
        ? current.selected.filter((s) => s !== opt)
        : [...current.selected, opt];
      updateAssessmentInterventionPriorities(id, assessmentId, { ...current, selected: next });
    },
    [id, assessmentId, assessment, updateAssessmentInterventionPriorities]
  );

  const toggleInterventionOther = useCallback(() => {
    if (!assessment) return;
    const current = assessment.interventionPriorities ?? { selected: [], otherChecked: false, other: '' };
    updateAssessmentInterventionPriorities(id, assessmentId, { ...current, otherChecked: !current.otherChecked });
  }, [id, assessmentId, assessment, updateAssessmentInterventionPriorities]);

  const setInterventionOtherText = useCallback(
    (val: string) => {
      if (!assessment) return;
      const current = assessment.interventionPriorities ?? { selected: [], otherChecked: false, other: '' };
      updateAssessmentInterventionPriorities(id, assessmentId, {
        ...current,
        other: val,
        otherChecked: val.trim().length > 0 ? true : current.otherChecked,
      });
    },
    [id, assessmentId, assessment, updateAssessmentInterventionPriorities]
  );

  if (!caseData || !assessment) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center text-muted-foreground">
        找不到此評估紀錄。
        <Link href={`/social-worker/case/${id}`} className="ml-2 underline">
          返回個案頁面
        </Link>
      </div>
    );
  }

  // When editing, derive preview scores from editAnswers for the subtotal row
  const displayAnswers = isEditing ? editAnswers : assessment.answers;

  // Compute dimension scores from displayAnswers for live preview during edit
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
      {/* Back link */}
      <Link
        href={`/social-worker/case/${id}`}
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 text-sm"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回個案頁面
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">家庭財務韌性快速評估（六面向）</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>個案：<span className="text-foreground font-medium">{caseData.name}</span></span>
            <span>使用時機：<span className="text-foreground font-medium">T{assessmentIndex}</span></span>
            <span>評估日期：<span className="text-foreground font-medium">{new Date(assessment.date).toLocaleDateString('zh-TW')}</span></span>
            <span>總分：<span className="text-foreground font-semibold">{assessment.totalScore} 分</span></span>
            <span className="flex items-center gap-1.5">
              韌性等級：{getLevelBadge(assessment.level)}
              <span className="text-foreground">{getDetailedLevel(assessment.totalScore)}</span>
            </span>
          </div>
        </div>

        {/* Edit / Save / Cancel buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="w-4 h-4 mr-1" />
                取消
              </Button>
              <Button size="sm" onClick={saveEditing}>
                <Save className="w-4 h-4 mr-1" />
                儲存修改
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="w-4 h-4 mr-1" />
              編輯
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
              {/* Section header */}
              <div className="bg-muted px-4 py-2.5 flex items-center justify-between">
                <span className="font-semibold text-sm">
                  ▌ {dim}. {DIMENSION_LABELS[dim]}（滿分 {maxScore} 分）
                </span>
                <span className="text-xs text-muted-foreground">【{DIMENSION_ROLES[dim]}】</span>
              </div>

              {/* Questions table */}
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-3 py-2 font-medium w-[28%] border-r">評估題目</th>
                    <th className="text-left px-3 py-2 font-medium border-r">選項（請勾選最符合的一項）</th>
                    <th className="text-left px-3 py-2 font-medium w-[22%]">得分 / 備註</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, qi) => {
                    const selectedValue = displayAnswers[question.id];
                    const note =
                      selectedValue !== undefined
                        ? getQuestionNote(question.id, selectedValue)
                        : null;
                    const showAmountField = question.id === 'A1' || question.id === 'A3';
                    const savedAmount = assessment.fieldNotes?.[question.id] ?? '';

                    return (
                      <tr
                        key={question.id}
                        className={qi % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                      >
                        {/* Column 1: question title */}
                        <td className="px-3 py-2.5 align-top border-r border-border/50">
                          <div className="font-semibold text-foreground">
                            {question.id}　{QUESTION_SHORT_TITLES[question.id]}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            （滿分 {question.options[0].value} 分）
                          </div>
                        </td>

                        {/* Column 2: options */}
                        <td className="px-3 py-2.5 align-top border-r border-border/50">
                          {isEditing ? (
                            <RadioGroup
                              value={selectedValue?.toString()}
                              onValueChange={(val) =>
                                setEditAnswers((prev) => ({
                                  ...prev,
                                  [question.id]: parseInt(val),
                                }))
                              }
                              className="space-y-1.5"
                            >
                              {question.options.map((opt) => (
                                <div
                                  key={opt.value}
                                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                                    opt.value === selectedValue
                                      ? 'bg-primary/8 text-primary font-medium'
                                      : 'hover:bg-muted/50'
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={opt.value.toString()}
                                    id={`edit-${question.id}-${opt.value}`}
                                  />
                                  <Label
                                    htmlFor={`edit-${question.id}-${opt.value}`}
                                    className="cursor-pointer font-normal flex-1"
                                  >
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
                                  <div
                                    key={opt.value}
                                    className={`flex items-start gap-2 ${
                                      isSelected
                                        ? 'font-semibold text-primary'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    <span className="mt-px shrink-0 text-base leading-none">
                                      {isSelected ? '☑' : '☐'}
                                    </span>
                                    <span>
                                      {opt.label}（{opt.value} 分）
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Column 3: score + notes */}
                        <td className="px-3 py-2.5 align-top">
                          <div className="font-medium">
                            {question.id} 得分：
                            {selectedValue !== undefined ? selectedValue : '—'} 分
                          </div>
                          {showAmountField && (
                            <AmountField
                              questionId={question.id}
                              initialValue={savedAmount}
                              onSave={(val) => saveFieldNote(question.id, val)}
                            />
                          )}
                          {note && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 leading-snug">
                              ⚠ {note}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Subtotal row */}
                  <tr className="bg-primary/5 border-t font-semibold">
                    <td colSpan={2} className="px-3 py-2 border-r border-border/50 text-sm">
                      {dim}.面向小計
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {dim} 面向得分：{dimScore} / {maxScore} 分
                      {!isEditing && prevDimScore !== undefined && (
                        <span
                          className={`ml-2 text-xs font-normal ${
                            dimScore > prevDimScore
                              ? 'text-success'
                              : dimScore < prevDimScore
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}
                        >
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

        {/* Summary table — only shown in view mode */}
        {!isEditing && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2.5 font-semibold text-sm">綜合評分摘要</div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-left px-3 py-2 font-medium border-r">面向</th>
                  <th className="text-center px-3 py-2 font-medium border-r">本次得分</th>
                  {previousAssessment && (
                    <th className="text-center px-3 py-2 font-medium border-r">
                      上次得分（追蹤用）
                    </th>
                  )}
                  {previousAssessment && (
                    <th className="text-center px-3 py-2 font-medium">變化方向</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(['A', 'B', 'C', 'D', 'E', 'F'] as Dimension[]).map((dim, i) => {
                  const cur = assessment.dimensionScores[dim];
                  const prev = previousAssessment?.dimensionScores[dim];
                  return (
                    <tr key={dim} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="px-3 py-2 border-r">
                        {dim}.{DIMENSION_LABELS[dim]}
                      </td>
                      <td className="px-3 py-2 text-center border-r">
                        {cur}/{MAX_DIMENSION_SCORES[dim]}
                      </td>
                      {previousAssessment && (
                        <td className="px-3 py-2 text-center border-r">
                          {prev}/{MAX_DIMENSION_SCORES[dim]}
                        </td>
                      )}
                      {previousAssessment && (
                        <td
                          className={`px-3 py-2 text-center text-xs font-medium ${
                            prev !== undefined && cur > prev
                              ? 'text-success'
                              : prev !== undefined && cur < prev
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {getDimensionChangeLabel(cur, prev)}
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* Total row */}
                <tr className="bg-primary/5 border-t font-semibold">
                  <td className="px-3 py-2 border-r">總分</td>
                  <td className="px-3 py-2 text-center border-r">
                    {assessment.totalScore}/100
                  </td>
                  {previousAssessment && (
                    <td className="px-3 py-2 text-center border-r">
                      {previousAssessment.totalScore}/100
                    </td>
                  )}
                  {previousAssessment && (
                    <td
                      className={`px-3 py-2 text-center text-xs ${
                        assessment.totalScore > previousAssessment.totalScore
                          ? 'text-success'
                          : assessment.totalScore < previousAssessment.totalScore
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {getDimensionChangeLabel(
                        assessment.totalScore,
                        previousAssessment.totalScore
                      )}
                    </td>
                  )}
                </tr>

                {/* Level row */}
                <tr className="bg-muted/20">
                  <td className="px-3 py-2 border-r font-medium">韌性等級</td>
                  <td className="px-3 py-2 border-r">
                    <div className="flex items-center justify-center gap-2">
                      {getLevelBadge(assessment.level)}
                      <span className="text-xs text-muted-foreground">
                        {getDetailedLevel(assessment.totalScore)}
                      </span>
                    </div>
                  </td>
                  {previousAssessment && (
                    <td className="px-3 py-2 text-center border-r">
                      {getLevelBadge(previousAssessment.level)}
                    </td>
                  )}
                  {previousAssessment && <td className="px-3 py-2" />}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Save button at bottom in edit mode */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={cancelEditing}>
              <X className="w-4 h-4 mr-1" />
              取消
            </Button>
            <Button onClick={saveEditing}>
              <Save className="w-4 h-4 mr-1" />
              儲存修改
            </Button>
          </div>
        )}

        {/* Intervention Priorities — always visible, auto-saves on change */}
        {!isEditing && (() => {
          const priorities = assessment.interventionPriorities ?? { selected: [], otherChecked: false, other: '' };
          return (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2.5 font-semibold text-sm">
                優先介入面向識別
              </div>
              <div className="px-4 py-4 space-y-3">
                <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                  {INTERVENTION_OPTIONS.map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <Checkbox
                        id={`intervention-${assessmentId}-${opt}`}
                        checked={priorities.selected.includes(opt)}
                        onCheckedChange={() => toggleInterventionOption(opt)}
                      />
                      <Label
                        htmlFor={`intervention-${assessmentId}-${opt}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id={`intervention-${assessmentId}-other-check`}
                    checked={priorities.otherChecked}
                    onCheckedChange={toggleInterventionOther}
                  />
                  <Label
                    htmlFor={`intervention-${assessmentId}-other-check`}
                    className="text-sm font-normal shrink-0"
                  >
                    其他：
                  </Label>
                  <Input
                    value={priorities.other}
                    onChange={(e) => setInterventionOtherText(e.target.value)}
                    placeholder="請填寫"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Edit history */}
        {!isEditing && <EditHistorySection assessment={assessment} />}
      </div>
    </div>
  );
}
