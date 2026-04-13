'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePersonalStore } from '@/lib/personal-store';
import { ASSESSMENT_QUESTIONS } from '@/lib/assessment-questions';
import { DIMENSION_LABELS } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, CheckCircle2, Save, BarChart3, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const ANALYZING_MESSAGES = [
  '正在分析財務韌性結構...',
  '評估各面向得分比重...',
  '比對財務韌性指標...',
  '生成評估報告...',
  '即將完成，請稍候...',
];

export default function PersonalAssessPage() {
  const router = useRouter();
  const { profile, assessments, currentAnswers, setCurrentAnswer, submitAssessment, resetCurrentAnswers } =
    usePersonalStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    resetCurrentAnswers();
  }, [resetCurrentAnswers]);

  useEffect(() => {
    if (!isCalculating) return;
    const totalDuration = 4000;
    const intervalMs = 50;
    const steps = totalDuration / intervalMs;
    let step = 0;

    const progressTimer = setInterval(() => {
      step += 1;
      setCalcProgress(Math.min((step / steps) * 100, 100));
      if (step >= steps) {
        clearInterval(progressTimer);
        const result = submitAssessment();
        if (result) router.push('/personal');
      }
    }, intervalMs);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalculating]);

  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentAnswer = currentAnswers[currentQuestion?.id];

  const allAnswered = useMemo(
    () => ASSESSMENT_QUESTIONS.every((q) => currentAnswers[q.id] !== undefined),
    [currentAnswers]
  );

  const advanceAfterAnswer = (questionIndex: number) => {
    setTimeout(() => {
      if (questionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(questionIndex + 1);
      } else {
        setIsCalculating(true);
        setCalcProgress(0);
        setMessageIndex(0);
      }
    }, 400);
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">請先建立個人檔案</p>
            <Link href="/personal">
              <Button>返回設定</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[480px] space-y-8 py-12">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1.2s' }} />
              <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-primary/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
            <div className="relative w-full flex justify-center">
              <Shield className="absolute -left-4 top-0 w-5 h-5 text-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <TrendingUp className="absolute right-4 top-1 w-5 h-5 text-primary/40 animate-bounce" style={{ animationDelay: '0.6s' }} />
            </div>
            <div className="text-center space-y-2 px-4">
              <h3 className="text-xl font-semibold">分析中</h3>
              <p className="text-muted-foreground text-sm min-h-[20px] transition-all duration-500">
                {ANALYZING_MESSAGES[messageIndex]}
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <Progress value={calcProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{Math.round(calcProgress)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/personal"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回個人頁面
      </Link>

      <div className="space-y-6">
        {/* Info header */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{profile.name}</span>
              <span className="text-muted-foreground">第 T{assessments.length} 次評估</span>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              問題 {currentQuestionIndex + 1} / {totalQuestions}
            </span>
            <span className="text-sm text-muted-foreground">
              {DIMENSION_LABELS[currentQuestion.dimension]}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
              <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-xs">
                {currentQuestion.dimension}
              </div>
              {DIMENSION_LABELS[currentQuestion.dimension]}
            </div>
            <CardTitle className="text-lg leading-relaxed">{currentQuestion.text}</CardTitle>
            <CardDescription>請選擇最符合目前狀況的選項</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              key={currentQuestion.id}
              value={currentAnswer?.toString()}
              onValueChange={(value) => {
                const numValue = parseInt(value);
                setCurrentAnswer(currentQuestion.id, numValue);
                advanceAfterAnswer(currentQuestionIndex);
              }}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (currentAnswer === option.value) advanceAfterAnswer(currentQuestionIndex);
                  }}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                    currentAnswer === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem
                    value={option.value.toString()}
                    id={`option-${currentQuestion.id}-${option.value}`}
                  />
                  <Label
                    htmlFor={`option-${currentQuestion.id}-${option.value}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                  {currentAnswer === option.value && (
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
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex-1"
            size="lg"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            上一題
          </Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={currentAnswer === undefined}
              className="flex-1"
              size="lg"
            >
              下一題
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => { setIsCalculating(true); setCalcProgress(0); setMessageIndex(0); }}
              disabled={!allAnswered}
              className="flex-1"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              儲存評估
            </Button>
          )}
        </div>

        {/* Quick navigation dots */}
        <div className="flex flex-wrap justify-center gap-1.5 pt-2">
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
    </div>
  );
}
