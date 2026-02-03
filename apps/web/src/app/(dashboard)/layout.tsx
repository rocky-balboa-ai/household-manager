'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { Sidebar } from '@/components/navigation/sidebar';
import { useAuthStore, useHasHydrated } from '@/stores/auth';
import { socketClient } from '@/lib/socket';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useHasHydrated();
  const user = useAuthStore((s) => s.user);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client before checking auth
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only redirect after hydration is complete on client
    if (isClient && hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isClient, hasHydrated, isAuthenticated, router]);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      socketClient.connect(user.id, user.name);
    }

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, user]);

  // Show loading state while hydrating (client-side only)
  if (!isClient || !hasHydrated) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
