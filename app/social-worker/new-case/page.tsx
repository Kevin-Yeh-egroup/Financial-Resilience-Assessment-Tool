'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocialWorkerStore } from '@/lib/assessment-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, UserPlus, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewCasePage() {
  const router = useRouter();
  const { addCase } = useSocialWorkerStore();

  const [formData, setFormData] = useState({
    caseNumber: `C${Date.now().toString().slice(-6)}`,
    name: '',
    birthYear: '',
    gender: '',
    contact: '',
    familySize: 1,
    childrenCount: 0,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '請輸入姓名';
    if (!formData.birthYear) newErrors.birthYear = '請選擇出生年';
    if (!formData.gender) newErrors.gender = '請選擇性別';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const caseId = addCase(formData);
      router.push(`/social-worker/case/${caseId}`);
    }
  };

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back Button */}
      <Link href="/social-worker" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回個案列表
      </Link>

      <Card>
        <CardHeader>
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-accent" />
          </div>
          <CardTitle>新增個案</CardTitle>
          <CardDescription>填寫個案基本資料以建立新的個案檔案</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Case Number */}
          <div className="space-y-2">
            <Label htmlFor="caseNumber">個案編號</Label>
            <Input
              id="caseNumber"
              value={formData.caseNumber}
              onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
              placeholder="自動生成"
            />
            <p className="text-xs text-muted-foreground">系統自動生成，可自行修改</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="請輸入個案姓名"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Birth Year & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>出生年 *</Label>
              <Select
                value={formData.birthYear}
                onValueChange={(value) => setFormData({ ...formData, birthYear: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇出生年" />
                </SelectTrigger>
                <SelectContent>
                  {birthYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} 年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.birthYear && <p className="text-sm text-destructive">{errors.birthYear}</p>}
            </div>
            <div className="space-y-2">
              <Label>性別 *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇性別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label htmlFor="contact">聯絡方式</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="電話或 Email"
            />
          </div>

          {/* Family Size & Children */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="familySize">家庭人口</Label>
              <Input
                id="familySize"
                type="number"
                min={1}
                value={formData.familySize}
                onChange={(e) =>
                  setFormData({ ...formData, familySize: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childrenCount">兒童人數</Label>
              <Input
                id="childrenCount"
                type="number"
                min={0}
                value={formData.childrenCount}
                onChange={(e) =>
                  setFormData({ ...formData, childrenCount: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="其他需要記錄的資訊..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Link href="/social-worker" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                取消
              </Button>
            </Link>
            <Button onClick={handleSubmit} className="flex-1" size="lg">
              <Save className="w-4 h-4 mr-2" />
              儲存個案
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
