'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to dashboard when authenticated
      router.replace('/tasks');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </main>
  );
}
