'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePublicAssessmentStore } from '@/lib/assessment-store';
import { ASSESSMENT_QUESTIONS } from '@/lib/assessment-questions';
import { DIMENSION_LABELS } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, CheckCircle2, BarChart3, Shield, TrendingUp } from 'lucide-react';

const ANALYZING_MESSAGES = [
  '正在分析您的財務韌性結構...',
  '評估各面向得分比重...',
  '比對財務韌性指標...',
  '生成個人化評估報告...',
  '即將完成，請稍候...',
];

export function QuestionsStep() {
  const { answers, setAnswer, setCurrentStep, clearAnswers, calculateAndSetResult } = usePublicAssessmentStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // 直接從 store 讀取當前題目的已選答案，避免 localAnswer 的同步時機問題
  const currentAnswer = answers[currentQuestion?.id];

  // Clear any previously persisted answers when entering the questions step
  useEffect(() => {
    clearAnswers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation: progress bar + message cycling during calculating phase
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
        calculateAndSetResult();
        setCurrentStep(3);
      }
    }, intervalMs);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [isCalculating, calculateAndSetResult, setCurrentStep]);

  const allAnswered = useMemo(
    () => ASSESSMENT_QUESTIONS.every((q) => answers[q.id] !== undefined),
    [answers]
  );

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentStep(1);
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

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] space-y-8 py-12">
        {/* Animated icon cluster */}
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1.2s' }} />
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-primary/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-10 h-10">
              <BarChart3 className="absolute inset-0 w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Floating icons */}
        <div className="relative w-full flex justify-center">
          <Shield className="absolute -left-2 top-0 w-5 h-5 text-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <CardDescription>請選擇最符合您情況的選項</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            key={currentQuestion.id}
            value={currentAnswer?.toString()}
            onValueChange={(value) => {
              const numValue = parseInt(value);
              setAnswer(currentQuestion.id, numValue);
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
        <Button variant="outline" onClick={handlePrevious} className="flex-1" size="lg">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentQuestionIndex === 0 ? '返回' : '上一題'}
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
            查看結果
            <CheckCircle2 className="w-4 h-4 ml-2" />
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
                : answers[q.id] !== undefined
                ? 'bg-primary/40'
                : 'bg-border'
            }`}
            aria-label={`跳至第 ${index + 1} 題`}
          />
        ))}
      </div>
    </div>
  );
}
