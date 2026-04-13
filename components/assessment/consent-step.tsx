'use client';

import { useState } from 'react';
import { usePublicAssessmentStore } from '@/lib/assessment-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, FileText, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ConsentStep() {
  const { userProfile, setUserProfile, setCurrentStep } = usePublicAssessmentStore();
  const [consentToShare, setConsentToShare] = useState(userProfile?.consentToShare || false);

  const handleNext = () => {
    if (userProfile) {
      setUserProfile({ ...userProfile, consentToShare });
    }
    setCurrentStep(2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>資料使用同意</CardTitle>
        <CardDescription>
          請閱讀以下說明，並決定是否同意分享您的評估結果
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-foreground">資料使用說明</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              您的評估結果將用於協助您了解家庭財務韌性狀況
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              所有資料將受到嚴格保密，僅供評估分析使用
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              如您選擇分享給社福單位，將有助於專業人員提供更適切的協助
            </li>
          </ul>
        </div>

        {userProfile?.hasSocialService && (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-card border border-border rounded-lg">
              <Checkbox
                id="consent"
                checked={consentToShare}
                onCheckedChange={(checked) => setConsentToShare(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="consent" className="cursor-pointer font-medium">
                  您是否願意將測驗結果提供給目前有服務您的社福單位參考？
                </Label>
                <p className="text-sm text-muted-foreground">
                  此資料僅於您同意時提供，將用於協助社工更了解您的狀況
                </p>
              </div>
            </div>
          </div>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            無論您是否選擇分享，評估結果都會立即顯示給您，並可下載保存
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(0)}
            className="flex-1"
            size="lg"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            上一步
          </Button>
          <Button onClick={handleNext} className="flex-1" size="lg">
            開始評估
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
