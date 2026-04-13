import { Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/personal" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">家庭財務韌性快速評估</span>
          </Link>
          <Link
            href="/social-worker"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition-colors hover:bg-muted/50"
          >
            <Users className="w-3.5 h-3.5" />
            社工版
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
