'use client';

import { use, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocialWorkerStore } from '@/lib/assessment-store';
import { ASSESSMENT_QUESTIONS } from '@/lib/assessment-questions';
import { DIMENSION_LABELS } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, CheckCircle2, User, Save, BarChart3, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function CaseAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { cases, currentAnswers, setCurrentAnswer, submitAssessment, resetCurrentAnswers } =
    useSocialWorkerStore();

  const caseData = cases.find((c) => c.id === id);

  // 場次選擇：預設為下一個新場次（T0、T1、T2...）
  const defaultSession = `T${caseData?.assessments.length ?? 0}`;
  const [selectedSession, setSelectedSession] = useState<string>(defaultSession);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const ANALYZING_MESSAGES = [
    '正在分析財務韌性結構...',
    '評估各面向得分比重...',
    '比對財務韌性指標...',
    '生成評估報告...',
    '即將完成，請稍候...',
  ];

  // Reset answers when starting new assessment
  useEffect(() => {
    resetCurrentAnswers();
  }, [resetCurrentAnswers]);

  // Animation during calculating phase
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
        const result = submitAssessment(id, selectedSession);
        if (result) {
          router.push(`/social-worker/case/${id}`);
        }
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

  // 直接從 store 讀取當前題目的已選答案，避免 localAnswer 的同步時機問題
  const currentAnswer = currentAnswers[currentQuestion?.id];

  const allAnswered = useMemo(
    () => ASSESSMENT_QUESTIONS.every((q) => currentAnswers[q.id] !== undefined),
    [currentAnswers]
  );

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsCalculating(true);
    setCalcProgress(0);
    setMessageIndex(0);
  };

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

  // 可選場次：已有的 + 下一個新場次，最少顯示到 T3
  const maxSession = Math.max(assessmentNumber, 3);
  const sessionOptions = Array.from({ length: maxSession + 1 }, (_, i) => `T${i}`);
  const usedSessions = new Set(caseData.assessments.map((a) => a.sessionLabel ?? `T${caseData.assessments.indexOf(a)}`));

  if (isCalculating) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[480px] space-y-8 py-12">
            {/* Animated icon cluster */}
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1.2s' }} />
              <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-primary/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>

            {/* Floating icons */}
            <div className="relative w-full flex justify-center">
              <Shield className="absolute -left-4 top-0 w-5 h-5 text-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <TrendingUp className="absolute right-4 top-1 w-5 h-5 text-primary/40 animate-bounce" style={{ animationDelay: '0.6s' }} />
            </div>

            {/* Text */}
            <div className="text-center space-y-2 px-4">
              <h3 className="text-xl font-semibold text-foreground">分析中</h3>
              <p className="text-muted-foreground text-sm min-h-[20px] transition-all duration-500">
                {ANALYZING_MESSAGES[messageIndex]}
              </p>
            </div>

            {/* Progress bar */}
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
      {/* Back Button */}
      <Link
        href={`/social-worker/case/${id}`}
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回個案頁面
      </Link>

      <div className="space-y-6">
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
                  個案編號：{caseData.caseNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">評估場次</CardTitle>
            <CardDescription>請選擇本次評估所屬場次</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {sessionOptions.map((session) => {
                const isUsed = usedSessions.has(session);
                const isSelected = selectedSession === session;
                return (
                  <button
                    key={session}
                    type="button"
                    onClick={() => setSelectedSession(session)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/8 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {session}
                    {isUsed && !isSelected && (
                      <span className="text-xs text-muted-foreground/60">（已有）</span>
                    )}
                  </button>
                );
              })}
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
            <CardDescription>請選擇最符合個案目前狀況的選項</CardDescription>
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
                    if (currentAnswer === option.value) {
                      advanceAfterAnswer(currentQuestionIndex);
                    }
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
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={currentAnswer === undefined}
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
    </div>
  );
}
