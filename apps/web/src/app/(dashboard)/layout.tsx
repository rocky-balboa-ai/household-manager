'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { Sidebar } from '@/components/navigation/sidebar';
import { useAuthStore } from '@/stores/auth';
import { socketClient } from '@/lib/socket';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      socketClient.connect(user.id, user.name);
    }

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="pt-14 pb-20 px-4 md:pt-6 md:pb-6 md:pl-72 md:pr-6 lg:pr-8">
        <div className="md:max-w-6xl">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
