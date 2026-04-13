import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function SocialWorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/social-worker" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-semibold text-foreground">家庭財務韌性快速評估</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            返回首頁
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
