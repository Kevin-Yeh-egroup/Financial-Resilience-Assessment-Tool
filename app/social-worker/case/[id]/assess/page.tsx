'use client';

import { use, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocialWorkerStore } from '@/lib/assessment-store';
import { ASSESSMENT_QUESTIONS, calculateAssessmentResult } from '@/lib/assessment-questions';
import { DIMENSION_LABELS, type Dimension } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ResilienceRadarChart } from '@/components/assessment/radar-chart';
import { ChevronLeft, ChevronRight, CheckCircle2, User, Save } from 'lucide-react';
import Link from 'next/link';

export default function CaseAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { cases, currentAnswers, setCurrentAnswer, submitAssessment, resetCurrentAnswers } =
    useSocialWorkerStore();

  const caseData = cases.find((c) => c.id === id);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Reset answers when starting new assessment
  useEffect(() => {
    resetCurrentAnswers();
  }, [resetCurrentAnswers]);

  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const isCurrentAnswered = currentAnswers[currentQuestion?.id] !== undefined;
  const allAnswered = useMemo(
    () => ASSESSMENT_QUESTIONS.every((q) => currentAnswers[q.id] !== undefined),
    [currentAnswers]
  );

  // Live calculation
  const liveResult = useMemo(() => {
    if (Object.keys(currentAnswers).length === 0) return null;
    return calculateAssessmentResult(currentAnswers);
  }, [currentAnswers]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    const result = submitAssessment(id);
    if (result) {
      router.push(`/social-worker/case/${id}`);
    }
  };

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

  const assessmentNumber = caseData.assessments.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href={`/social-worker/case/${id}`}
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回個案頁面
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Info Header */}
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{caseData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    個案編號：{caseData.caseNumber} | 本次為第 {assessmentNumber + 1} 次評估 (T
                    {assessmentNumber})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Header */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                問題 {currentQuestionIndex + 1} / {totalQuestions}
              </span>
              <span className="text-sm text-muted-foreground">
                {DIMENSION_LABELS[currentQuestion.dimension]}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-xs">
                  {currentQuestion.dimension}
                </div>
                {DIMENSION_LABELS[currentQuestion.dimension]}
              </div>
              <CardTitle className="text-lg leading-relaxed">{currentQuestion.text}</CardTitle>
              <CardDescription>請選擇最符合個案情況的選項</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentAnswers[currentQuestion.id]?.toString()}
                onValueChange={(value) => setCurrentAnswer(currentQuestion.id, parseInt(value))}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                      currentAnswers[currentQuestion.id] === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`option-${option.value}`}
                    />
                    <Label
                      htmlFor={`option-${option.value}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                    {currentAnswers[currentQuestion.id] === option.value && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1"
              size="lg"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              上一題
            </Button>
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isCurrentAnswered}
                className="flex-1"
                size="lg"
              >
                下一題
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!allAnswered} className="flex-1" size="lg">
                <Save className="w-4 h-4 mr-2" />
                儲存評估
              </Button>
            )}
          </div>

          {/* Quick Navigation Dots */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-4">
            {ASSESSMENT_QUESTIONS.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary'
                    : currentAnswers[q.id] !== undefined
                    ? 'bg-primary/40'
                    : 'bg-border'
                }`}
                aria-label={`跳至第 ${index + 1} 題`}
              />
            ))}
          </div>
        </div>

        {/* Sidebar - Live Results */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">即時計算</CardTitle>
              <CardDescription>
                已回答 {Object.keys(currentAnswers).length} / {totalQuestions} 題
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dimension Scores */}
              <div className="space-y-3">
                {(Object.keys(DIMENSION_LABELS) as Dimension[]).map((dim) => {
                  const score = liveResult?.dimensionPercentages[dim] ?? 0;
                  return (
                    <div key={dim} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {dim}. {DIMENSION_LABELS[dim]}
                        </span>
                        <span className="font-medium text-foreground">{score}%</span>
                      </div>
                      <Progress value={score} className="h-1.5" />
                    </div>
                  );
                })}
              </div>

              {/* Total Score */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">總分</span>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {liveResult?.totalScore ?? 0} / 100
                  </Badge>
                </div>
              </div>

              {/* Live Radar Chart */}
              {liveResult && Object.keys(currentAnswers).length >= 6 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">即時雷達圖</p>
                  <ResilienceRadarChart
                    data={liveResult.dimensionPercentages}
                    height={200}
                    showTooltip={false}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
