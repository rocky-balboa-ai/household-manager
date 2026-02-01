'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { useAuthStore } from '@/stores/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <main className="pt-14 pb-20 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
