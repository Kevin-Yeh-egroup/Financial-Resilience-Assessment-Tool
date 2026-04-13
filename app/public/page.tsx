'use client';

import { usePublicAssessmentStore } from '@/lib/assessment-store';
import { UserInfoStep } from '@/components/assessment/user-info-step';
import { ConsentStep } from '@/components/assessment/consent-step';
import { QuestionsStep } from '@/components/assessment/questions-step';
import { PublicResultStep } from '@/components/assessment/public-result-step';
import { Progress } from '@/components/ui/progress';

const STEPS = ['基本資料', '資料同意', '問卷填寫', '評估結果'];

export default function PublicAssessmentPage() {
  const { currentStep } = usePublicAssessmentStore();
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Progress */}
      {currentStep < 3 && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <span
                key={step}
                className={`text-xs font-medium ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step Content */}
      {currentStep === 0 && <UserInfoStep />}
      {currentStep === 1 && <ConsentStep />}
      {currentStep === 2 && <QuestionsStep />}
      {currentStep === 3 && <PublicResultStep />}
    </div>
  );
}
