'use client';

import { useState } from 'react';
import { usePublicAssessmentStore } from '@/lib/assessment-store';
import { AGE_RANGES, LOCATIONS } from '@/lib/assessment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronRight, User } from 'lucide-react';

export function UserInfoStep() {
  const { setUserProfile, setCurrentStep } = usePublicAssessmentStore();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    ageRange: '',
    location: '',
    hasSocialService: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '請輸入姓名';
    if (!formData.contact.trim()) newErrors.contact = '請輸入聯絡方式';
    if (!formData.ageRange) newErrors.ageRange = '請選擇年齡區間';
    if (!formData.location) newErrors.location = '請選擇居住地';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setUserProfile({
        ...formData,
        consentToShare: false,
      });
      setCurrentStep(1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>基本資料</CardTitle>
        <CardDescription>
          請填寫以下基本資料，以便我們提供更準確的評估結果
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            placeholder="請輸入您的姓名"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <Label htmlFor="contact">聯絡方式（電話或 Email）</Label>
          <Input
            id="contact"
            placeholder="請輸入電話或 Email"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />
          {errors.contact && <p className="text-sm text-destructive">{errors.contact}</p>}
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label>年齡區間</Label>
          <Select
            value={formData.ageRange}
            onValueChange={(value) => setFormData({ ...formData, ageRange: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="請選擇年齡區間" />
            </SelectTrigger>
            <SelectContent>
              {AGE_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ageRange && <p className="text-sm text-destructive">{errors.ageRange}</p>}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>居住地</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => setFormData({ ...formData, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="請選擇居住地" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
        </div>

        {/* Has Social Service */}
        <div className="space-y-3">
          <Label>是否目前有社福單位服務？</Label>
          <RadioGroup
            value={formData.hasSocialService ? 'yes' : 'no'}
            onValueChange={(value) =>
              setFormData({ ...formData, hasSocialService: value === 'yes' })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="service-yes" />
              <Label htmlFor="service-yes" className="font-normal cursor-pointer">
                有
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="service-no" />
              <Label htmlFor="service-no" className="font-normal cursor-pointer">
                沒有
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          下一步
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
