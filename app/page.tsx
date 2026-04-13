'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Shield, Heart, TrendingUp, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">財務韌性評估</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              家庭財務韌性快速評估
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
              透過六大面向評估，了解您的家庭財務韌性狀況，獲取專業建議與支援資源
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-chart-1/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">快速評估</h3>
              <p className="text-sm text-muted-foreground">20題問卷，約5-10分鐘完成</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">六大面向</h3>
              <p className="text-sm text-muted-foreground">全方位檢視財務健康狀況</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">專業建議</h3>
              <p className="text-sm text-muted-foreground">獲取個人化改善建議</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            請選擇您的身分
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Public User Card */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href="/public" className="absolute inset-0 z-10" />
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">一般民眾</CardTitle>
                <CardDescription>個人自我評估</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    引導式問卷填寫
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    即時查看評估結果
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    可選擇分享給社福單位
                  </li>
                </ul>
                <Button className="w-full group-hover:bg-primary/90" size="lg">
                  開始自我評估
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Social Worker Card */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href="/social-worker" className="absolute inset-0 z-10" />
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Briefcase className="w-7 h-7 text-accent" />
                </div>
                <CardTitle className="text-xl">社工人員</CardTitle>
                <CardDescription>專業個案管理</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    個案資料管理
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    歷史評估追蹤
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    完整報告匯出
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" size="lg">
                  進入個案管理
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Six Dimensions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-4">
            六大評估面向
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            全面性評估您的家庭財務韌性，涵蓋收支、儲蓄、借貸、規劃、保障與支持系統
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {[
              { label: 'A. 收支管理', color: 'bg-chart-1', icon: '💰' },
              { label: 'B. 儲蓄準備', color: 'bg-chart-2', icon: '🏦' },
              { label: 'C. 借貸管理', color: 'bg-chart-3', icon: '📊' },
              { label: 'D. 財務規劃', color: 'bg-chart-4', icon: '📋' },
              { label: 'E. 保險保障', color: 'bg-chart-5', icon: '🛡️' },
              { label: 'F. 支持系統', color: 'bg-chart-6', icon: '🤝' },
            ].map((dim) => (
              <div
                key={dim.label}
                className="bg-card rounded-xl p-4 text-center border border-border hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 ${dim.color}/10 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-xl">{dim.icon}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{dim.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            此工具僅供參考，如需專業財務諮詢，請洽詢相關專業人員
          </p>
        </div>
      </footer>
    </div>
  );
}
