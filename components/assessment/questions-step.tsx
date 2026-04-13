'use client';

import { useState, useMemo } from 'react';
import { usePublicAssessmentStore } from '@/lib/assessment-store';
import { ASSESSMENT_QUESTIONS } from '@/lib/assessment-questions';
import { DIMENSION_LABELS } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export function QuestionsStep() {
  const { answers, setAnswer, setCurrentStep, calculateAndSetResult } = usePublicAssessmentStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const isCurrentAnswered = answers[currentQuestion.id] !== undefined;
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

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    calculateAndSetResult();
    setCurrentStep(3);
  };

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
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value) => setAnswer(currentQuestion.id, parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                <Label
                  htmlFor={`option-${option.value}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
                {answers[currentQuestion.id] === option.value && (
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
