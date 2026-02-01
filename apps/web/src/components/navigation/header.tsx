'use client';

import { useAuthStore } from '@/stores/auth';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export function Header({ title }: HeaderProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          {user && (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {user.name[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
